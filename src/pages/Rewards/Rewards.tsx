import React from 'react';
import './Rewards.scss';
import InfoModal from '../../components/InfoModal/InfoModal';
import MobileDrawer from '../../components/MobileDrawer/MobileDrawer';
import BuyPowerDrawer from '../../components/BuyPowerDrawer/BuyPowerDrawer';

export interface RewardsProps { }

function Rewards({ }: RewardsProps) {
    return <>
        Rewards

        {/* <InfoModal
            image='/images/reward_image.svg'
            title='+1 SBF Power'
            description='You have earned +1 SBF Power'
            okText='OK'
            onOk={() => {
                console.log('on ok')
            }}
            linkText='View my rewards'
            onLink={() => {}}
        ></InfoModal> */}

        {/* <BuyPowerDrawer character={{} as any}></BuyPowerDrawer> */}
    </>;
};

export default Rewards;
