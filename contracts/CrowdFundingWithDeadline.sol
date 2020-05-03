pragma solidity ^0.6.0;

import "./Utils.sol";

contract CrowdFundingWithDeadline {

    using Utils for *;
    enum State {Ongoing, Failed, Succeeded, PaidOut}

    string public name;
    uint public targetAmount;
    uint public fundingDeadline;
    address payable  public beneficiary;
    State public state;
    mapping(address => uint) public amounts;
    bool public collected;
    uint public totalCollected;


    event CampaignFinished(
        address addr,
        uint totalCollected,
        bool succeeded
    );

    modifier inState (State expectedState) {
        require(state == expectedState,"Invalid State !");
        _;
    }

    constructor (
        string memory contractName,
        uint targetAmountEth,
        uint durationInMin,
        uint beneficiaryAddress
    ) 
        public 
    {
        name = contractName;
        targetAmount = Utils.etherToWei(targetAmountEth); 
        fundingDeadline = currentTime() + Utils.minutesToSeconds(durationInMin);
        beneficiary = address(beneficiaryAddress);
        state = State.Ongoing;
    }

    function contribute() public payable inState(State.Ongoing) {
        require(beforeDeadline(),"Funding Deadline is Over !");
        amounts[msg.sender] += msg.value;
        totalCollected += msg.value;

        if (totalCollected >= targetAmount) {
            collected = true;
        }
    }

    function finishCrowdFunding () public inState(State.Ongoing) {
        require(!beforeDeadline(),"Cant end campaign before deadline !");  

        if (collected) {
            state = State.Succeeded;
        } else {
            state = State.Failed;
        }
        emit CampaignFinished(address(this),totalCollected,collected); 
    }


    function collect() public inState(State.Succeeded) {
        if (beneficiary.send(totalCollected)){
            state = State.PaidOut;
        } else {
            state = State.Failed;
        }
    }

    function withdraw () public inState(State.Failed) {
        require(amounts[msg.sender] > 0, "You didnt contribute !" );

        uint contributed = amounts[msg.sender];
        amounts[msg.sender] = 0;

        if (!msg.sender.send(contributed)) {
            amounts[msg.sender] = contributed;
        }
    }
    function currentTime() internal view virtual returns(uint) {
        return now;
    }

    function beforeDeadline() public view returns(bool) {
        return currentTime() < fundingDeadline;
    }
}
