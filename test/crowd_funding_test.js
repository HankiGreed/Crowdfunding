let CrowdFundingWithDeadline = artifacts.require(
  'TestCrowdFundingWithDeadline',
);

contract('CrowdFundingWithDeadline', (accounts) => {
  let contract;
  let contractCreator = accounts[0];
  console.log(accounts[1]);
  let beneficiary = accounts[1];

  const ONE_ETH = 1e18;
  const ONGOING_STATE = 0;
  const FAILED_STATE = 1;
  const SUCCEEDED_STATE = 2;
  const PAIDOUT_STATE = 3;

  beforeEach(async () => {
    contract = await CrowdFundingWithDeadline.new(
      'Some Noble Cause',
      1,
      10,
      beneficiary,
      {
        from: contractCreator,
        gas: 2000000,
      },
    );
  });

  it("Should've been initialized properly", async () => {
    let campaignName = await contract.name.call();
    expect(campaignName).to.equal('Some Noble Cause');

    let etherAmount = web3.utils.toBN('1000000000000000000');
    let targetAmount = await contract.targetAmount.call();
    expect(targetAmount).to.deep.equal(etherAmount);

    let fundingDeadline = await contract.fundingDeadline.call();
    expect(fundingDeadline.toNumber()).to.equal(600);

    let actualBeneficiary = await contract.beneficiary.call();
    expect(actualBeneficiary).to.equal(beneficiary);

    let state = await contract.state.call();
    expect(state.valueOf().toNumber()).to.equal(ONGOING_STATE);
  });

  it('Should accept funds correctly', async () => {
    let etherAmount = web3.utils.toBN('1000000000000000000');
    await contract.contribute({value: ONE_ETH, from: contractCreator});
    let amount = await contract.amounts.call(contractCreator);
    expect(amount).to.deep.equal(etherAmount);

    let totalCollected = await contract.totalCollected.call();
    expect(totalCollected).to.deep.equal(etherAmount);
  });

  it('Should not allow contributions after deadline', async () => {
    const ERROR_MSG =
      'Returned error: VM Exception while processing transaction: revert Funding Deadline is Over ! -- Reason given: Funding Deadline is Over !.';
    try {
      await contract.setCurrentTime(601);
      await contract.contribute({value: ONE_ETH, from: contractCreator});
      expect.fail();
    } catch (error) {
      expect(error.message).to.equal(ERROR_MSG);
    }
  });

  it('Should change state to succeeded', async () => {
    await contract.contribute({value: ONE_ETH, from: contractCreator});
    await contract.setCurrentTime(601);
    await contract.finishCrowdFunding();

    let state = await contract.state.call();
    expect(state.valueOf().toNumber()).to.equal(SUCCEEDED_STATE);
  });
  it('Should change state to Failed', async () => {
    await contract.setCurrentTime(601);
    await contract.finishCrowdFunding();

    let state = await contract.state.call();
    expect(state.valueOf().toNumber()).to.equal(FAILED_STATE);
  });

  it('Should send the funds to the beneficiary', async () => {
    await contract.contribute({value: ONE_ETH, from: contractCreator});
    await contract.setCurrentTime(601);
    await contract.finishCrowdFunding();

    let balanceBefore = await web3.eth.getBalance(beneficiary);
    await contract.collect({from: contractCreator});

    let balanceAfter = await web3.eth.getBalance(beneficiary);
    expect(balanceAfter - balanceBefore).to.equal(ONE_ETH);

    let state = await contract.state.call();
    expect(state.valueOf().toNumber()).to.equal(PAIDOUT_STATE);
  });

  it('Should let withdrawal occur', async () => {
    await contract.contribute({value: ONE_ETH - 1e5, from: contractCreator});
    await contract.setCurrentTime(601);
    await contract.finishCrowdFunding();
    await contract.withdraw({from: contractCreator});

    let amount = await contract.amounts.call(contractCreator);
    expect(amount.toNumber()).to.equal(0);
  });
});
