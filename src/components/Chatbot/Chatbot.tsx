import React, { useEffect, useState } from 'react';
// import styles from './Chatbot.module.scss';
import './Chatbot.scss';
import { useRef } from 'react';
import { Character, characters } from '../../models/character';
import { getAutoQuestion, getChatHistory } from '../../services/ai.service';
import { useAuth } from '@clerk/clerk-react';
import { WS_Endpoint } from '../../models/aime';
import { Dropdown } from 'antd';
import BuyPowerDrawer from '../BuyPowerDrawer/BuyPowerDrawer';
import { useAccount, useDisconnect } from 'wagmi';
import { usePowerBalance } from '../../hooks/usePowerBalance';
import { useWeb3Modal } from '@web3modal/react';

export interface ChatbotProps {
    character: Character;
    onReturn: () => void;
}

enum MessageType {
    MESSAGE = 'message',
    SCORE = 'score',
    THINK = 'think',
}

interface MessageDisplay {
    type: MessageType;
    sender: string;
    content: string;
}

let socket: WebSocket;

function Chatbot({ character, onReturn }: ChatbotProps) {
    // const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
    const [audioQueue, setAudioQueue] = useState<any[]>([]);
    const [currentAudio, setCurrentAudio] = useState<any>();
    const audioPlayer = useRef<HTMLAudioElement>(null);
    const msgList = useRef<HTMLDivElement>(null);

    const [autoQuestion, setAutoQuestion] = useState<string>();
    const [messages, setMessages] = useState<MessageDisplay[]>([]);
    const [inputValue, setInputValue] = useState<string>();
    const { getToken } = useAuth();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [buyPowerOpen, setBuyPowerOpen] = useState<boolean>(false);

    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { open } = useWeb3Modal();

    const { data: powerBalance, refetch: refreshBalance } = usePowerBalance(character.contract_address, address ?? '');

    const genAutoQuestion = () => {
        getToken().then(token => {
            if (token) {
                return getAutoQuestion(token, character.name)
            }
            return null;
        }).then(res => {
            if (res && typeof res === 'string') {
                setAutoQuestion(res);
            }
        }).catch(e => {
            console.log('auto gen question error', e);
        })
    }

    useEffect(() => {
        genAutoQuestion();
    }, []);

    const scrollDown = () => {
        if (msgList.current) {
            msgList.current.scrollTop = msgList.current.scrollHeight;
        }
    }

    const handleAiMessage = (msg: string) => {
        setMessages(prevMessages => {
            return [
                ...prevMessages,
                {
                    type: MessageType.MESSAGE,
                    sender: character.name,
                    content: msg
                }
            ];
        })
    }

    const handleThink = (msg: string) => {
        setMessages(prevMessages => {
            return [
                ...prevMessages,
                {
                    type: MessageType.THINK,
                    sender: character.name,
                    content: msg
                }
            ];
        })
    }

    const handleScore = (score?: number) => {
        if (score !== undefined) {
            setMessages(prevMessages => {
                return [
                    ...prevMessages,
                    {
                        type: MessageType.SCORE,
                        sender: character.name,
                        content: score.toString()
                    }
                ];
            })
        }
    }

    const connectSocket = (authToken: string) => {
        const clientId = Math.floor(Math.random() * 1010000);
        // var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
        const ws_scheme = "wss";
        const ws_path = `${ws_scheme}://${WS_Endpoint}/ws/${clientId}?token=${authToken}&character_id=${character.character_id}&platform=web`;
        socket = new WebSocket(ws_path);
        socket.binaryType = 'arraybuffer';

        socket.onopen = (event) => {
            console.log("successfully connected");
        };

        socket.onmessage = (event) => {
            console.log('Message from server');
            if (typeof event.data === 'string') {
                const message = event.data;
                const aiMessage = JSON.parse(message) as { type: string, data: string };
                console.log('[aiMessage]', aiMessage);
                if (aiMessage.type === 'text') {
                    handleAiMessage(aiMessage.data);
                } else if (aiMessage.type === 'score') {
                    // set current score
                    handleScore(Number(aiMessage.data));
                } else if (aiMessage.type === 'think') {
                    handleThink(aiMessage.data);
                } else if (aiMessage.type === 'end') {
                    // handle end
                    // updateCurrentScore(emoScore);
                }
            } else {  // audio binary data
                console.log('[binary data]', event.data);
                setAudioQueue([...audioQueue, event.data]);
            }
        };

        socket.onerror = (error) => {
            console.log(`WebSocket Error: `, error);
            // setAuthToken(undefined);
        };

        socket.onclose = (event) => {
            console.log("Socket closed", event);
        };
    }

    useEffect(() => {
        getToken().then(authToken => {
            if (authToken) {
                console.log('connecting ws...with authToken:', authToken);
                connectSocket(authToken);

                getChatHistory(authToken, character.character_id).then(res => {
                    if (res?.length) {
                        const messages = [] as MessageDisplay[];
                        res.forEach(chat => {
                            messages.push({
                                type: MessageType.MESSAGE,
                                sender: 'User',
                                content: chat.client_message_unicode
                            });
                            messages.push({
                                type: MessageType.MESSAGE,
                                sender: character.name,
                                content: chat.server_message_unicode
                            });
                        })
                        setMessages(messages);
                    }
                })
            }
        });
    }, [])

    useEffect(() => {
        if (audioQueue.length > 0 && !currentAudio) {
            setCurrentAudio(audioQueue[0]);
            setAudioQueue(audioQueue.slice(1));
        }
    }, [audioQueue, currentAudio]);

    useEffect(() => {
        if (currentAudio) {
            playAudio(currentAudio).then(res => {
                setCurrentAudio(undefined);
            })
        }
    }, [currentAudio])

    const playAudio = (data: any) => {
        let blob = new Blob([data], { type: 'audio/mp3' } as any);
        let audioUrl = URL.createObjectURL(blob);
        const player = audioPlayer.current as HTMLAudioElement;
        return new Promise((resolve) => {
            player.src = audioUrl;
            player.muted = true;  // Start muted
            player.onended = resolve;
            player.play().then(() => {
                player.muted = false;  // Unmute after playback starts
            }).catch(error => alert(`Playback failed because: ${error}`));
        });
    }

    const handleSendMessage = async (text: string) => {
        if (text) {
            setMessages([
                ...messages,
                {
                    type: MessageType.MESSAGE,
                    sender: 'User',
                    content: text
                }
            ]);
            socket.send(text);
        }
    }

    useEffect(() => {
        scrollDown();
    }, [messages])

    return <>
        <div className='chatbot-container'>
            <div className='header'>
                <div className='return-btn' onClick={() => {
                    socket && socket.close();
                    onReturn();
                }}>
                    <img src='./images/return_icon.svg' alt=''></img>
                </div>
                <div className='name'>
                    {character.name}
                </div>
            </div>

            <div className='avatar-section'>
                <div className='avatar-container'>
                    <img src={character.avatar} alt=''></img>

                    <Dropdown menu={{ items: [] }} placement="bottomRight"
                        onOpenChange={(open) => {
                            setMenuOpen(open);
                        }}
                        open={menuOpen}
                        dropdownRender={(menu) => {
                            return <>
                                <div className='dropdown-menu'>
                                    <div className='menu-item'>
                                        <img src='/images/list_icon.svg' alt=''></img>
                                        <span>List of AIMEs</span>
                                    </div>
                                    <div className='menu-item' onClick={() => {
                                        setBuyPowerOpen(true);
                                    }}>
                                        <img src='/images/buy_power_icon.svg' alt=''></img>
                                        <span>Buy Power</span>
                                    </div>
                                    <div className='menu-item'>
                                        <img src='/images/tips_icon.svg' alt=''></img>
                                        <span>AIME Tips</span>
                                    </div>
                                    <div className='menu-item'>
                                        <img src='/images/reward_icon.svg' alt=''></img>
                                        <span>My Rewards</span>
                                    </div>
                                    <div className='menu-item' onClick={() => {
                                        if (isConnected) {
                                            disconnect();
                                        } else {
                                            open();
                                        }
                                    }}>
                                        <img src='/images/wallet_small_icon.svg' alt=''></img>
                                        <span>
                                            {isConnected && <>Disconnect Wallet</>}
                                            {!isConnected && <>Connect Wallet</>}
                                        </span>
                                    </div>
                                </div>
                            </>
                        }}>
                        <div className='power-balance'>
                            <div className='power-icon-container'>
                                <img src='/images/power_icon.svg' alt=''></img>
                            </div>
                            <span className='balance'>{powerBalance ? `${powerBalance}` : 0} Power</span>
                            {menuOpen && <img className='caret-icon' src='/images/caret_up.svg' alt=''></img>}
                            {!menuOpen && <img className='caret-icon' src='/images/caret_down.svg' alt=''></img>}
                        </div>
                    </Dropdown>

                </div>

                <div className='name'>
                    {character.name}
                </div>
            </div>

            <div className='message-section' ref={msgList}>
                <div className='overlay'></div>
                <div className='messages'>
                    {messages.map(message => {
                        return <>
                            {message.type === MessageType.MESSAGE && <>
                                <div className='message'>
                                    <div className='name'>{message.sender}:</div>
                                    <div className='msg'>{message.content}</div>
                                </div>
                            </>}

                            {message.type === MessageType.SCORE && <>
                                <div className='emo-score'>({message.content})</div>
                            </>}

                            {message.type === MessageType.THINK && <>
                                <div className='message'>
                                    <div className='name'>{message.sender} is thinking:</div>
                                    <div className='msg'>{message.content}</div>
                                </div>
                            </>}
                        </>
                    })}
                </div>
            </div>

            <div className='input-container'>
                <input
                    value={inputValue}
                    placeholder={autoQuestion ? `"${autoQuestion}"` : 'Ask me anything...'}
                    onChange={(event) => {
                        setInputValue(event.target.value);
                    }}
                ></input>
                <div className='enter-btn' onClick={() => {
                    if (inputValue) {
                        handleSendMessage(inputValue);
                    } else if (autoQuestion) {
                        handleSendMessage(autoQuestion);
                        setAutoQuestion('');
                        genAutoQuestion();
                    }
                    setInputValue('');
                }}>
                    <img src='./images/enter_icon.svg' alt=''></img>
                </div>
            </div>

            <div className='audio-container'>
                <audio className="audio-player" ref={audioPlayer}>
                    <source src="" type="audio/mp3" />
                </audio>
            </div>
        </div>

        {buyPowerOpen && <>
            <BuyPowerDrawer
                character={character}
                onClose={() => {
                    setBuyPowerOpen(false)
                }}
                onSuccess={() => {
                    setBuyPowerOpen(false);
                    refreshBalance();
                }}
            ></BuyPowerDrawer>
        </>}
    </>;
};

export default Chatbot;
