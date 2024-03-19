import React, { useCallback, useEffect, useState } from 'react';
import './AIME.scss';
import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, notification, Image, Skeleton } from 'antd';
import { useNFT } from '../../hooks/useNFT';
import { useLocation } from 'react-router-dom';
import { useSellNFT } from '../../hooks/useSellNFT';
import { useBuyNFT } from '../../hooks/useBuyNFT';
import { useAIMePower } from '../../hooks/useAIMePower';

export interface AIMEProps { }

function AIME({ }: AIMEProps) {
    const location = useLocation();
    const chainId = useChainId();
    const { switchChain } = useSwitchChain();
    const queryParams = new URLSearchParams(location.search);
    const aimeAddress = queryParams.get('address') as `0x${string}`;
    const tokenId = queryParams.get('tokenId') as string;

    const { sellNFT, isPending: isSellPending, isSuccess: isSellSuccess } = useSellNFT(aimeAddress, tokenId);
    const { buyNFT, isPending: isBuyPending, isSuccess: isBuySuccess } = useBuyNFT(aimeAddress, tokenId);

    const { tokenUri, tokenOwner, nftBuyPrice, nftBuyPriceFormated, nftSellPriceFormated } = useNFT(aimeAddress, tokenId);
    const { address, isConnected } = useAccount();
    const { powerBalance, approvePower, isPending: isApprovePending, isSuccess: isApproveSuccess } = useAIMePower(aimeAddress, address)

    const refresh = () => {
        setTimeout(() => {
            window.location.reload();
        }, 500)
    }

    useEffect(() => {
        if (isSellSuccess) {
            notification.success({
                message: 'Successfully Sold NFT',
            });
            refresh();
        }
    }, [isSellSuccess])


    useEffect(() => {
        if (isApproveSuccess && !isBuyPending && !isBuySuccess && buyNFT) {
            buyNFT()
        }
    }, [isApproveSuccess, isBuyPending, buyNFT])

    useEffect(() => {
        if (isBuySuccess) {
            notification.success({
                message: 'Successfully Bought NFT',
            });
            refresh();
        }
    }, [isBuySuccess])

    return <>
        <div className='aime-container'>
            {!!tokenUri?.image && <>
                <div className='nft-container'>
                    <Image src={tokenUri?.image} preview={false} placeholder={
                        <Skeleton.Image active={true} />
                    }></Image>
                </div>
            </>}

            <div className='btn-container'>
                {tokenId === '0' && <>
                    <span>Cannot trade the first NFT</span>
                </>}
                {tokenId !== '0' && <>
                    {isConnected && <>
                        {chainId !== arbitrumSepolia.id && <>
                            <Button type='primary' onClick={() => {
                                switchChain({ chainId: arbitrumSepolia.id })
                            }}>Change Network</Button>
                        </>}
                        {chainId === arbitrumSepolia.id && <>
                            {tokenOwner && address && tokenOwner.toLowerCase() === address.toLowerCase() && <>
                                <Button type='primary' loading={isSellPending} onClick={() => {
                                    sellNFT()
                                }}>Sell your NFT for {nftSellPriceFormated} power</Button>
                            </>}

                            {tokenOwner && address && tokenOwner.toLowerCase() !== address.toLowerCase() && <>
                                {nftBuyPrice && powerBalance && powerBalance >= nftBuyPrice && <>
                                    <Button type='primary' loading={isBuyPending || isApprovePending} onClick={() => {
                                        approvePower(nftBuyPrice)
                                    }}>Buy this NFT for {nftBuyPriceFormated} power</Button>
                                </>}

                                {(!powerBalance || powerBalance < nftBuyPrice) && <>
                                    <Button type='primary' disabled>Insufficient power to buy</Button>
                                </>}
                            </>}
                        </>}
                    </>}

                    {!isConnected && <>
                        <ConnectButton.Custom>
                            {({
                                openConnectModal,
                            }) => {
                                return (
                                    <Button
                                        block
                                        type="primary"
                                        size="large"
                                        onClick={() => openConnectModal()}
                                    >
                                        <div >
                                            <div>
                                                Connect Wallet
                                            </div>
                                        </div>
                                    </Button>
                                );
                            }}
                        </ConnectButton.Custom>
                    </>}
                </>}

            </div>
        </div>
    </>;
};

export default AIME;
