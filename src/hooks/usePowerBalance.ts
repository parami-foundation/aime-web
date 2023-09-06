import { useContractRead } from "wagmi";
import AIMePowersContract from '../contracts/AIMePowers.json';
import { AIME_CONTRACT } from "../models/aime";

export const usePowerBalance = (aimeAddress: string, userAddress: string) => {
  const { data, refetch } = useContractRead<unknown[], string, bigint>({
    address: AIME_CONTRACT,
    abi: AIMePowersContract.abi,
    functionName: 'sharesBalance',
    args: [aimeAddress, userAddress],
  });

  return { data, refetch };
}