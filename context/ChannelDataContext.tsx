import axios from "axios";
import { useParams } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";

type ContextReturnType = {
    channel: Channel | null;
    subscribedUsers: User[] | null;
    loading: boolean;
};

type cfaStream = {
    currentFlowRate: string;
    sender: {
        id: string;
    };
    streamedUntilUpdatedAt: string;
    updatedAtTimestamp: string;
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

async function cfaStreamsToChannelOwner(
    channelOwnerAddress: string
): Promise<{ cfaStreams: cfaStream[] }> {
    let query = `query {
        cfaStreams: streams(
          where: {receiver:"${channelOwnerAddress}", token: "0x1eff3dd78f4a14abfa9fa66579bd3ce9e1b30529"}
        ) {
          currentFlowRate
          streamedUntilUpdatedAt
          updatedAtTimestamp
          sender {
            id
          }
        }
      }`;

    let response = await fetch(
        "https://base-mainnet.subgraph.x.superfluid.dev/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query,
            }),
        }
    );

    let { data } = await response.json();

    return data;
}

async function fetchAddressesStreamingToChannelOwner(cfaStreams: cfaStream[]) {
    let streamSenders = cfaStreams.map(
        (stream: { currentFlowRate: string; sender: { id: string } }) =>
            stream.sender.id
    );

    return streamSenders;
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

    return data;
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
                let { cfaStreams } = await cfaStreamsToChannelOwner(
                    channelDetails.lead.verified_addresses.eth_addresses[0]
                );

                let addressesStreamingToChannelOwner =
                    await fetchAddressesStreamingToChannelOwner(cfaStreams);

                let subscribedUsersData =
                    await fetchFarcasterUsersFromVerifiedAddresses(
                        addressesStreamingToChannelOwner
                    );

                let subscribedUsers: User[] = [];

                for (const address in subscribedUsersData) {
                    let user = subscribedUsersData[address][0];

                    for (let i = 0; i < cfaStreams.length; i++) {
                        if (address === cfaStreams[i].sender.id) {
                            user.startingBalance =
                                cfaStreams[i].streamedUntilUpdatedAt;
                            user.startingBalanceDate =
                                cfaStreams[i].updatedAtTimestamp;
                            user.flowRate = cfaStreams[i].currentFlowRate;
                        }
                    }

                    subscribedUsers = [...subscribedUsers, user];
                }

                setSubscribedUsers(subscribedUsers);
            }
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
