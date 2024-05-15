"use client";

import ChannelConfigurationModal from "@/components/Channel/ChannelConfigurationModal";
import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTotal from "@/components/Screen/ScreenTotal";
import ChannelDataContext from "@/context/ChannelDataContext";

import {
    Box,
    Button,
    Heading,
    IconButton,
    Spacer,
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    Text,
    useDisclosure,
    useSteps,
    useToast,
} from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
// import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { ConstantFlowAgreementV1 } from "@superfluid-finance/sdk-core";
// import { ethers } from "ethers";
// import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { MdInfo, MdOutlineModeEdit, MdStop } from "react-icons/md";
// import { useAccount, useConfig, Config } from "wagmi";
// import { Account, Chain, Client, Transport, parseEther } from "viem";
// import { getConnectorClient } from "@wagmi/core";
import { LoadingState } from "@/components/LoadingState";
import Link from "next/link";
import { createClient } from "@vercel/kv";
import axios from "axios";

// const cfaV1 = new ConstantFlowAgreementV1(
//     "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74",
//     "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74",
//     "0xcfA132E353cB4E398080B9700609bb008eceB125"
// );

// const DEGENx = "0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529";

// function clientToSigner(client: Client<Transport, Chain, Account>) {
//     const { account, chain, transport } = client;
//     const network = {
//         chainId: chain.id,
//         name: chain.name,
//         ensAddress: chain.contracts?.ensRegistry?.address,
//     };
//     const provider = new ethers.providers.Web3Provider(transport, network);
//     const signer = provider.getSigner(account.address);
//     return signer;
// }

// function formatTime(seconds: number) {
//     const days = Math.floor(seconds / (3600 * 24));
//     const hours = Math.floor((seconds % (3600 * 24)) / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const remainingSeconds = seconds % 60;

//     let result = "";
//     if (days > 0) {
//         result += days + "d ";
//     }
//     if (hours > 0) {
//         result += hours + "hr ";
//     }
//     if (minutes > 0) {
//         result += minutes + "min ";
//     }
//     if (remainingSeconds > 0) {
//         result += remainingSeconds + "sec";
//     }

//     return result.trim();
// }

const kv = createClient({
    url: process.env.NEXT_PUBLIC_KV_REST_API_URL as string,
    token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN as string,
});

async function checkIfThresholdIsSet(fid?: string) {
    if (fid) {
        let threshold = (await kv.get(fid)) as string;
        return Boolean(threshold);
    }

    return 0;
}

async function checkIfBotIsCoHost(fid?: string) {
    if (fid) {
        try {
            let response = await axios.get(
                `https://api.neynar.com/v2/farcaster/channel/search?q=${fid}`,
                {
                    headers: {
                        Accept: "application/json",
                        api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
                    },
                }
            );

            let { channels } = response.data;

            let channel = channels[0];

            if (channel) {
                return (
                    channel.hosts.filter(
                        (host: { fid: number }) => host.fid == 510701
                    ).length > 0
                );
            }

            return 0;
        } catch (error) {
            console.log(error);
        }
    }

    return 0;
}

