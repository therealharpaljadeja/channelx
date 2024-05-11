"use client";

import ChannelConfigurationModal from "@/components/Channel/ChannelConfigurationModal";
import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTotal from "@/components/Screen/ScreenTotal";
import ChannelDataContext from "@/context/ChannelDataContext";
import { cfaStream, fetchAllOutgoingStreamsFromAnAddress } from "@/utils/api";
import {
    Button,
    Heading,
    IconButton,
    Spacer,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConstantFlowAgreementV1 } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { MdOutlineModeEdit } from "react-icons/md";
import { useAccount, useConfig, Config } from "wagmi";
import { Account, Chain, Client, Transport, parseEther } from "viem";
import { getConnectorClient } from "@wagmi/core";
import { LoadingState } from "@/components/LoadingState";

const provider = new ethers.providers.JsonRpcProvider(
    "https://base.llamarpc.com"
);

const cfaV1 = new ConstantFlowAgreementV1(
    "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74",
    "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74",
    "0xcfA132E353cB4E398080B9700609bb008eceB125"
);

function clientToSigner(client: Client<Transport, Chain, Account>) {
    const { account, chain, transport } = client;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new ethers.providers.Web3Provider(transport, network);
    const signer = provider.getSigner(account.address);
    return signer;
}

function formatTime(seconds: number) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let result = "";
    if (days > 0) {
        result += days + "d ";
    }
    if (hours > 0) {
        result += hours + "hr ";
    }
    if (minutes > 0) {
        result += minutes + "min ";
    }
    if (remainingSeconds > 0) {
        result += remainingSeconds + "sec";
    }

    return result.trim();
}

