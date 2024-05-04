"use client";

import ChannelConfigurationModal from "@/components/Channel/ChannelConfigurationModal";
import ChannelInfoModal from "@/components/Channel/ChannelInfoModal";
import Screen from "@/components/Screen";
import ScreenTotal from "@/components/Screen/ScreenTotal";
import {
    Heading,
    IconButton,
    Spacer,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdInfo, MdOutlineModeEdit } from "react-icons/md";

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

export default function ChannelDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const { id: channelId } = params;
    const {
        isOpen: isChannelInfoModalOpen,
        onOpen: onChannelInfoModalOpen,
        onClose: onChannelInfoModalClose,
    } = useDisclosure();

    const {
        isOpen: isChannelConfigurationModalOpen,
        onOpen: onChannelConfigurationModalOpen,
        onClose: onChannelConfigurationModalClose,
    } = useDisclosure();

    const [channel, setChannel] = useState<Channel | null>(null);
    const { authenticated, user } = usePrivy();

    useEffect(() => {
        async function init() {
            let channelDetails = await fetchChannelDetails(channelId);
            console.log(channelDetails);
            setChannel(channelDetails);
        }

        if (channelId) {
            init();
        }
    }, [channelId]);

    return (
        <>
            <ChannelInfoModal
                channel={channel}
                isOpen={isChannelInfoModalOpen}
                onClose={onChannelInfoModalClose}
            />
            <ChannelConfigurationModal
                channel={channel}
                isOpen={isChannelConfigurationModalOpen}
                onClose={onChannelConfigurationModalClose}
            />
            <Screen>
                {channel && (
                    <div className="flex items-center space-x-2">
                        <div className="flex">
                            <img
                                src={channel.image_url}
                                className="h-12 w-12 rounded-full"
                            />
                        </div>
                        <div className="flex flex-col">
                            <Heading size="md">{channel.name}</Heading>
                            <Text fontSize="sm">{`Managed by @${channel.lead.username}`}</Text>
                        </div>
                        <Spacer />
                        <div className="flex space-x-2">
                            {authenticated &&
                            user &&
                            channel.lead.fid === user.farcaster?.fid ? (
                                <IconButton
                                    colorScheme="purple"
                                    aria-label="Edit Channel Settings"
                                    onClick={onChannelConfigurationModalOpen}
                                    icon={<MdOutlineModeEdit />}
                                />
                            ) : null}
                            <IconButton
                                colorScheme="purple"
                                aria-label="Channel Info"
                                onClick={onChannelInfoModalOpen}
                                icon={<MdInfo />}
                            />
                        </div>
                    </div>
                )}
                <ScreenTotal />
                {/* {userjoinedChannels && <ScreenList items={userjoinedChannels} />} */}
            </Screen>
        </>
    );
}
