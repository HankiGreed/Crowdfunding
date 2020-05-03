import web3 from './web3';
import CrowdfundingABI from './CrowdfundingABI';

export const createContract = (contractAddress) => {
  return new web3.eth.Contract(CrowdfundingABI, contractAddress);
};
