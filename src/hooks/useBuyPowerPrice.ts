import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAIMeContract } from "./useAIMeContract";

export const useBuyPowerPrice = (aimeAddress: string, amount: number) => {
  const [price, setPrice] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const aimeContract = useAIMeContract();

  useEffect(() => {
    if (aimeAddress && amount && aimeContract) {
      setLoading(true);
      aimeContract.getBuyPriceAfterFee(aimeAddress, amount).then((res: BigNumber) => {
        const pWei = res.toString();
        const pEther = ethers.utils.formatEther(pWei);
        setPrice(pEther);
        setLoading(false);
      })
    }
  }, [aimeAddress, amount, aimeContract])

  return { price, loading };
}