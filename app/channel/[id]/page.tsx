"use client";

import ChannelConfigurationModal from "@/components/Channel/ChannelConfigurationModal";
import ChannelInfoModal from "@/components/Channel/ChannelInfoModal";
import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTotal from "@/components/Screen/ScreenTotal";
import ChannelDataContext from "@/context/ChannelDataContext";
import {
    Heading,
    IconButton,
    Spacer,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { useContext } from "react";
import { MdInfo, MdOutlineModeEdit } from "react-icons/md";

export default function ChannelDetailsPage() {
    const context = useContext(ChannelDataContext);

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

    const { authenticated, user } = usePrivy();

    if (!context) return null;

    const {
        channel,
        loading,
        subscribedUsers,
        currentFlowRates,
        streamedUntilUpdatedAts,
        updatedAtTimestamps,
    } = context;

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
                {streamedUntilUpdatedAts &&
                    updatedAtTimestamps &&
                    currentFlowRates && (
                        <ScreenTotal
                            streamedUntilUpdatedAts={streamedUntilUpdatedAts}
                            updatedAtTimestamps={updatedAtTimestamps}
                            currentFlowRates={currentFlowRates}
                        />
                    )}
                {subscribedUsers && <ScreenList items={subscribedUsers} />}
            </Screen>
        </>
    );
}
