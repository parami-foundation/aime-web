import { PARAMI_AI } from "../models/aime";
import { Character, ChatHistory } from "../models/character";

// mock api
const mock = true;

export interface PowerReward {
  id: string;
  user_id: string;
  token_icon: string;
  token_name: string;
  token_symbol: string;
  contract_addr: string;
  amount: string;
}

export interface WithdrawSignature {
  token_contract: string;
  to: string;
  amount: string;
  nonce: string;
  sig: string;
}

const avatars = {
  'elon_musk': './images/elon_avatar.jpg',
  'SBF': './images/sbf_avatar.png',
  'CZ': './images/cz_avatar.png',
  'justin_sun': './images/sun_avatar.png'
} as { [key: string]: string };

export const getCharaters = async () => {
  const resp = await fetch(`${PARAMI_AI}/characters`);
  const characters = await resp.json() as Character[];
  return characters.map(char => {
    return {
      ...char,
      avatar: avatars[char.character_id] ?? ''
    }
  })
}

export const queryCharacter = async (query: { avatar_url?: string, twitter_handle?: string }) => {
  if (!query || (!query.avatar_url && !query.twitter_handle)) {
    return null;
  }

  const resp = await fetch(`${PARAMI_AI}/character?${new URLSearchParams(query)}`);
  const character = await resp.json() as Character;
  return character;
}

export const getChatHistory = async (token: string, characterId: string) => {
  const resp = await fetch(`${PARAMI_AI}/character_history?character_id=${characterId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const history = await resp.json() as ChatHistory[];
  return history;
}

export const getAutoQuestion = async (token: string, charaterName: string) => {
  const resp = await fetch(`${PARAMI_AI}/generate_question?charater_name=${charaterName}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const question = await resp.json() as string;
  return question;
}

export const getPowerRewards = async (token: string) => {
  if (mock) {
    return [
      {
        id: '123',
        user_id: '',
        token_icon: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO.jpg',
        token_name: 'Elon Musk AI Power',
        token_symbol: '$MUSK',
        amount: '10000000000000000'
      }
    ] as PowerReward[];
  }
  const resp = await fetch(`${PARAMI_AI}/power_rewards`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const rewards = await resp.json() as PowerReward[];
  return rewards;
}

export const getPowerRewardWithdrawSig = async (token: string, rewardId: string) => {
  const resp = await fetch(`${PARAMI_AI}/power_withdraw_sig?id=${rewardId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const sig = await resp.json() as WithdrawSignature;
  return sig;
}
