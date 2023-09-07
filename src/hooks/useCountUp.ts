import CountUpContract from '../contracts/CountUp.json';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";

const CountUpAddress = '0x05336351D165b39bd5DabD4aE933ed2196Db89c6';

export const useCountUp = () => {

  const { config, error: prepareError } = usePrepareContractWrite({
    address: CountUpAddress,
    abi: CountUpContract.abi,
    functionName: 'increment',
    args: [],
  });

  const { data, isLoading: writeLoading, write: countUp, isError, error } = useContractWrite(config);
  const { isLoading: waitTxLoading, isSuccess: countUpSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return {
    countUp,
    isLoading: writeLoading || waitTxLoading,
    isSuccess: countUpSuccess,
    isError,
    error: error,
    prepareError
  }
}