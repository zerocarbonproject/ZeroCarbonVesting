pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/BasicToken.sol";

// mock class using ERC20
contract ERC20Mock is BasicToken {

    constructor(address initialAccount, uint256 initialBalance) public {
        balances[initialAccount] = initialBalance;
        totalSupply_ = initialBalance;
    }

}