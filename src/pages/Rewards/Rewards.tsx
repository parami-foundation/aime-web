import React from 'react';
import './Rewards.scss';
import InfoModal from '../../components/InfoModal/InfoModal';

export interface RewardsProps { }

function Rewards({ }: RewardsProps) {
    return <>
        Rewards

        <InfoModal
            image='/images/reward_image.svg'
            title='+1 SBF Power'
            description='You have earned +1 SBF Power'
            okText='OK'
            onOk={() => {
                console.log('on ok')
            }}
            linkText='View my rewards'
            onLink={() => {}}
        ></InfoModal>
    </>;
};

export default Rewards;
