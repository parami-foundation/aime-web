import { useReadContract } from 'wagmi'
import { abi } from '../contracts/AIMeNFT'
import { parseBase64Json } from '../utils/nft.util'
import { formatEther } from 'viem'

export const useNFT = (address: `0x${string}`, tokenId: string) => {
  
  const tokenUriRes = useReadContract({
    abi,
    address: address,
    functionName: 'tokenURI',
    args: [tokenId as any],
  })

  const tokenOwnerRes = useReadContract({
    abi,
    address: address,
    functionName: 'ownerOf',
    args: [tokenId as any],
  })

  const tokenContentRes = useReadContract({
    abi,
    address: address,
    functionName: 'tokenContents',
    args: [tokenId as any],
  })

  if (!address || !tokenId || !tokenUriRes.data) return { tokenUri: null }

  const nftOwner = tokenOwnerRes.data as `0x${string}`;
  const tokenUri = parseBase64Json(tokenUriRes.data as string);
  const tokenContents = tokenContentRes.data;
  const nftOriginalPrice = (tokenContents && tokenContents[tokenContents.length - 2]) as bigint;
  const nftCurrentPrice = (tokenContents && tokenContents[tokenContents.length - 1]) as bigint;

  let nftPrice = nftOriginalPrice;
  if (nftOwner.toLowerCase() !== address) {
    nftPrice = nftCurrentPrice * BigInt(12) / BigInt(10);
  }
  
  return {
    tokenUri: tokenUri,
    tokenOwner: tokenOwnerRes.data as string,
    tokenContents: tokenContentRes.data,
    nftSellPrice: nftOriginalPrice,
    nftSellPriceFormated: `${Number(formatEther(nftOriginalPrice)).toFixed(2)}`,
    nftBuyPrice: nftPrice,
    nftBuyPriceFormated: `${Number(formatEther(nftPrice)).toFixed(2)}`,
  };
}