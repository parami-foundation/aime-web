import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCharaters } from '../../services/ai.service';
import { Character } from '../../models/character';
import './Bid.scss';

export interface BidProps { }

function Bid({ }: BidProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [character, setCharacter] = useState<Character>();
    const navigate = useNavigate();

    useEffect(() => {
        if (searchParams) {
            getCharaters().then(characters => {
                const c_id = searchParams.get('character_id');
                const character = characters.find(char => char.character_id === c_id);
                if (character) {
                    setCharacter(character);
                }
            })
        }
    }, [searchParams])

    return <>
        <div className='bid-container'>
            <div className='header'>
                <div className='return-btn' onClick={() => {
                    navigate('/');
                }}>
                    <img src='./images/return_icon.svg' alt=''></img>
                </div>
                <div className='name'>
                    {character?.name}
                </div>
            </div>

            {character && <>
                <div className='avatar-section'>
                    <div className='avatar-container'>
                        <img src={character.avatar} alt=''></img>
                    </div>

                    <div className='name'>
                        {character.name}
                    </div>
                </div>
            </>}
        </div>
    </>;
};

export default Bid;
