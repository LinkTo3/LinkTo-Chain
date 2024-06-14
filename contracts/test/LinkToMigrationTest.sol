// SPDX-License-Identifier: MIT
pragma solidity ^0.5.2;

import {IERC20} from "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

// this impl was shortened for testing purposes
// full impl at https://github.com/0xLinkTo/indicia/blob/main/src/LinkToMigration.sol
contract LinkToMigrationTest {
    using SafeERC20 for IERC20;

    event Migrated(address indexed account, uint256 amount);

    IERC20 public polygon;
    IERC20 public TOK;

    function setTokenAddresses(address TOK_, address polygon_) external {
        if (TOK_ == address(0)) revert();
        TOK = IERC20(TOK_);

        if (polygon_ == address(0)) revert();
        polygon = IERC20(polygon_);
    }

    /// @notice This function allows for migrating TOK tokens to POL tokens
    /// @dev The function does not do any validation since the migration is a one-way process
    /// @param amount Amount of TOK to migrate
    function migrate(uint256 amount) external {
        emit Migrated(msg.sender, amount);

        TOK.safeTransferFrom(msg.sender, address(this), amount);
        polygon.safeTransfer(msg.sender, amount);
    }
}
