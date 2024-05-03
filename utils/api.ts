type Lead = {
    custody_address: string;
    username: string;
    fid: number;
};

type Channel = {
    lead: Lead;
    description: string;
    follower_count: number;
    name: string;
    parent_url: string;
    image_url: string;
    id: string;
};

// export function getChannelHost(channel: { hosts: Host[] }) {
//     return channel;
// }
