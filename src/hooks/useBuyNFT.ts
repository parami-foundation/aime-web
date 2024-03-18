import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { abi } from '../contracts/AIMeNFT'
import { useEffect } from 'react'
import { notification } from 'antd'

export const useBuyNFT = (address: `0x${string}`, tokenId: string) => {
  const { data: hash, isPending, isSuccess, writeContract, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    if (error) {
      notification.error({
        message: error.message,
      })
    }
  }, [error])

  return {
    buyNFT: () => {
      writeContract({
        abi,
        address: address,
        functionName: 'buyNFT',
        args: [tokenId as any],
      })
    },
    isPending: isPending || isConfirming,
    isSuccess: isSuccess && isConfirmed
  }
}
