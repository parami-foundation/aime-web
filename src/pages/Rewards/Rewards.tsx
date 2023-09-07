import React, { useEffect } from 'react';
import './Rewards.scss';
import { useAuth } from '@clerk/clerk-react';
import { getPowerRewardLimit, getPowerRewards } from '../../services/ai.service';
import { useNavigate } from 'react-router-dom';

export interface RewardsProps { }

function Rewards({ }: RewardsProps) {
    const { getToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        getToken().then(token => {
            if (token) {
                getPowerRewards(token).then(rewards => {
                    console.log('reward', rewards);
                })

                // getPowerRewardLimit(token).then(limits => {
                //     console.log('limit', limits);
                // }).catch(err => {
                //     console.log(err)
                // })
            }
        })
    }, [])

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

            <div className='no-rewards'>
                <img src='/images/no_rewards.svg' alt=''></img>
                <div className='title'>No Reward</div>
                <div className='sub-title'>You haven't received any rewards yet.</div>
            </div>
        </div>
    </>;
};

export default Rewards;
