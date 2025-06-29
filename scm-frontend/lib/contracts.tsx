// lib/contracts.ts
import { ethers } from 'ethers';
import { DEXMarketplace } from './DEXMarketplace.abi'; // ABI (see below)
import { targetChain } from '../lib/utils';

const CONTRACT_ADDRESS = '0xYourContractAddressHere'; // Update with actual address

export async function getContract(signer: ethers.Signer): Promise<ethers.Contract> {
  return new ethers.Contract(CONTRACT_ADDRESS, DEXMarketplace.abi, signer);
}