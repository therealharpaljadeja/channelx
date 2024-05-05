import axios from "axios";
import { useParams } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";

type ContextReturnType = {
    channel: Channel | null;
    subscribedUsers: User[] | null;
    loading: boolean;
};

async function fetchChannelDetails(channelId: string) {
    let response = await axios.get(
        `https://api.neynar.com/v2/farcaster/channel?id=${channelId}&type=id`,
        {
            headers: {
                Accept: "application/json",
                api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
            },
        }
    );

    let { channel } = response.data;

    return channel;
}

async function fetchAddressesStreamingToChannelOwner(channelOwner: string) {
    // let response = await axios.get("");

    return ["0x22b2DD2CFEF2018D15543c484aceF6D9B5435863"];
}

async function fetchFarcasterUsersFromVerifiedAddresses(
    verifiedAddresses: string[]
) {
    let param = verifiedAddresses.join(",");
    let response = await axios.get(
        `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${param}`,
        {
            headers: {
                Accept: "application/json",
                api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
            },
        }
    );

    let data = response.data;

    let users: User[] = [];

    for (const address in data) {
        users = [...users, ...data[address]];
    }

    return users;
}

const ChannelDataContext = React.createContext<ContextReturnType | null>(null);

export function ChannelDataProvider({ children }: { children: ReactNode }) {
    const params = useParams();

    const id = params["id"];

    const [channel, setChannel] = useState<Channel | null>(null);
    const [subscribedUsers, setSubscribedUsers] = useState<User[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            let channelDetails = await fetchChannelDetails(id as string);

            if (channelDetails && channelDetails.lead) {
                let addressesStreamingToChannelOwner =
                    await fetchAddressesStreamingToChannelOwner(
                        channelDetails.lead.verified_addresses.eth_addresses[0]
                    );

                let subscribedUsers =
                    await fetchFarcasterUsersFromVerifiedAddresses(
                        addressesStreamingToChannelOwner
                    );

                setSubscribedUsers(subscribedUsers);
            }
            console.log(channelDetails);
            setChannel(channelDetails);
            setLoading(false);
        }

        if (id) {
            init();
        }
    }, [id]);

    return (
        <ChannelDataContext.Provider
            value={{
                subscribedUsers,
                channel,
                loading,
            }}
        >
            {children}
        </ChannelDataContext.Provider>
    );
}

export default ChannelDataContext;
