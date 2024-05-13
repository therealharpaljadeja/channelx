import {
    Channel,
    User,
    fetchAllFarcasterUsersFromAddresses,
    fetchAllIncomingStreamsToAnAddress,
    getAddressesFromStreams,
} from "@/utils/api";
import { createClient } from "@vercel/kv";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";

const kv = createClient({
    url: process.env.NEXT_PUBLIC_KV_REST_API_URL as string,
    token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN as string,
});

type ContextReturnType = {
    channel: Channel | null;
    subscribedUsers: User[] | null;
    loading: boolean;
    streamedUntilUpdatedAts: string[] | null;
    updatedAtTimestamps: string[] | null;
    currentFlowRates: string[] | null;
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

const ChannelDataContext = React.createContext<ContextReturnType | null>(null);

export function ChannelDataProvider({ children }: { children: ReactNode }) {
    const params = useParams();

    const id = params["id"];

    const [channel, setChannel] = useState<Channel | null>(null);
    const [subscribedUsers, setSubscribedUsers] = useState<User[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [streamedUntilUpdatedAts, setStreamedUntilUpdatedAts] = useState<
        string[] | null
    >(null);
    const [updatedAtTimestamps, setUpdatedAtTimestamps] = useState<
        string[] | null
    >(null);
    const [currentFlowRates, setCurrentFlowRates] = useState<string[] | null>(
        null
    );

    useEffect(() => {
        async function init() {
            let channelDetails = await fetchChannelDetails(id as string);

            if (channelDetails && channelDetails.lead) {
                let { cfaStreams } = await fetchAllIncomingStreamsToAnAddress(
                    channelDetails.lead.verified_addresses.eth_addresses[0]
                );

                let threshold = (await kv.get(channelDetails.id)) as string;

                channelDetails.threshold = threshold;

                let addressesStreamingToChannelOwner =
                    await getAddressesFromStreams(cfaStreams);

                let subscribedUsers: User[] = [];
                let streamedUntilUpdatedAts = [];
                let updatedAtTimestamps = [];
                let currentFlowRates = [];

                if (addressesStreamingToChannelOwner.length) {
                    let subscribedUsersData =
                        await fetchAllFarcasterUsersFromAddresses(
                            addressesStreamingToChannelOwner
                        );

                    for (const address in subscribedUsersData) {
                        let user = subscribedUsersData[address][0];

                        for (let i = 0; i < cfaStreams.length; i++) {
                            if (cfaStreams[i].sender) {
                                if (address === cfaStreams[i].sender?.id) {
                                    user.streamedUntilUpdatedAt =
                                        cfaStreams[i].streamedUntilUpdatedAt;
                                    user.updatedAtTimestamp =
                                        cfaStreams[i].updatedAtTimestamp;
                                    user.currentFlowRate =
                                        cfaStreams[i].currentFlowRate;

                                    streamedUntilUpdatedAts.push(
                                        cfaStreams[i].streamedUntilUpdatedAt
                                    );
                                    updatedAtTimestamps.push(
                                        cfaStreams[i].updatedAtTimestamp
                                    );
                                    currentFlowRates.push(
                                        cfaStreams[i].currentFlowRate
                                    );
                                }
                            }
                        }

                        subscribedUsers = [...subscribedUsers, user];
                        setCurrentFlowRates(currentFlowRates);
                        setStreamedUntilUpdatedAts(streamedUntilUpdatedAts);
                        setUpdatedAtTimestamps(updatedAtTimestamps);
                    }
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
                currentFlowRates,
                streamedUntilUpdatedAts,
                updatedAtTimestamps,
            }}
        >
            {children}
        </ChannelDataContext.Provider>
    );
}

export default ChannelDataContext;
