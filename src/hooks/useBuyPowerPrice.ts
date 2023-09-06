import { useContractRead } from "wagmi";
import AIMePowersContract from '../contracts/AIMePowers.json';
import { BigNumber } from "ethers";
import { AIME_CONTRACT } from "../models/aime";

export const useBuyPowerPrice = (aimeAddress: string, amount: number) => {
  const { data: price } = useContractRead<unknown[], string, bigint>({
    address: AIME_CONTRACT,
    abi: AIMePowersContract.abi,
    functionName: 'getBuyPriceAfterFee',
    args: [aimeAddress, amount],
  });

  return price;
}