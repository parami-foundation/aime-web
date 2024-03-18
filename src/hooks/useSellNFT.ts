import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { abi } from '../contracts/AIMeNFT'
import { useEffect } from 'react'
import { notification } from 'antd'

export const useSellNFT = (address: `0x${string}`, tokenId: string) => {
  const { data: hash, isPending, isSuccess, error, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      confirmations: 2,
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
    sellNFT: () => {
      writeContract({
        abi,
        address: address,
        functionName: 'sellNFT',
        args: [tokenId as any],
      })
    },
    isPending: isPending || isConfirming,
    isSuccess: isSuccess && isConfirmed
  }
}
