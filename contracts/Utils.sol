pragma solidity ^0.6.0;


library Utils {
    function etherToWei(uint inEth) public pure returns(uint) {
        return inEth * 1 ether;
    }

    function minutesToSeconds(uint inMin) public pure returns(uint) {
        return inMin * 1 minutes;
    }
}


