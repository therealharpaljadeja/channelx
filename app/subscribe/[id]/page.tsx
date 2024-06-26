"use client";

import ChannelConfigurationModal from "@/components/Channel/ChannelConfigurationModal";
import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTotal from "@/components/Screen/ScreenTotal";
import ChannelDataContext from "@/context/ChannelDataContext";
import { cfaStream, fetchAllOutgoingStreamsFromAnAddress } from "@/utils/api";
import { Button, Heading, Spacer, Text, useDisclosure } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ConstantFlowAgreementV1 } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { MdInfo } from "react-icons/md";
import { useAccount, useConfig, Config } from "wagmi";
import { Account, Chain, Client, Transport, parseEther } from "viem";
import { getConnectorClient } from "@wagmi/core";
import { LoadingState } from "@/components/LoadingState";
import { useRouter } from "next/navigation";

const cfaV1 = new ConstantFlowAgreementV1(
    "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74",
    "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74",
    "0xcfA132E353cB4E398080B9700609bb008eceB125"
);

const DEGENx = "0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529";

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
    const router = useRouter();
    const context = useContext(ChannelDataContext);
    const { isConnected, address } = useAccount();
    const config = useConfig();
    // const [unlockTime, setUnlockTime] = useState<string | null>(null);
    const [loadingStartStream, setLoading] = useState(false);
    const [isConnectedUserStreaming, setIsConnectedUserStreaming] =
        useState(false);
    const [channelOwner, setChannelOwner] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

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

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        async function isConnectedUserStreamingToChannelOwner() {
            console.log(isConnected, address, channel);
            if (isConnected && address && channel) {
                let channelOwner =
                    channel.lead.verified_addresses.eth_addresses[0];

                let { cfaStreams } = await fetchAllOutgoingStreamsFromAnAddress(
                    // "0xaB8a67743325347Aa53bCC66850f8F13df87e3AF".toLowerCase()
                    address.toLowerCase()
                );

                cfaStreams = cfaStreams.filter((stream: cfaStream) => {
                    return (
                        stream.receiver &&
                        stream.receiver.id === channelOwner.toLowerCase()
                    );
                });

                let cfaStream = cfaStreams.filter((stream: cfaStream) => {
                    return (
                        stream.receiver &&
                        stream.receiver.id === channelOwner.toLowerCase() &&
                        Number(stream.currentFlowRate) > 0
                    );
                })[0];

                if (cfaStream) {
                    let amountStreamingToUser =
                        BigInt(
                            parseEther((channel.threshold as string).toString())
                        ) -
                        (BigInt(cfaStream.currentFlowRate) *
                            BigInt(
                                Date.now() - cfaStream.updatedAtTimestamp * 1000
                            )) /
                            BigInt(1000);

                    // let timeAfterWhichCastingUnlocks = Number(
                    //     amountStreamingToUser /
                    //         BigInt(cfaStream.currentFlowRate)
                    // );

                    setIsConnectedUserStreaming(true);
                    // console.log("unlockTime", unlockTime);
                    // setUnlockTime(formatTime(timeAfterWhichCastingUnlocks));
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
                const createFlowOperation = await cfaV1.createFlow({
                    superToken: DEGENx,
                    sender: address,
                    receiver: channelOwner,
                    flowRate: (
                        (parseEther(channel.threshold?.toString() as string) *
                            BigInt(4)) /
                        BigInt(24 * 60 * 60)
                    ).toString(),
                });

                const txnResponse = await createFlowOperation.exec(
                    await getEthersSigner(config)
                );

                const txnReceipt = await txnResponse.wait();

                console.log(txnReceipt);

                router.refresh();
            }
        } catch (error) {
            console.log("Error");
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function deleteFlow() {
        setLoading(true);
        try {
            if (channelOwner && channel && isConnected && address) {
                let deleteFlowOperation = cfaV1.deleteFlow({
                    sender: address,
                    receiver: channelOwner,
                    superToken: DEGENx,
                });

                const txnResponse = await deleteFlowOperation.exec(
                    await getEthersSigner(config)
                );

                const txnReceipt = await txnResponse.wait();

                console.log(txnReceipt);

                router.refresh();
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
                initialChannelThreshold={channel?.threshold?.toString()}
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
                            {isConnectedUserStreaming && (
                                <Button
                                    colorScheme="red"
                                    aria-label="Stop Stream"
                                    onClick={deleteFlow}
                                >
                                    Stop
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {isConnected ? (
                    isConnectedUserStreaming ? (
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
                                        currentFlowRates={currentFlowRates}
                                    />
                                )}
                            {subscribedUsers && (
                                <ScreenList items={subscribedUsers} />
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col w-full h-full flex-1 justify-center">
                            {channel?.threshold && (
                                <div className="flex flex-col h-full space-y-2 items-center bg-[url('/slide.svg'),_url('/pattern.svg')]  bg-[length:100%_100%] bg-[position:10px_-25px] p-4">
                                    <div className="flex flex-col items-center">
                                        <img src="/Token.png" />
                                        <Button
                                            onClick={startStream}
                                            isLoading={loadingStartStream}
                                            colorScheme="purple"
                                        >
                                            Stream {Number(channel?.threshold)}{" "}
                                            DEGENx/month
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col w-full h-full flex-1 justify-center">
                        <div className="flex flex-col h-full items-center bg-[url('/slide.svg'),_url('/pattern.svg')]  bg-[length:100%_100%] bg-[position:10px_-25px] p-4">
                            <img src="/Token.png" />
                            <ConnectButton />
                        </div>
                    </div>
                )}
            </Screen>
        </>
    );
}
