import React, { useCallback, useEffect, useState } from 'react';
import './AIME.scss';
import { useParams } from 'react-router-dom';
import Chatbot from '../../components/Chatbot/Chatbot';
import { Character } from '../../models/character';
import { getCharaters, getPowerRewardLimit, getUserInfo, queryCharacter } from '../../services/ai.service';
import { Button, notification } from 'antd';
import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { useAccount, useSignMessage } from 'wagmi';
import { useWeb3Modal } from '@web3modal/react';
import { BIND_WALLET_MESSAGE, WAITLIST_LINK } from '../../models/aime';
import { usePowerBalanceList } from '../../hooks/usePowerBalanceList';
import { useAIMeContract } from '../../hooks/useAIMeContract';

export interface AIMEProps { }

function AIME({ }: AIMEProps) {
    // let { handle } = useParams() as { handle: string };
    const [character, setCharacter] = useState<Character>();
    const { isSignedIn } = useUser();
    const { signOut, openSignIn } = useClerk();
    const [characters, setCharacters] = useState<Character[]>();
    const [requestUserSig, setRequestUserSig] = useState<boolean>(false);
    const { open } = useWeb3Modal();
    const { data: signature, error: signMsgError, isLoading: signMsgLoading, signMessage } = useSignMessage();
    const { address, isConnected } = useAccount();
    const aimeContract = useAIMeContract();
    const [balanceList, setBalanceList] = useState<string[]>([]);
    const [rewardCountList, setRewardCountList] = useState<number[]>([]);
    const { getToken } = useAuth();

    const fetchPowerBalanceList = async () => {
        const list = await Promise.all((characters ?? []).map(async char => {
            const balance = await aimeContract?.sharesBalance(char.contract_address, address);
            return balance.toString();
        }))
        setBalanceList(list);
    }

    const fetchRewardCount = async () => {
        const token = await getToken();
        if (token) {
            const countList = await Promise.all((characters ?? []).map(async char => {
                const limit = await getPowerRewardLimit(token, char.character_id).catch(e => {
                    console.log('getPowerRewardLimit error', e);
                    return { count: 0 }
                });
                return limit.count;
            }))
            setRewardCountList(countList);
        }
    }

    useEffect(() => {
        if (characters) {
            fetchRewardCount();
        }
    }, [characters]);

    useEffect(() => {
        if (address && aimeContract && characters) {
            fetchPowerBalanceList();
        }
    }, [address, aimeContract, characters])

    useEffect(() => {
        if (requestUserSig) {
            if (!isConnected) {
                open().catch(e => console.log(e));
            } else {
                signMessage({ message: BIND_WALLET_MESSAGE })
            }
        }
    }, [requestUserSig, isConnected])

    useEffect(() => {
        if (signature) {
            console.log('got sig from user', signature);
            notification.success({
                message: 'bind wallet success'
            })
            setRequestUserSig(false);
        }
    }, [signature])

    useEffect(() => {
        getCharaters().then(characters => {
            setCharacters(characters)
        })
    }, []);

    // useEffect(() => {
    //     if (handle) {
    //         queryCharacter({ twitter_handle: handle }).then(character => {
    //             if (character && character.name) {
    //                 setCharacter(character);
    //             } else {
    //                 // notification.warning({
    //                 //     message: 'Character not found',
    //                 // })
    //             }
    //         })
    //     }
    // }, [handle])

    return <>
        <div className='aime-container'>
            {!isSignedIn && <>
                <div className='logo-container'>
                    <div className='logo'>
                        <img src='/logo.png' alt='' />
                    </div>
                    <div className='title'>
                        <img src='/images/aime_logo_text.svg' alt=''></img>
                    </div>
                    <div className='sub-title'>
                        <img src='/images/aime_web_url.svg' alt=''></img>
                    </div>
                </div>

                <div className='button-container'>
                    <div className='btn-large' onClick={() => {
                        openSignIn()
                    }}>Login</div>
                </div>
            </>}

            {isSignedIn && <>
                {!character && <>
                    <div className='select-character-container'>
                        <div className='header'>CHOOSE ONE OF THEM TO TALK</div>

                        <div className='characters-container'>
                            {characters && characters.length > 0 && <>
                                {characters.map((char, index) => {
                                    return <>
                                        <div className='character-card'>
                                            <div className='power-balance'>
                                                <div className='power-icon-container'>
                                                    <img src='/images/power_icon.svg' alt=''></img>
                                                </div>
                                                {(balanceList ?? [])[index] ?? 0} Power
                                            </div>
                                            <div className='avatar'>
                                                <img src={char.avatar} alt='' />
                                            </div>
                                            <div className='name-container'>
                                                <div className='name'>
                                                    {char.name}
                                                </div>
                                                <div className='rewards-count'>
                                                    Recieved Rewards: {rewardCountList[index] ?? 0}
                                                </div>
                                            </div>
                                            <div className='chat-btn' onClick={() => {
                                                setCharacter(char)
                                            }}>
                                                CHAT
                                            </div>
                                        </div>
                                    </>
                                })}
                            </>}
                        </div>

                        <div className='button-container'>
                            <div className='btn-large' onClick={() => {
                                window.open(WAITLIST_LINK, '_blank');
                            }}>Mint My Own AIME</div>
                        </div>

                        {process.env.NODE_ENV === 'development' && <>
                            <div className='button-container'>
                                <div className='btn-large' onClick={() => {
                                    signOut();
                                }}>Logout</div>
                            </div>
                        </>}
                    </div>
                </>}

                {character && <>
                    <div className='chat-container'>
                        <Chatbot character={character} onReturn={() => {
                            setCharacter(undefined);
                            fetchPowerBalanceList();
                        }}></Chatbot>
                    </div>
                </>}
            </>}
        </div>
    </>;
};

export default AIME;
