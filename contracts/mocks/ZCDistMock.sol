pragma solidity ^0.4.24;

import "../IZCDistribution.sol";

contract ZCDistMock is IZCDistribution {

    uint256 amount;

    function getSentAmount() public returns (uint256) {
        return amount;
    }

    function setSentAmount(uint256 _amount) public {
        amount = _amount;
    }
}