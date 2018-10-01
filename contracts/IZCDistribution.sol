pragma solidity ^0.4.24;

/**
 * @title IZCDistribution
 * 
 * Interface for the ZCDistribuition contract
 *
 * (c) Philip Louw / Zero Carbon Project 2018. The MIT Licence.
 */
interface IZCDistribution {

    /**
     * @dev Returns the Amount of tokens issued to consumers 
     */
    function getSentAmount() external pure returns (uint256);
}