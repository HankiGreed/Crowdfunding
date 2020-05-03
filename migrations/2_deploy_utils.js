let Utils = artifacts.require('Utils.sol');
let CrowdFundingWithDeadline = artifacts.require('CrowdFundingWithDeadline');
let TestCrowdFundingWithDeadline = artifacts.require(
  'TestCrowdFundingWithDeadline',
);

module.exports = async (deployer) => {
  await deployer.deploy(Utils);
  deployer.link(Utils, CrowdFundingWithDeadline);
  deployer.link(Utils, TestCrowdFundingWithDeadline);
};
