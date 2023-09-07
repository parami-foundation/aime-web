import React, { useEffect, useState } from 'react';
import MobileDrawer from '../MobileDrawer/MobileDrawer';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/react';
import './BuyPowerDrawer.scss';
import { Character } from '../../models/character';
import { useBuyPowerPrice } from '../../hooks/useBuyPowerPrice';
import { ethers } from 'ethers';
import { useBuyPower } from '../../hooks/useBuyPower';
import InfoModal from '../InfoModal/InfoModal';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@clerk/clerk-react';
import { updatePowerBalance } from '../../services/ai.service';

export interface BuyPowerDrawerProps {
    character: Character;
    onClose: () => void;
    onSuccess: () => void;
}

function BuyPowerDrawer({ character, onClose, onSuccess }: BuyPowerDrawerProps) {
    const { address, isConnected } = useAccount();
    const { open } = useWeb3Modal();
    const [amount, setAmount] = useState<number>(1);
    const { getToken } = useAuth();

    const { price, loading: loadingPrice } = useBuyPowerPrice(character.contract_address, amount);
    const { buyPower, isSuccess, isLoading, error, prepareError } = useBuyPower(character.contract_address, amount);

    useEffect(() => {
        if (error) {
            console.log('error', error);
        }
    }, [error])

    useEffect(() => {
        if (prepareError) {
            console.log('prepareError', prepareError);
        }
    }, [prepareError])

    useEffect(() => {
        if (isSuccess) {
            getToken().then(token => {
                if (token) {
                    updatePowerBalance(token);
                }
            })
        }
    }, [isSuccess]);

    const changeAmount = (change: number) => {
        const newAmount = amount + change;
        if (newAmount > 0) {
            setAmount(newAmount);
        }
    }

    return <>
        <MobileDrawer
            closable={true}
            onClose={() => {
                onClose();
            }}
        >
            <div className='buy-power-container'>
                <div className='title'>BUY POWER</div>
                <div className='powers'>
                    <div className='power-icon'>
                        <img src={character.avatar_url} alt=''></img>
                    </div>
                    <div className='power-amount'>
                        <div className='power-name'>
                            {character.name} Power <span className='x-mark'>X</span> {amount}
                        </div>
                        <div className='amount-input'>
                            <div className='minus-btn' onClick={() => {
                                changeAmount(-1)
                            }}>
                                <img src='/images/minus_icon.svg' alt=''></img>
                            </div>
                            <div className='amount-value'>{amount}</div>
                            <div className='plus-btn' onClick={() => {
                                changeAmount(1)
                            }}>
                                <img src='/images/plus_icon.svg' alt=''></img>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='divider'></div>
                <div className='footer'>
                    {!isConnected && <>
                        <div className='btn-container'>
                            <div className='connect-btn' onClick={() => {
                                open();
                            }}>
                                <img src='/images/wallet_icon_white.svg' alt=''></img>
                                Connect Wallet
                            </div>
                        </div>
                    </>}

                    {isConnected && <>
                        <div className='total-price'>
                            <div className='label'>Total:</div>
                            <div className='value'>{price ?? 0} ETH</div>
                        </div>
                        <div className='buy-btn' onClick={() => {
                            if (!isLoading && !loadingPrice) {
                                buyPower?.();
                            }
                        }}>
                            {(isLoading || loadingPrice) && <>
                                <LoadingOutlined style={{ fontSize: 16, marginRight: 6 }} spin />
                            </>}
                            BUY
                        </div>
                    </>}
                </div>
            </div>

            {isSuccess && <>
                <InfoModal
                    image='/images/purchase_success.svg'
                    title='Purchase Successful'
                    description={`You have successfully purchased ${amount} ${character.name} Power.`}
                    onOk={() => {
                        onSuccess();
                    }}
                    okText='OK'
                ></InfoModal>
            </>}
        </MobileDrawer>
    </>;
};

export default BuyPowerDrawer;
