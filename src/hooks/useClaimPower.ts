import { AIME_CONTRACT } from "../models/aime";
import AIMePowersContract from '../contracts/AIMePowers.json';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";

export const useClaimPower = (aimeAddress: string, amount: number, nonce: number, signature: string) => {
  const { config, error: prepareError } = usePrepareContractWrite({
    address: AIME_CONTRACT,
    abi: AIMePowersContract.abi,
    functionName: 'claimShare',
    args: [aimeAddress, amount, nonce, signature]
  });

  const { data, isLoading: writeLoading, write: claimPower, isError, error } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess: claimPowerSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    claimPower,
    isLoading: writeLoading || waitTxLoading,
    isSuccess: claimPowerSuccess,
    isError,
    error: error,
    prepareError
  }
}