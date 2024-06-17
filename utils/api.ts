import axios from "axios";

export type Lead = {
    custody_address: string;
    username: string;
    fid: number;
    verified_addresses: {
        eth_addresses: string[];
    };
};

export type User = {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    follower_count: number;
    streamedUntilUpdatedAt?: string;
    updatedAtTimestamp?: string;
    currentFlowRate?: string;
    cfaStreams?: cfaStream[];
};

export type Channel = {
    lead: Lead;
    description: string;
    follower_count: number;
    name: string;
    parent_url: string;
    image_url: string;
    id: string;
    hosts?: { fid: number; username: string }[];
    streamedUntilUpdatedAt?: string;
    updatedAtTimestamp?: string;
    currentFlowRate?: string;
    threshold?: string;
    cfaStreams?: cfaStream[];
};

export type cfaStream = {
    currentFlowRate: string;
    sender?: {
        id: string;
    };
    receiver?: {
        id: string;
    };
    streamedUntilUpdatedAt: string;
    updatedAtTimestamp: string;
};

export async function fetchChannelDetails(channelId: string) {
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

export async function fetchAllChannelsOwnedByAnFid(fid: number) {
    let allChannelsUserFollows = [];
    let nextCursor = "";
    let i = 0;

    while (true) {
        let response = {} as any;
        if (i == 0) {
            response = await axios.get(
                `https://api.neynar.com/v2/farcaster/user/channels?fid=${fid}&limit=100`,
                {
                    headers: {
                        Accept: "application/json",
                        api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
                    },
                }
            );
            i++;
        } else {
            if (nextCursor != null) {
                response = await axios.get(
                    `https://api.neynar.com/v2/farcaster/user/channels?fid=${fid}&limit=100&cursor=${nextCursor}`,
                    {
                        headers: {
                            Accept: "application/json",
                            api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
                        },
                    }
                );
            } else {
                break;
            }
        }

        let { channels: someChannelsUserFollows } = response.data;
        nextCursor = response.data.next.cursor;
        allChannelsUserFollows.push(...someChannelsUserFollows);
    }

    const userOwnedChannels = [];

    if (allChannelsUserFollows) {
        for (let i = 0; i < allChannelsUserFollows.length; i++) {
            for (let j = 0; j < allChannelsUserFollows[i].hosts.length; j++) {
                if (allChannelsUserFollows[i].hosts[j].fid == fid)
                    userOwnedChannels.push(allChannelsUserFollows[i]);
            }
        }
    }

    return userOwnedChannels;
}

export async function fetchAllFarcasterUsersFromAddresses(addresses: string[]) {
    let param = addresses.join(",");

    try {
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
    } catch (error) {
        console.log(error);
    }

    return [];
}

export async function fetchAllIncomingStreamsToAnAddress(
    receiver: string
): Promise<{ cfaStreams: cfaStream[] }> {
    let query = `query {
        cfaStreams: streams(
          where: {receiver:"${receiver}", token: "0x1eff3dd78f4a14abfa9fa66579bd3ce9e1b30529"}
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

export async function fetchAllOutgoingStreamsFromAnAddress(sender: string) {
    let query = `query {
        cfaStreams: streams(
          where: {sender:"${sender}", token: "0x1eff3dd78f4a14abfa9fa66579bd3ce9e1b30529"}
        ) {
          currentFlowRate
          streamedUntilUpdatedAt
          updatedAtTimestamp
          receiver {
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

export function getAddressesFromStreams(cfaStreams: cfaStream[]) {
    let streamSenders = cfaStreams.map(
        (stream: {
            currentFlowRate: string;
            sender?: { id: string };
            receiver?: { id: string };
        }) =>
            stream.sender
                ? stream.sender.id
                : stream.receiver
                ? stream.receiver.id
                : "0x"
    );

    return streamSenders;
}

export async function fetchUserBasedOnFID(fid: number) {
    let response = await axios.get(
        `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
        {
            headers: {
                Accept: "application/json",
                api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
            },
        }
    );

    let { users } = response.data;

    return users[0];
}

export async function fetchChannelOwnerAddress(channelId: string) {
    let channelDetails = await fetchChannelDetails(channelId);

    let channelOwner = channelDetails.lead;

    let verifiedAddressOfChannelOwner = channelOwner.verifications[0];

    return verifiedAddressOfChannelOwner;
}

export async function getDegenXStreamBetween2Addresses(
    sender: string,
    receiver: string
) {
    var query = `{
      cfaStreams: streams(
        where: {sender:"${sender}",receiver:"${receiver}",currentFlowRate_gt:0, token: "0x1eff3dd78f4a14abfa9fa66579bd3ce9e1b30529"}
      ) {
        currentFlowRate
        streamedUntilUpdatedAt
        updatedAtTimestamp
        sender {
          id
        }
      }
    }
    
    `;
    try {
        let response: any = await fetch(
            "https://subgraph-endpoints.superfluid.dev/base-mainnet/protocol-v1",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                    connection: "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                    cache: "force-cache",
                },
                body: JSON.stringify({
                    query,
                }),
            }
        );

        let data = await response.json();
        return data.data.cfaStreams;
    } catch (e) {
        console.log("Error at 75", e);
    }
}

export async function fetchAddressAndUsernameOfAnFid(fid: number) {
    let user = await fetchUserBasedOnFID(fid);

    let verifiedAddress = user.verifications[0];
    let username = user.username;

    return { verifiedAddress, username };
}
