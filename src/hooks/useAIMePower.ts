import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { abi } from '../contracts/AIMeNFT'
import { powerContractAbi } from '../contracts/AIMePower';
import { useEffect } from 'react';
import { notification } from 'antd';

export const useAIMePower = (aimeAddress: `0x${string}`, userAddress?: `0x${string}`) => {
  const powerAddressRes = useReadContract({
    abi,
    address: aimeAddress,
    functionName: 'aimePowerAddress',
  })

  const powerAddress = powerAddressRes.data as `0x${string}`;

  const powerBalanceRes = useReadContract({
    abi: powerContractAbi,
    address: powerAddress,
    functionName: 'balanceOf',
    args: [userAddress as any],
  })

  const { data: hash, isPending, isSuccess, error, writeContract } = useWriteContract()

  useEffect(() => {
    if (error) {
      notification.error({
        message: error.message,
      })
    }
  }, [error])

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      confirmations: 2,
      hash,
    })

  return {
    powerAddress: powerAddress,
    powerBalance: powerBalanceRes.data,
    approvePower: (amount: bigint) => {
      writeContract({
        abi: powerContractAbi,
        address: powerAddress,
        functionName: 'approve',
        args: [aimeAddress as any, amount],
      })
    },
    isPending: isPending || isConfirming,
    isSuccess: isSuccess && isConfirmed,
  }
}