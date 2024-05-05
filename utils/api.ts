type Lead = {
    custody_address: string;
    username: string;
    fid: number;
    verified_addresses: {
        eth_addresses: string[];
    };
};

type User = {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    follower_count: number;
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
