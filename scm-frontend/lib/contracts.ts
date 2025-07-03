import { ethers } from 'ethers';
import { DEXMarketplace } from './DEXMarketplace.abi'; 

const CONTRACT_ADDRESS = '0x16B8024A575DF7De1471ECA576a7e65c86747a74';

export async function getContract(signer: ethers.Signer): Promise<ethers.Contract> {
  return new ethers.Contract(CONTRACT_ADDRESS, DEXMarketplace.abi, signer);
}