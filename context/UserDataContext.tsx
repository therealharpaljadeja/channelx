import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import React, { ReactNode, useEffect, useState } from "react";

type ContextReturnType = {
    userOwnedChannels: Channel[] | null;
    userjoinedChannels: Channel[] | null;
    loading: boolean;
};

const UserDataContext = React.createContext<ContextReturnType | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
    const { authenticated, user } = usePrivy();

    const [loading, setLoading] = useState(true);

    const [userOwnedChannels, setUserOwnedChannels] = useState<
        Channel[] | null
    >(null);
    const [userjoinedChannels, setUserJoinedChannels] = useState<
        Channel[] | null
    >(null);

    useEffect(() => {
        async function getChannels(fid: number) {
            let response = await axios.get(
                `https://api.neynar.com/v2/farcaster/user/channels?fid=${fid}&limit=50`,
                {
                    headers: {
                        Accept: "application/json",
                        api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
                    },
                }
            );

            if (response.data) {
                let { channels: allChannelsUserFollows } = response.data;

                const userOwnedChannels = [];
                const userJoinedChannels = [];

                for (let i = 0; i < allChannelsUserFollows.length; i++) {
                    if (allChannelsUserFollows[i].lead.fid == fid)
                        userOwnedChannels.push(allChannelsUserFollows[i]);
                    else userJoinedChannels.push(allChannelsUserFollows[i]);
                }

                setUserOwnedChannels(userOwnedChannels);
                setUserJoinedChannels(userJoinedChannels);
                setLoading(false);
            }
        }

        if (authenticated) {
            if (user && user.farcaster && user.farcaster.fid) {
                const fid = user.farcaster.fid;
                getChannels(fid);
            }
        }
    }, [authenticated]);

    return (
        <UserDataContext.Provider
            value={{
                userOwnedChannels,
                userjoinedChannels,
                loading,
            }}
        >
            {children}
        </UserDataContext.Provider>
    );
}

export default UserDataContext;
