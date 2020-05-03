pragma solidity ^0.6.1;

import "./CrowdFundingWithDeadline.sol";

contract TestCrowdFundingWithDeadline is CrowdFundingWithDeadline {

    uint time;
    
    constructor (
        string memory contractName,
        uint targetAmountEth,
        uint durationInMin,
        uint beneficiaryAddress
    ) 
        CrowdFundingWithDeadline(contractName,targetAmountEth,durationInMin,beneficiaryAddress)
        public 
    {
    }

    function currentTime() override internal view returns(uint) {
        return time;
    }

    function setCurrentTime(uint newTime) public {
        time = newTime;
    }
}
