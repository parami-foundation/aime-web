import React, { useCallback, useEffect, useState } from 'react';
import './AIME.scss';
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, notification } from 'antd';
import { useNFT } from '../../hooks/useNFT';
import { useLocation } from 'react-router-dom';
import { useSellNFT } from '../../hooks/useSellNFT';
import { useBuyNFT } from '../../hooks/useBuyNFT';
import { useAIMePower } from '../../hooks/useAIMePower';

export interface AIMEProps { }

function AIME({ }: AIMEProps) {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const contractAddress = queryParams.get('address') as `0x${string}`;
    const tokenIdFromParam = queryParams.get('tokenId') as string;
    const [aimeAddress, setAimeAddress] = useState<`0x${string}`>(contractAddress)
    const [tokenId, setTokenId] = useState<string>(tokenIdFromParam)

    const { sellNFT, isPending: isSellPending, isSuccess: isSellSuccess } = useSellNFT(aimeAddress, tokenId);
    const { buyNFT, isPending: isBuyPending, isSuccess: isBuySuccess } = useBuyNFT(aimeAddress, tokenId);

    const { tokenUri, tokenOwner, nftPrice, nftPriceFormated } = useNFT(aimeAddress, tokenId);
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
                    <img src={tokenUri?.image} alt='nft'></img>
                </div>
            </>}

            <div className='btn-container'>
                {isConnected && <>
                    {tokenOwner && address && tokenOwner.toLowerCase() === address.toLowerCase() && <>
                        <Button type='primary' loading={isSellPending} onClick={() => {
                            sellNFT()
                        }}>Sell your NFT for {nftPriceFormated} power</Button>
                    </>}

                    {tokenOwner && address && tokenOwner.toLowerCase() !== address.toLowerCase() && <>
                        {nftPrice && powerBalance && powerBalance >= nftPrice && <>
                            <Button type='primary' loading={isBuyPending || isApprovePending} onClick={() => {
                                approvePower(nftPrice)
                            }}>Buy this NFT for {nftPriceFormated} power</Button>
                        </>}

                        {(!powerBalance || powerBalance < nftPrice) && <>
                            <Button type='primary' disabled>Insufficient power to buy</Button>
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
            </div>
        </div>
    </>;
};

export default AIME;
