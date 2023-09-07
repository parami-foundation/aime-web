import { ethers } from "ethers";
import AIMeContract from '../contracts/AIMePowers.json';
import { AIME_CONTRACT } from "../models/aime";
import { useEffect, useState } from "react";

const httpProvider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/46cdd1b1481049b992a90914cc17b52f');

export const useAIMeContract = () => {
  const [contract, setContract] = useState<ethers.Contract>();

  useEffect(() => {
    const aime = new ethers.Contract(AIME_CONTRACT, AIMeContract.abi, httpProvider);
    setContract(aime);
  }, [])
  
  return contract;
}