export default function ChannelDetailsPage() {
    const toast = useToast();

    // const router = useRouter();
    const context = useContext(ChannelDataContext);
    // const { isConnected, address } = useAccount();
    // const config = useConfig();
    // const [unlockTime, setUnlockTime] = useState<string | null>(null);
    // const [loadingStartStream, setLoading] = useState(false);
    // const [isConnectedUserStreaming, setIsConnectedUserStreaming] =
    //     useState(false);
    // const [channelOwner, setChannelOwner] = useState<string | null>(null);
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

    const { authenticated, user } = usePrivy();

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: 3,
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    // useEffect(() => {
    //     async function isConnectedUserStreamingToChannelOwner() {
    //         if (isConnected && address && channel) {
    //             let channelOwner =
    //                 channel.lead.verified_addresses.eth_addresses[0];

    //             let { cfaStreams } = await fetchAllOutgoingStreamsFromAnAddress(
    //                 // "0xaB8a67743325347Aa53bCC66850f8F13df87e3AF".toLowerCase()
    //                 address.toLowerCase()
    //             );

    //             cfaStreams = cfaStreams.filter((stream: cfaStream) => {
    //                 return (
    //                     stream.receiver &&
    //                     stream.receiver.id === channelOwner.toLowerCase()
    //                 );
    //             });

    //             let cfaStream = cfaStreams.filter((stream: cfaStream) => {
    //                 return (
    //                     stream.receiver &&
    //                     stream.receiver.id === channelOwner.toLowerCase() &&
    //                     Number(stream.currentFlowRate) > 0
    //                 );
    //             })[0];

    //             if (cfaStream) {
    //                 let amountStreamingToUser =
    //                     BigInt(
    //                         parseEther((channel.threshold as string).toString())
    //                     ) -
    //                     (BigInt(cfaStream.currentFlowRate) *
    //                         BigInt(
    //                             Date.now() - cfaStream.updatedAtTimestamp * 1000
    //                         )) /
    //                         BigInt(1000);

    //                 let timeAfterWhichCastingUnlocks = Number(
    //                     amountStreamingToUser /
    //                         BigInt(cfaStream.currentFlowRate)
    //                 );

    //                 setIsConnectedUserStreaming(true);
    //                 setUnlockTime(formatTime(timeAfterWhichCastingUnlocks));
    //             } else {
    //                 setIsConnectedUserStreaming(false);
    //             }

    //             setChannelOwner(channelOwner);
    //         }
    //     }

    //     isConnectedUserStreamingToChannelOwner();
    // }, [isConnected, user, address, context]);

    if (!context) return null;

    // async function getEthersSigner(
    //     config: Config,
    //     { chainId }: { chainId?: number } = {}
    // ) {
    //     const client = await getConnectorClient(config, { chainId });
    //     return clientToSigner(client);
    // }

    // async function startStream() {
    //     setLoading(true);
    //     try {
    //         if (channelOwner && channel) {
    //             console.log(channel.threshold);
    //             const createFlowOperation = await cfaV1.createFlow({
    //                 superToken: DEGENx,
    //                 sender: address,
    //                 receiver: channelOwner,
    //                 flowRate: (
    //                     (parseEther(channel.threshold?.toString() as string) *
    //                         BigInt(4)) /
    //                     BigInt(24 * 60 * 60)
    //                 ).toString(),
    //             });

    //             const txnResponse = await createFlowOperation.exec(
    //                 await getEthersSigner(config)
    //             );

    //             const txnReceipt = await txnResponse.wait();

    //             console.log(txnReceipt);

    //             router.refresh();
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    // async function deleteFlow() {
    //     setLoading(true);
    //     try {
    //         if (channelOwner && channel && isConnected && address) {
    //             let deleteFlowOperation = cfaV1.deleteFlow({
    //                 sender: address,
    //                 receiver: channelOwner,
    //                 superToken: DEGENx,
    //             });

    //             const txnResponse = await deleteFlowOperation.exec(
    //                 await getEthersSigner(config)
    //             );

    //             const txnReceipt = await txnResponse.wait();

    //             console.log(txnReceipt);

    //             router.refresh();
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    const {
        channel,
        loading,
        subscribedUsers,
        currentFlowRates,
        streamedUntilUpdatedAts,
        updatedAtTimestamps,
    } = context;

    const steps = [
        {
            title: "Set DegenX Threshold",
            description: (
                <div className="flex flex-col space-y-2">
                    <div>
                        Use the{" "}
                        <IconButton
                            aria-label="edit-step"
                            icon={<MdOutlineModeEdit />}
                            onClick={onChannelConfigurationModalOpen}
                            colorScheme="purple"
                            className="mx-2"
                        />{" "}
                        button to set threshold
                    </div>
                    <Button
                        onClick={async () => {
                            let isThresholdSet = await checkIfThresholdIsSet(
                                channel?.id
                            );
                            if (isThresholdSet) {
                                return setActiveStep(1);
                            }

                            return toast({
                                status: "error",
                                description: "Threshold not set",
                                isClosable: true,
                            });
                        }}
                        colorScheme="purple"
                    >
                        Verify Threshold
                    </Button>
                </div>
            ),
        },
        {
            title: "Add @bot007 as co-host",
            description: (
                <div className="flex flex-col space-y-2">
                    <Text>
                        Add @bot007 as your channel co-host so it can hide casts
                    </Text>
                    <Button
                        onClick={async () => {
                            let isBotCoHost = await checkIfBotIsCoHost(
                                channel?.id
                            );
                            if (isBotCoHost) {
                                return setActiveStep(2);
                            }

                            return toast({
                                status: "error",
                                description: "Bot is not co-host",
                                isClosable: true,
                            });
                        }}
                        colorScheme="purple"
                    >
                        Check @bot007 co-host
                    </Button>
                </div>
            ),
        },
        {
            title: "Let your followers know!",
            description: (
                <div className="flex flex-col space-y-2">
                    <Text>
                        Let your followers on Warpcast know that you gated the
                        channel and refresh the page
                    </Text>
                    <Link
                        className="w-full"
                        target="_blank"
                        href={`https://warpcast.com/~/compose?text=Hey%20%2F${channel?.id}%20is%20now%20DEGENx%20gated.%0A%0ASubscribe%20to%20cast%20to%20the%20channel%0A%0Ahttps%3A%2F%2Fchannelx.vercel.app%2Fsubscribe%2F${channel?.id}%20`}
                    >
                        <Button className="w-full" colorScheme="purple">
                            Share on Warpcast
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    if (loading) return <LoadingState />;

    function isFidChannelHost(fid?: number | null) {
        if (channel && channel.hosts && fid) {
            return channel.hosts.filter((host) => host.fid === fid).length > 0;
        }

        return 0;
    }
    console.log(channel?.threshold);

    if (channel && !channel.threshold) {
        return (
            <Screen>
                <ChannelConfigurationModal
                    channel={channel}
                    initialChannelThreshold={channel?.threshold?.toString()}
                    isOpen={isChannelConfigurationModalOpen}
                    onClose={onChannelConfigurationModalClose}
                />
                <div className="flex items-center space-x-2 mb-4">
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
                        isFidChannelHost(user.farcaster?.fid) ? (
                            <IconButton
                                colorScheme="purple"
                                aria-label="Edit Channel Settings"
                                onClick={onChannelConfigurationModalOpen}
                                icon={<MdOutlineModeEdit />}
                            />
                        ) : null}
                    </div>
                </div>
                <Heading className="mb-12" size={"md"}>
                    Setup Channel
                </Heading>
                <div className="flex flex-col">
                    <Stepper
                        orientation="vertical"
                        size="lg"
                        index={activeStep}
                    >
                        {steps.map((step, index) => (
                            <Step key={index} className="mb-2">
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>

                                <div className="flex flex-col space-y-4">
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription>
                                        {step.description}
                                    </StepDescription>
                                </div>

                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>
                </div>
            </Screen>
        );
    }

    return (
        <>
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
                            {authenticated &&
                            user &&
                            isFidChannelHost(user.farcaster?.fid) ? (
                                <IconButton
                                    colorScheme="purple"
                                    aria-label="Edit Channel Settings"
                                    onClick={onChannelConfigurationModalOpen}
                                    icon={<MdOutlineModeEdit />}
                                />
                            ) : null}
                        </div>
                    </div>
                )}

                {authenticated &&
                channel &&
                user &&
                isFidChannelHost(user.farcaster?.fid) ? (
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
                    // User is farcaster logged in and is trying to configure a channel that he/she doesn't own
                    <div>You are not allowed to configure this channel</div>
                )}
            </Screen>
        </>
    );
}