export default function ChannelDetailsPage() {
    const context = useContext(ChannelDataContext);
    const { isConnected, address } = useAccount();
    const config = useConfig();
    const [unlockTime, setUnlockTime] = useState<string | null>(null);
    const [loadingStartStream, setLoading] = useState(false);
    const [isConnectedUserStreaming, setIsConnectedUserStreaming] =
        useState(false);
    const [channelOwner, setChannelOwner] = useState<string | null>(null);

    // const {
    //     isOpen: isChannelInfoModalOpen,
    //     onOpen: onChannelInfoModalOpen,
    //     onClose: onChannelInfoModalClose,
    // } = useDisclosure();

    const {
        isOpen: isChannelConfigurationModalOpen,
        onOpen: onChannelConfigurationModalOpen,
        onClose: onChannelConfigurationModalClose,
    } = useDisclosure();

    const { authenticated, user } = usePrivy();

    useEffect(() => {
        async function isConnectedUserStreamingToChannelOwner() {
            if (isConnected && address && channel) {
                // let cfaStream = await cfaV1.getFlow({
                //     sender: "0xaB8a67743325347Aa53bCC66850f8F13df87e3AF".toLowerCase(),
                //     receiver:
                //         channel.lead.verified_addresses.eth_addresses[0].toLowerCase(),
                //     superToken: "0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529",
                //     providerOrSigner: provider,
                // });

                // console.log(cfaStream);

                let channelOwner =
                    channel.lead.verified_addresses.eth_addresses[0];

                let { cfaStreams } = await fetchAllOutgoingStreamsFromAnAddress(
                    // "0xaB8a67743325347Aa53bCC66850f8F13df87e3AF".toLowerCase()
                    address.toLowerCase()
                );

                let cfaStream = cfaStreams.filter((stream: cfaStream) => {
                    return (
                        stream.receiver &&
                        stream.receiver.id === channelOwner.toLowerCase() &&
                        Number(stream.currentFlowRate) > 0
                    );
                });

                cfaStream = cfaStream[0];

                if (cfaStream) {
                    let amountStreamedToUser =
                        BigInt(
                            parseEther((channel.threshold as string).toString())
                        ) -
                        (BigInt(cfaStream.currentFlowRate) *
                            BigInt(
                                Date.now() - cfaStream.updatedAtTimestamp * 1000
                            )) /
                            BigInt(1000);

                    let timeAfterWhichCastingUnlocks = Number(
                        amountStreamedToUser / BigInt(cfaStream.currentFlowRate)
                    );

                    setIsConnectedUserStreaming(true);
                    setUnlockTime(formatTime(timeAfterWhichCastingUnlocks));
                } else {
                    setIsConnectedUserStreaming(false);
                }

                setChannelOwner(channelOwner);
            }
        }

        isConnectedUserStreamingToChannelOwner();
    }, [isConnected, address, context]);

    if (!context) return null;

    async function getEthersSigner(
        config: Config,
        { chainId }: { chainId?: number } = {}
    ) {
        const client = await getConnectorClient(config, { chainId });
        return clientToSigner(client);
    }

    async function startStream() {
        setLoading(true);
        try {
            if (channelOwner && channel) {
                console.log(channel.threshold);
                const createFlowOperation = await cfaV1.createFlow({
                    superToken: "0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529",
                    sender: address,
                    receiver: channelOwner,
                    flowRate: (
                        parseEther((channel.threshold as string).toString()) /
                        BigInt(24 * 60 * 60)
                    ).toString(),
                });

                console.log(createFlowOperation);

                const txnResponse = await createFlowOperation.exec(
                    await getEthersSigner(config)
                );

                const txnReceipt = await txnResponse.wait();

                console.log(txnReceipt);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const {
        channel,
        loading,
        subscribedUsers,
        currentFlowRates,
        streamedUntilUpdatedAts,
        updatedAtTimestamps,
    } = context;

    if (loading) return <LoadingState />;

    return (
        <>
            {/* <ChannelInfoModal
                channel={channel}
                isOpen={isChannelInfoModalOpen}
                onClose={onChannelInfoModalClose}
            /> */}
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
                            {/* <IconButton
                                colorScheme="purple"
                                aria-label="Channel Info"
                                onClick={onChannelInfoModalOpen}
                                icon={<MdInfo />}
                            /> */}
                        </div>
                    </div>
                )}
                {authenticated ? (
                    <>
                        {streamedUntilUpdatedAts &&
                            updatedAtTimestamps &&
                            currentFlowRates && (
                                <ScreenTotal
                                    streamedUntilUpdatedAts={
                                        streamedUntilUpdatedAts
                                    }
                                    updatedAtTimestamps={updatedAtTimestamps}
                                    currentFlowRates={currentFlowRates}
                                />
                            )}
                        {subscribedUsers && (
                            <ScreenList items={subscribedUsers} />
                        )}
                    </>
                ) : (
                    <>
                        {isConnected ? (
                            isConnectedUserStreaming ? (
                                unlockTime ? (
                                    <>
                                        <div className="flex flex-col w-full h-full flex-1 justify-center">
                                            <div className="flex flex-col items-center bg-[url('/pattern.svg')] space-y-4 p-4">
                                                <img src="/lock.svg" />

                                                <p>Casting Unlocks in</p>
                                                <Heading
                                                    size="md"
                                                    colorScheme="purple"
                                                >
                                                    {unlockTime}
                                                </Heading>
                                                <Link
                                                    href={`https://warpcast.com/~/channel/${channel?.id}`}
                                                    target="_blank"
                                                >
                                                    <Button colorScheme="purple">
                                                        View Channel
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {streamedUntilUpdatedAts &&
                                            updatedAtTimestamps &&
                                            currentFlowRates && (
                                                <ScreenTotal
                                                    streamedUntilUpdatedAts={
                                                        streamedUntilUpdatedAts
                                                    }
                                                    updatedAtTimestamps={
                                                        updatedAtTimestamps
                                                    }
                                                    currentFlowRates={
                                                        currentFlowRates
                                                    }
                                                />
                                            )}
                                        {subscribedUsers && (
                                            <ScreenList
                                                items={subscribedUsers}
                                            />
                                        )}
                                    </>
                                )
                            ) : (
                                <div className="flex flex-col w-full h-full flex-1 justify-center">
                                    <div className="flex flex-col h-full items-center bg-[url('/slide.svg'),_url('/pattern.svg')] bg-[length:100%_100%] bg-[position:10px_-25px] p-4">
                                        <img src="/token.svg" />
                                        <Button
                                            onClick={startStream}
                                            isLoading={loadingStartStream}
                                            colorScheme="purple"
                                        >
                                            Stream {channel?.threshold}{" "}
                                            DEGENx/day
                                        </Button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col w-full h-full flex-1 justify-center">
                                <div className="flex flex-col h-full items-center bg-[url('/slide.svg'),_url('/pattern.svg')]  bg-[length:100%_100%] bg-[position:10px_-25px] p-4">
                                    <img src="/token.svg" />
                                    <ConnectButton />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Screen>
        </>
    );
}
