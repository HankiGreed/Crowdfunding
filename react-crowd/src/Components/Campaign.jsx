import React, {Component} from 'react';
import {createContract} from '../Ethereum/CrowdfundingContract';
import CrowdfundingABI from '../Ethereum/CrowdfundingABI';
import web3 from '../Ethereum/web3';
import {Table, Button, Input} from 'semantic-ui-react';

class Campaign extends Component {
  constructor(props) {
    super(props);

    this.state = {
      campaign: {
        name: 'NA',
        targetAmount: 0,
        totalCollected: 0,
        campaignFinished: false,
        deadline: new Date(0),
        isBeneficiary: false,
        state: 0,
      },
      contributionAmount: '0',
    };
    this.onContribute = this.onContribute.bind(this);
    this.postCampaignInterface = this.postCampaignInterface.bind(this);
    this.finishCrowdfunding = this.finishCrowdfunding.bind(this);
    this.collectFunds = this.collectFunds.bind(this);
  }
  async componentDidMount() {
    let newState = await this.getCampaignDetails();
    this.setState({campaign: newState});
  }

  async collectFunds() {
    const contract = createContract(
      this.props.match.params.address,
      CrowdfundingABI,
    );
    const accounts = await web3.eth.getAccounts();
    await contract.methods.collect().send({from: accounts[0]});
  }
  /*function to get campaign details */
  async getCampaignDetails() {
    const contract = createContract(
      this.props.match.params.address,
      CrowdfundingABI,
    );
    const name = await contract.methods.name().call();
    const targetAmount = await contract.methods.targetAmount().call();
    const totalCollected = await contract.methods.totalCollected().call();
    const beforeDeadline = await contract.methods.beforeDeadline().call();
    const beneficiary = await contract.methods.beneficiary().call();
    const deadlineInSeconds = await contract.methods.fundingDeadline().call();
    const state = await contract.methods.state().call();
    let deadlineDate = new Date(0);
    const accounts = await web3.eth.getAccounts();

    console.log(accounts);
    console.log(beneficiary.toLowerCase(), accounts[0].toLowerCase());
    deadlineDate.setUTCSeconds(deadlineInSeconds);
    return {
      name: name,
      targetAmount: targetAmount,
      totalCollected: totalCollected,
      campaignFinished: !beforeDeadline,
      deadline: deadlineDate,
      state: state,
      beneficiary: beneficiary.toLowerCase(),
      isBeneficiary: beneficiary.toLowerCase() === accounts[0].toLowerCase(),
    };
  }

  async onContribute() {
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    const amount = web3.utils.toWei(this.state.contributionAmount, 'ether');
    const contract = createContract(
      this.props.match.params.address,
      CrowdfundingABI,
    );

    await contract.methods.contribute().send({
      from: accounts[0],
      value: amount,
    });
  }

  contributeInterface() {
    return (
      <React.Fragment>
        <Input
          action={{
            color: 'blue',
            content: 'Contribute',
            onClick: this.onContribute,
          }}
          actionPosition="left"
          label="ETH"
          labelPosition="right"
          placeholder="1"
          onChange={(e) => this.setState({contributionAmount: e.target.value})}
        />
      </React.Fragment>
    );
  }
  async finishCrowdfunding() {
    const contract = createContract(
      this.props.match.params.address,
      CrowdfundingABI,
    );
    const accounts = await web3.eth.getAccounts();
    await contract.methods.finishCrowdFunding().send({from: accounts[0]});
  }
  postCampaignInterface() {
    //console.log(
    //this.state.campaign.state == this.ONGOING_STATE,
    //typeof this.ONGOING_STATE,
    //this.ONGOING_STATE,
    //);
    //
    if (this.state.campaign.state === '0') {
      return (
        <Button type="submit" positive onClick={this.finishCrowdfunding()}>
          Finish Campaign
        </Button>
      );
    }

    if (
      this.state.campaign.state === '2' &&
      this.state.campaign.isBeneficiary
    ) {
      return (
        <Button type="submit" negative onClick={this.collectFunds}>
          Collect Funds
        </Button>
      );
    }
    if (this.state.campaign.state === '1') {
      return (
        <Button type="submit" negative>
          Refund
        </Button>
      );
    }
  }

  contractInterface() {
    if (this.state.campaign.campaignFinished) {
      return this.postCampaignInterface();
    } else {
      return this.contributeInterface();
    }
  }
  campaignActive() {
    return (
      <Table color={'blue'} striped>
        <Table.Header>
          <Table.HeaderCell>Field</Table.HeaderCell>
          <Table.HeaderCell>Value</Table.HeaderCell>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>Name</Table.Cell>
            <Table.Cell>{this.state.campaign.name}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Target Amount (In wei)</Table.Cell>
            <Table.Cell>{this.state.campaign.targetAmount}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Total Collection</Table.Cell>
            <Table.Cell>{this.state.campaign.totalCollected}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Campaign Deadline</Table.Cell>
            <Table.Cell>{this.state.campaign.deadline.toString()}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Has Finished ? </Table.Cell>
            <Table.Cell>
              {this.state.campaign.campaignFinished.toString()}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="2">
              {this.contractInterface()}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
  render() {
    return this.campaignActive();
    //return <h1>Campaign {this.props.match.params.address}</h1>;
  }
}

export default Campaign;
