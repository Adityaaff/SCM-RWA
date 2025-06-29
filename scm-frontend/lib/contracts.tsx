import { ethers } from 'ethers';
import { DEXMarketplace } from './DEXMarketplace.abi'; 

const CONTRACT_ADDRESS = '0xYourContractAddressHere';

export async function getContract(signer: ethers.Signer): Promise<ethers.Contract> {
  return new ethers.Contract(CONTRACT_ADDRESS, DEXMarketplace.abi, signer);
}