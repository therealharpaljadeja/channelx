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
};

export type Channel = {
    lead: Lead;
    description: string;
    follower_count: number;
    name: string;
    parent_url: string;
    image_url: string;
    id: string;
    streamedUntilUpdatedAt?: string;
    updatedAtTimestamp?: string;
    currentFlowRate?: string;
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

export async function fetchAllChannelsOwnedByAnFid(fid: number) {
    let response = await axios.get(
        `https://api.neynar.com/v2/farcaster/user/channels?fid=${fid}&limit=50`,
        {
            headers: {
                Accept: "application/json",
                api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
            },
        }
    );

    let { channels: allChannelsUserFollows } = response.data;

    const userOwnedChannels = [];

    if (allChannelsUserFollows) {
        for (let i = 0; i < allChannelsUserFollows.length; i++) {
            if (allChannelsUserFollows[i].lead.fid == fid)
                userOwnedChannels.push(allChannelsUserFollows[i]);
        }
    }

    return userOwnedChannels;
}

export async function fetchAllFarcasterUsersFromAddresses(addresses: string[]) {
    let param = addresses.join(",");
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
