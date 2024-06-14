import * as utils from '../../helpers/utils.js'
import deployer from '../../helpers/deployer.js'
import chaiAsPromised from 'chai-as-promised'
import * as chai from 'chai'
import StatefulUtils from '../../helpers/StatefulUtils.js'

import * as predicateTestUtils from './predicates/predicateTestUtils.js'
import ethUtils from 'ethereumjs-util'
import crypto from 'crypto'
import hardhat from 'hardhat'
const ethers = hardhat.ethers

chai.use(chaiAsPromised).should()
const assert = chai.assert

describe('DepositManagerUpdate @skip-on-coverage', async function () {
  let accounts,
    depositManager,
    childContracts,
    registry,
    governance,
    TOK,
    polygonMigrationTest,
    pol,
    statefulUtils,
    contracts
  const amount = web3.utils.toBN('10').pow(web3.utils.toBN('18'))

  describe('test POL and TOK behaviours', async function () {
    before(async () => {
      accounts = await ethers.getSigners()
      accounts = accounts.map((account) => {
        return account.address
      })

      statefulUtils = new StatefulUtils()
    })

    beforeEach(async function () {
      contracts = await deployer.freshDeploy(accounts[0])
      contracts.ERC20Predicate = await deployer.deployErc20PredicateBurnOnly()
      depositManager = contracts.depositManager
      registry = contracts.registry
      governance = contracts.governance
      childContracts = await deployer.initializeChildChain()

      TOK = await deployer.deployTOKToken()
      await governance.update(
        registry.address,
        registry.interface.encodeFunctionData('updateContractMap', [
          ethUtils.keccak256('TOK'),
          TOK.rootERC20.address
        ])
      )

      // deploy LinkToMigration test impl
      polygonMigrationTest = await (await ethers.deployContract('LinkToMigrationTest')).deployed()

      await governance.update(
        registry.address,
        registry.interface.encodeFunctionData('updateContractMap', [
          ethUtils.keccak256('polygonMigration'),
          polygonMigrationTest.address
        ])
      )

      pol = await (await ethers.deployContract('TestToken', ['LinkTo Ecosystem Token', 'POL'])).deployed()

      await governance.update(
        registry.address,
        registry.interface.encodeFunctionData('updateContractMap', [ethUtils.keccak256('pol'), pol.address])
      )

      await polygonMigrationTest.setTokenAddresses(TOK.rootERC20.address, pol.address)

      deployer.mapToken(pol.address, TOK.childToken.address)

      // mint POL to LinkToMigrationTest
      await pol.mint(polygonMigrationTest.address, amount.toString())
    })

    it('converts TOK to POL using governance function', async () => {
      // mint TOK to depositManager
      await TOK.rootERC20.mint(depositManager.address, amount.toString())

      // call migrateTOK using governance
      await governance.update(
        depositManager.address,
        depositManager.interface.encodeFunctionData('migrateTOK', [amount.toString()])
      )

      // check that TOK balance has been converted to POL
      const currentBalance = await pol.balanceOf(depositManager.address)
      utils.assertBigNumberEquality(currentBalance, amount)
    })

    it('migrates to POL when depositing TOK', async () => {
      // deposit some TOK
      const bob = '0x' + crypto.randomBytes(20).toString('hex')
      await utils.deposit(depositManager, childContracts.childChain, TOK.rootERC20, bob, amount, {
        rootDeposit: true,
        erc20: true
      })

      // check that TOK balance has been converted to POL
      const currentBalance = await pol.balanceOf(depositManager.address)
      utils.assertBigNumberEquality(currentBalance, amount)

      // assert deposit on child chain
      const childChainTOKBalance = await TOK.childToken.balanceOf(bob)
      utils.assertBigNumberEquality(childChainTOKBalance, amount)
    })

    it('bridges TOK when depositing POL', async () => {
      const bob = '0x' + crypto.randomBytes(20).toString('hex')

      // using the utils function more granularly here so we can call fireDepositFromMainToTOK with the correct token address
      const newDepositBlockEvent = await utils.depositOnRoot(depositManager, pol, bob, amount.toString(), {
        rootDeposit: true,
        erc20: true
      })

      assert.strictEqual(newDepositBlockEvent.args.token, TOK.rootERC20.address)

      await (
        await utils.fireDepositFromMainToTOK(
          childContracts.childChain,
          '0xa',
          bob,
          TOK.rootERC20.address,
          amount,
          newDepositBlockEvent.args.depositBlockId
        )
      ).wait()

      // deposit on child chain is technically still in TOK
      utils.assertBigNumberEquality(await TOK.childToken.balanceOf(bob), amount)
    })

    it('returns POL when withdrawing TOK', async () => {
      // in order to send from a different address we connect the ContractFactory to a new Signer
      const childSigner1 = TOK.childToken.provider.getSigner(1)
      const childToken1 = TOK.childToken.connect(childSigner1)
      const account1 = await childSigner1.getAddress()

      // deposit some TOK
      await utils.deposit(depositManager, childContracts.childChain, TOK.rootERC20, account1, amount, {
        rootDeposit: true,
        erc20: true
      })

      // withdraw again
      const receipt = await (await childToken1.withdraw(amount.toString(), { value: amount.toString() })).wait()

      // submit checkpoint
      let { block, blockProof, headerNumber, reference } = await statefulUtils.submitCheckpoint(
        contracts.rootChain,
        receipt,
        accounts
      )

      const rootSigner1 = contracts.ERC20Predicate.provider.getSigner(1)
      const eRC20Predicate1 = contracts.ERC20Predicate.connect(rootSigner1)

      // call ERC20Predicate
      await utils.startExitWithBurntTokens(eRC20Predicate1, {
        headerNumber,
        blockProof,
        blockNumber: block.number,
        blockTimestamp: block.timestamp,
        reference,
        logIndex: 1
      })

      // process Exits for TOK
      await predicateTestUtils.processExits(contracts.withdrawManager, TOK.rootERC20.address)

      // POL was received
      utils.assertBigNumberEquality(await pol.balanceOf(account1), amount)
    })
  })
})
