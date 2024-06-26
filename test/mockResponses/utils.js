import MerkleTree from '../helpers/merkle-tree.js'

import * as Proofs from '../helpers/proofs.js'
import { getBlockHeader } from '../helpers/blocks.js'
import * as chai from 'chai'

const assert = chai.assert


let headerNumber = 0
export async function build(event) {
  let blockHeader = getBlockHeader(event.block)
  let tree = new MerkleTree([blockHeader])
  let receiptProof = await Proofs.getReceiptProof(event.receipt, event.block, null /* web3 */, [event.receipt])
  let txProof = await Proofs.getTxProof(event.tx, event.block)
  assert.ok(
    Proofs.verifyTxProof(receiptProof),
    'verify receipt proof failed in js'
  )
  headerNumber += 1
  return {
    header: { number: headerNumber, root: tree.getRoot(), start: event.receipt.blockNumber },
    receipt: Proofs.getReceiptBytes(event.receipt), // rlp encoded
    receiptParentNodes: receiptProof.parentNodes,
    tx: Proofs.getTxBytes(event.tx), // rlp encoded
    txParentNodes: txProof.parentNodes,
    path: receiptProof.path,
    number: event.receipt.blockNumber,
    timestamp: event.block.timestamp,
    transactionsRoot: Buffer.from(event.block.transactionsRoot.slice(2), 'hex'),
    receiptsRoot: Buffer.from(event.block.receiptsRoot.slice(2), 'hex'),
    proof: await tree.getProof(blockHeader)
  }
}