pragma solidity ^0.4.24;

import "./IZCDistribution.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";

/**
 * @title ZCVesting
 * 
 * Used to hold tokens and release once configured amount has been released to consumers.
 *
 * 10% of initial tokens in contract can be claimed for every 15 million tokens that are distributed to consumers.
 * After 150 million tokens are distributed consumer the full balanceof the vesting contract is transferable.
 *
 * (c) Philip Louw / Zero Carbon Project 2018. The MIT Licence.
 */
contract ZCVesting {

    using SafeMath for uint256;

    // Total amount of tokens released
    uint256 public releasedAmount = 0;
    // Address of the Token
    ERC20Basic public token;
    // Address of the Distribution Contract
    IZCDistribution public dist;
    // Release to Address
    address public releaseAddress;

    // Every amount of tokens to release funds
    uint256 internal constant STEP_DIST_TOKENS = 15000000 * (10**18);
    // Max amount of tokens before all is released
    uint256 internal constant MAX_DIST_TOKENS = 150000000 * (10**18);

    /**
     * @param _tokenAddr The Address of the Token
     * @param _distAddr The Address of the Distribution contract
     * @param _releaseAddr The Address where to release funds to
     */
    constructor(ERC20Basic _tokenAddr, IZCDistribution _distAddr, address _releaseAddr) public {
        assert(_tokenAddr != address(0));
        assert(_distAddr != address(0));
        assert(_releaseAddr != address(0));
        token = _tokenAddr;
        dist = _distAddr;
        releaseAddress = _releaseAddr;
    }

    /**
     * @dev Event when Tokens are released
     * @param releaseAmount Amount of tokens released
     */
    event TokenReleased(uint256 releaseAmount);


    /**
     * @dev Releases the current allowed amount to the releaseAddress. Returns the amount released    
     */
    function release() public  returns (uint256) {
        
        uint256 distAmount = dist.getSentAmount();
        if (distAmount < STEP_DIST_TOKENS) 
            return 0;

        uint256 currBalance = token.balanceOf(address(this));

        if (distAmount >= MAX_DIST_TOKENS) {
            assert(token.transfer(releaseAddress, currBalance));
            releasedAmount = releasedAmount.add(currBalance);
            return currBalance;
        }

        uint256 releaseAllowed = currBalance.add(releasedAmount).div(10).mul(distAmount.div(STEP_DIST_TOKENS));

        if (releaseAllowed <= releasedAmount)
            return 0;

        uint256 releaseAmount = releaseAllowed.sub(releasedAmount);
        releasedAmount = releasedAmount.add(releaseAmount);
        assert(token.transfer(releaseAddress, releaseAmount));
        emit TokenReleased(releaseAmount);
        return releaseAmount;
    }

    /**
    * @dev Returns the token balance of this ZCVesting contract
    */
    function currentBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }
}