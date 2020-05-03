let CrowdFundingWithDeadline = artifacts.require('CrowdFundingWithDeadline');

module.exports = async (deployer) => {
  deployer.deploy(
    CrowdFundingWithDeadline,
    'Test Campaign',
    1,
    5,
    '0x84a08BDB59B0ed76eaff1B774c5E2101E9785b9F',
  );
};
