# LinkToMigrationTest
[Git Source](https://github.com/TOKnetwork/contracts/blob/155f729fd8db0676297384375468d4d45b8aa44e/contracts/test/LinkToMigrationTest.sol)


## State Variables
### polygon

```solidity
IERC20 public polygon;
```


### TOK

```solidity
IERC20 public TOK;
```


## Functions
### setTokenAddresses


```solidity
function setTokenAddresses(address TOK_, address polygon_) external;
```

### migrate

This function allows for migrating TOK tokens to POL tokens

*The function does not do any validation since the migration is a one-way process*


```solidity
function migrate(uint256 amount) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`amount`|`uint256`|Amount of TOK to migrate|


## Events
### Migrated

```solidity
event Migrated(address indexed account, uint256 amount);
```

