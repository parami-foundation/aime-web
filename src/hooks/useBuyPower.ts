import { AIME_CONTRACT } from "../models/aime";
import { useBuyPowerPrice } from "./useBuyPowerPrice"
import AIMePowersContract from '../contracts/AIMePowers.json';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { ethers } from "ethers";
import { parseEther } from 'viem'

export const useBuyPower = (aimeAddress: string, amount: number) => {
  const { price } = useBuyPowerPrice(aimeAddress, amount);

  const { config, error: prepareError } = usePrepareContractWrite({
    address: AIME_CONTRACT,
    abi: AIMePowersContract.abi,
    functionName: 'buyShares',
    args: [aimeAddress, amount],
    value: parseEther(price || '0'),
  });

  const { data, isLoading: writeLoading, write: buyPower, isError, error } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess: buyPowerSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    buyPower,
    isLoading: writeLoading || waitTxLoading,
    isSuccess: buyPowerSuccess,
    isError,
    error: error,
    prepareError
  }
}