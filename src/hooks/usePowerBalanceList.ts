import { useContractReads } from 'wagmi';
import AIMePowersContract from '../contracts/AIMePowers.json';
import { AIME_CONTRACT } from "../models/aime";

export const usePowerBalanceList = (aimeAddressList: string[], userAddress: string) => {
  const contracts = aimeAddressList.map(aimeAddress => {
    return {
      address: AIME_CONTRACT,
      abi: AIMePowersContract.abi,
      functionName: 'sharesBalance',
      args: [aimeAddress, userAddress],
    }
  }) as any

  const { data, refetch } = useContractReads({
    contracts
  });

  return {
    data: data?.map(res => {
      return res?.result?.toString();
    }),
    refetch
  }
}