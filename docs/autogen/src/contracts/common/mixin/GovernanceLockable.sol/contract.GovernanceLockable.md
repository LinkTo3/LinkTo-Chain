# GovernanceLockable
[Git Source](https://github.com/TOKnetwork/contracts/blob/155f729fd8db0676297384375468d4d45b8aa44e/contracts/common/mixin/GovernanceLockable.sol)

**Inherits:**
[Lockable](/contracts/common/mixin/Lockable.sol/contract.Lockable.md), [Governable](/contracts/common/governance/Governable.sol/contract.Governable.md)


## Functions
### constructor


```solidity
constructor(address governance) public Governable(governance);
```

### lock


```solidity
function lock() public onlyGovernance;
```

### unlock


```solidity
function unlock() public onlyGovernance;
```

