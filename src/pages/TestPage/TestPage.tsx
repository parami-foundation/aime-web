import { useWeb3Modal } from '@web3modal/react';
import React, { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useCountUp } from '../../hooks/useCountUp';
import { ethers } from 'ethers';
import CountUpContract from '../../contracts/CountUp.json';

export interface TestPageProps { }

const customHttpProvider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/46cdd1b1481049b992a90914cc17b52f');

function TestPage({ }: TestPageProps) {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { open } = useWeb3Modal();
    const { countUp, isLoading, isSuccess, prepareError, error } = useCountUp();
    // const count = useCount();
    const [count, setCount] = useState<string>();

    const readCount = async () => {
        try {
            const contract = new ethers.Contract('0x05336351D165b39bd5DabD4aE933ed2196Db89c6', CountUpContract.abi, customHttpProvider);
            const count = await contract.count();
            console.log('read count from contract', count.toString());
            setCount(count.toString());
        } catch (err) {
            console.log('error', err);
        }
    }

    useEffect(() => {
        readCount();
    }, [])

    useEffect(() => {
        console.log('prepareError', prepareError);
    }, [prepareError])

    useEffect(() => {
        console.log('error', error);
    }, [error])

    return <>
        {!isConnected && <>
            <button onClick={open}>Connect</button>
        </>}

        {isConnected && <>
            <p>Address: {address}</p>
            <p>Count: {`${count}`}</p>
            <p>isLoading: {`${isLoading}`}</p>
            <p>isSuccess: {`${isSuccess}`}</p>
            <p>prepareError: {`${prepareError}`}</p>
            <p>error: {`${error}`}</p>

            <button onClick={() => {
                countUp?.();
            }}>Write</button>
        </>}
    </>;
};

export default TestPage;
