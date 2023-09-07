import React, { useEffect, useState } from 'react';
import './Rewards.scss';
import { useAuth } from '@clerk/clerk-react';
import { getCharaters, getPowerRewardLimit, getPowerRewardWithdrawSig, getPowerRewards, issuePowerReward } from '../../services/ai.service';
import { useNavigate } from 'react-router-dom';
import { useAIMeContract } from '../../hooks/useAIMeContract';
import { useAccount } from 'wagmi';
import { notification } from 'antd';

export interface RewardsProps { }

enum TAB {
    REWARDS = 'rewards',
    CLAIMED = 'claimed',
}

interface RewardRecord {
    id: number;
    amount: number;
    claimed: boolean;
    powerIcon: string;
    powerName: string;
    signature: string;
    powerAddress: string;
    createdAt: string;
}

function Rewards({ }: RewardsProps) {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState<TAB>(TAB.REWARDS);
    const aimeContract = useAIMeContract();
    const { address, isConnected } = useAccount();
    const [rewardRecords, setRewardRecords] = useState<RewardRecord[]>();
    const [claimedRecords, setClaimedRecords] = useState<RewardRecord[]>();

    const fetchRewards = async () => {
        const token = await getToken();
        if (!token) {
            return;
        }

        let rewards = await getPowerRewards(token);
        const characters = await getCharaters();
        rewards = rewards.filter(reward => reward.address && reward.amount && reward.id);
        const rewardsClaimed = await Promise.all(rewards.map(async reward => {
            const claimed = await aimeContract?.addressNonceUsed(address, reward.id);
            return claimed;
        }))
        const allRewardRecords = rewards.map((reward, index) => {
            const character = characters.find(char => char.character_id.includes(reward.character_id));
            return {
                id: reward.id,
                amount: reward.amount,
                claimed: rewardsClaimed[index],
                powerIcon: character?.avatar_url,
                powerName: character?.name,
                signature: reward.signature,
                powerAddress: reward.address,
                createdAt: reward.created_at,
            } as RewardRecord;
        });
        console.log('all reward records', allRewardRecords);
        setRewardRecords(allRewardRecords.filter(record => !record.claimed));
        setClaimedRecords(allRewardRecords.filter(record => record.claimed));
    }

    useEffect(() => {
        if (address && aimeContract) {
            fetchRewards();
        }
    }, [address, aimeContract])

    const renderRewardCard = (record: RewardRecord) => {
        return <div className='reward-record-card'>
            <img className='power-icon' src={record.powerIcon} alt=''></img>
            <div className='power-name'>{record.amount} {record.powerName} Power</div>

            {record.claimed && <>
                <div className='claimed'>Claimed</div>
            </>}

            {!record.claimed && <>
                <div className='claim-btn' onClick={async () => {
                    const token = await getToken();
                    if (!token) {
                        return;
                    }

                    let sig = record.signature;
                    if (!sig) {
                        sig = await getPowerRewardWithdrawSig(token, record.id) ?? '';
                    }
                    if (!sig) {
                        return;
                    }

                    sig && console.log('Got sig!', sig);
                }}>Claim</div>
            </>}
        </div>
    }

    return <>
        <div className='rewards-container'>
            <div className='header'>
                <div className='return-btn' onClick={() => {
                    navigate('/')
                }}>
                    <img src='./images/return_icon.svg' alt=''></img>
                </div>
                <div className='title'>
                    My Rewards
                </div>
            </div>

            <div className='tabs'>
                <div className={`tab ${tab === TAB.REWARDS ? 'active' : ''}`}
                    onClick={() => {
                        setTab(TAB.REWARDS)
                    }}
                >Rewards</div>
                <div className={`tab ${tab === TAB.CLAIMED ? 'active' : ''}`}
                    onClick={() => {
                        setTab(TAB.CLAIMED)
                    }}
                >Claimed</div>
            </div>

            <div className='rewards-container'>
                {tab === TAB.REWARDS && <>
                    {rewardRecords && <>
                        {rewardRecords.length === 0 && <>
                            <div className='no-rewards'>
                                <img src='/images/no_rewards.svg' alt=''></img>
                                <div className='title'>No Reward</div>
                                <div className='sub-title'>Could not find any rewards at the moment.</div>
                            </div>
                        </>}
                        {rewardRecords.length > 0 && <>
                            {rewardRecords.map(record => {
                                return renderRewardCard(record);
                            })}
                        </>}
                    </>}
                </>}

                {tab === TAB.CLAIMED && <>
                    {claimedRecords && <>
                        {claimedRecords.length === 0 && <>
                            <div className='no-rewards'>
                                <img src='/images/no_rewards.svg' alt=''></img>
                                <div className='title'>No Reward</div>
                                <div className='sub-title'>You haven't claimed any rewards yet.</div>
                            </div>
                        </>}
                        {claimedRecords.length > 0 && <>
                            {claimedRecords.map(record => {
                                return renderRewardCard(record);
                            })}
                        </>}
                    </>}
                </>}
            </div>

            {process.env.NODE_ENV === 'development' && <>
                <div className='button-container'>
                    <div className='btn-large' onClick={async () => {
                        const token = await getToken();
                        if (token) {
                            issuePowerReward(token)
                        }
                    }}>Issue Reward</div>
                </div>
            </>}
        </div>
    </>;
};

export default Rewards;
