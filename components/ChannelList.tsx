import { Flex, Heading } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import ListItem from "./Channel";
import { Channel, Lead } from "@/utils/api";

export default function ChannelList({
    fid,
}: {
    fid: number | null | undefined;
}) {
    const [channelsLeadByUser, setChannelsLeadByUser] = useState<
        Channel[] | null
    >(null);

    useEffect(() => {
        async function getChannels() {
            if (fid) {
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

                    let channelsHostedByUser = allChannelsUserFollows.filter(
                        (channel: { lead: Lead }) => channel.lead.fid == fid
                    );

                    setChannelsLeadByUser(channelsHostedByUser);
                }
            }
        }
        getChannels();
    }, [fid]);

    if (!fid) return null;
    return (
        <Flex className="space-y-4" flexDirection={"column"}>
            <Heading size="lg">Your Channels</Heading>
            {channelsLeadByUser && (
                <Flex flexDirection={"column"}>
                    {channelsLeadByUser.map((channel) => (
                        <ListItem key={channel.id} itemData={channel} />
                    ))}
                </Flex>
            )}
        </Flex>
    );
}
