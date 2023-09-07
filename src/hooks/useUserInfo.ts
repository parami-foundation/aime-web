import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { UserInfo, getUserInfo } from "../services/ai.service";

export const useUserInfo = () => {
  const { getToken } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo>();

  const fetchUserInfo = async () => {
    const token = await getToken();
    if (token) {
      const user = await getUserInfo(token);
      setUserInfo(user);
    }
  }

  useEffect(() => {
    fetchUserInfo()
  }, [])

  return {
    userInfo,
    refresh: () => {
      fetchUserInfo();
    }
  };
}