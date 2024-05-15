import {
    Channel,
    fetchAllChannelsOwnedByAnFid,
    fetchAllFarcasterUsersFromAddresses,
    fetchAllOutgoingStreamsFromAnAddress,
    fetchUserBasedOnFID,
    getAddressesFromStreams,
} from "@/utils/api";
import { usePrivy } from "@privy-io/react-auth";
import React, { ReactNode, useEffect, useState } from "react";

type ContextReturnType = {
    userOwnedChannels: Channel[] | null;
    userjoinedChannels: Channel[] | null;
    loading: boolean;
    streamedUntilUpdatedAts: string[] | null;
    updatedAtTimestamps: string[] | null;
    currentFlowRates: string[] | null;
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
        async function getChannels(fid: number) {
            let allChannelsFidOwns = await fetchAllChannelsOwnedByAnFid(fid);

            setUserOwnedChannels(allChannelsFidOwns);
        }

        async function getUserJoinedChannels(fid: number) {
            let user = await fetchUserBasedOnFID(fid);

            let { cfaStreams } = await fetchAllOutgoingStreamsFromAnAddress(
                user.verified_addresses.eth_addresses[0]
            );

            if (cfaStreams.length) {
                let receivers = await getAddressesFromStreams(cfaStreams);

                if (receivers) {
                    let channelOwners =
                        await fetchAllFarcasterUsersFromAddresses(receivers);

                    let subscribedChannels: any[] = [];

                    for (const owner in channelOwners) {
                        // Shit code

                        let fid = channelOwners[owner][0].fid;

                        let ownedChannels = await fetchAllChannelsOwnedByAnFid(
                            fid
                        );

                        let streamedUntilUpdatedAts = [];
                        let updatedAtTimestamps = [];
                        let currentFlowRates = [];

                        for (let i = 0; i < ownedChannels.length; i++) {
                            let channel = ownedChannels[i];
                            channel.cfaStreams = [];

                            for (let j = 0; j < cfaStreams.length; j++) {
                                if (
                                    cfaStreams[j].receiver.id ===
                                    channel.lead.verified_addresses
                                        .eth_addresses[0]
                                ) {
                                    channel.cfaStreams.push(cfaStreams[j]);

                                    streamedUntilUpdatedAts.push(
                                        cfaStreams[j].streamedUntilUpdatedAt
                                    );
                                    updatedAtTimestamps.push(
                                        cfaStreams[j].updatedAtTimestamp
                                    );
                                    currentFlowRates.push(
                                        cfaStreams[j].currentFlowRate
                                    );
                                }
                            }

                            subscribedChannels.push(channel);
                        }

                        setCurrentFlowRates(currentFlowRates);
                        setStreamedUntilUpdatedAts(streamedUntilUpdatedAts);
                        setUpdatedAtTimestamps(updatedAtTimestamps);
                        setUserJoinedChannels(subscribedChannels);
                    }
                }
            }
        }

        async function init() {
            if (authenticated) {
                if (user && user.farcaster && user.farcaster.fid) {
                    const fid = user.farcaster.fid;
                    await getChannels(fid);
                    await getUserJoinedChannels(user.farcaster.fid);
                    setLoading(false);
                }
            }
        }

        init();
    }, [authenticated]);

    return (
        <UserDataContext.Provider
            value={{
                userOwnedChannels,
                userjoinedChannels,
                loading,
                streamedUntilUpdatedAts,
                updatedAtTimestamps,
                currentFlowRates,
            }}
        >
            {children}
        </UserDataContext.Provider>
    );
}

export default UserDataContext;
