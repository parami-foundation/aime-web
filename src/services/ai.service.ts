import { notification } from "antd";
import { PARAMI_AI } from "../models/aime";
import { Character, ChatHistory } from "../models/character";

// mock api
const mock = true;

export interface PowerReward {
  address: string;
  amount: number;
  character_id: string;
  created_at: string;
  id: number;
  signature: string;
  user_id: number;
}

export interface WithdrawSignature {
  token_contract: string;
  to: string;
  amount: string;
  nonce: string;
  sig: string;
}

export interface UserInfo {
  auth_type: string;
  chain_id: number;
  id: number;
  name: string;
  wallet_address: string;
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
  const resp = await fetch(`${PARAMI_AI}/generate_question?character_name=${charaterName}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const question = await resp.json() as string;
  return question;
}

export const getPowerRewards = async (token: string) => {
  const resp = await fetch(`${PARAMI_AI}/user_tokens`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const rewards = await resp.json() as PowerReward[];
  return rewards;
}

export const getUserInfo = async (token: string) => {
  const resp = await fetch(`${PARAMI_AI}/mine`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const userInfo = await resp.json() as UserInfo;
  return userInfo;
}

export const bindWallet = async (token: string, address: string, message: string, signature: string) => {
  const data = JSON.stringify({
    wallet: address,
    chain_id: 5,
    message: message,
    signature: signature
  });

  const resp = await fetch(`${PARAMI_AI}/bind_wallet`, {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: data
  });

  return await resp.json();
}

export const getPowerRewardLimit = async (token: string, character_id: string) => {
  const resp = await fetch(`${PARAMI_AI}/tokens_limit?character_id=${character_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const limit = await resp.json() as { count: number, limit: number };
  return limit;
}

export const getPowerRewardWithdrawSig = async (token: string, rewardId: number) => {
  const resp = await fetch(`${PARAMI_AI}/transaction_signature?transaction_id=${rewardId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (resp.ok) {
    return await resp.json() as string;
  }

  const error = await resp.json() as { detail: string };
  notification.warning({
    message: error.detail
  })
  return null;
}

export const updateNonceStatus = async (token: string, nonce: number) => {
  const resp = await fetch(`${PARAMI_AI}/check_claim?nonce=${nonce}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await resp.json();
}

export const updatePowerBalance = async (token: string) => {
  return null;
  // const resp = await fetch(`${PARAMI_AI}/update_`, {
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //   },
  // });

  // return await resp.json();
}

// only for testing
export const issuePowerReward = async (token: string) => {
  const resp = await fetch(`${PARAMI_AI}/issue_tokens`, {
    method: 'post',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return await resp.json();
}
