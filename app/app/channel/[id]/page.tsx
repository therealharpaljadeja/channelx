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
    Input,
    Select,
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
import { NFTGate } from "@/components/NFTGate";
import { TokenGate } from "@/components/TokenGate";
import { AlfaFrensGate } from "@/components/AlfaFrensGate";

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
                    channel.lead.id === 510701 ||
                    channel.moderator.id === 510701
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

    const context = useContext(ChannelDataContext);

    const [isClient, setIsClient] = useState(false);

    const {
        isOpen: isChannelConfigurationModalOpen,
        onOpen: onChannelConfigurationModalOpen,
        onClose: onChannelConfigurationModalClose,
    } = useDisclosure();

    const initialSteps = [
        {
            title: "Set Monthly subscription",
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
                        button to set subscription fee
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
                        Verify
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
        // {
        //     title: "Let your followers know!",
        //     description: (
        //         <div className="flex flex-col space-y-2">
        //             <Text>
        //                 Let your followers on Warpcast know that you gated the
        //                 channel and refresh the page
        //             </Text>
        //             <Link
        //                 className="w-full"
        //                 target="_blank"
        //                 href={`https://warpcast.com/~/compose?text=Hey%20%2F${channel?.id}%20is%20now%20DEGENx%20gated.%0A%0ASubscribe%20to%20cast%20to%20the%20channel%0A%0Ahttps%3A%2F%2Fchannelx.vercel.app%2Fsubscribe%2F${channel?.id}%20`}
        //             >
        //                 <Button className="w-full" colorScheme="purple">
        //                     Share on Warpcast
        //                 </Button>
        //             </Link>
        //         </div>
        //     ),
        // },
    ];

    const [steps, setSteps] = useState(initialSteps);

    const { authenticated, user } = usePrivy();

    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: 3,
    });

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!context) return null;

    const {
        channel,
        loading,
        subscribedUsers,
        currentFlowRates,
        streamedUntilUpdatedAts,
        updatedAtTimestamps,
    } = context;

    if (loading) return <LoadingState />;

    function isFidChannelHost(fid?: number | null) {
        if (channel && channel.lead && fid) {
            return channel.lead.fid === fid;
        }

        return 0;
    }
    console.log(channel?.threshold);

    function handleSubscriptionType({ target }: any) {
        switch (target.value) {
            case "stream":
                let steps = [
                    {
                        title: "Set Monthly subscription",
                        description: (
                            <div className="flex flex-col space-y-2">
                                <div>
                                    Use the{" "}
                                    <IconButton
                                        aria-label="edit-step"
                                        icon={<MdOutlineModeEdit />}
                                        onClick={
                                            onChannelConfigurationModalOpen
                                        }
                                        colorScheme="purple"
                                        className="mx-2"
                                    />{" "}
                                    button to set subscription fee
                                </div>
                                <Button
                                    onClick={async () => {
                                        let isThresholdSet =
                                            await checkIfThresholdIsSet(
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
                                    Verify
                                </Button>
                            </div>
                        ),
                    },
                    {
                        title: "Add @bot007 as co-host",
                        description: (
                            <div className="flex flex-col space-y-2">
                                <Text>
                                    Add @bot007 as your channel co-host so it
                                    can hide casts
                                </Text>
                                <Button
                                    onClick={async () => {
                                        let isBotCoHost =
                                            await checkIfBotIsCoHost(
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
                ];
                setSteps(steps);
                break;
            case "nft":
                let stepsNFT = [
                    {
                        title: "Set NFT Address",
                        description: <NFTGate setActiveStep={setActiveStep} />,
                    },
                    {
                        title: "Add @bot007 as co-host",
                        description: (
                            <div className="flex flex-col space-y-2">
                                <Text>
                                    Add @bot007 as your channel co-host so it
                                    can hide casts
                                </Text>
                                <Button
                                    onClick={async () => {
                                        let isBotCoHost =
                                            await checkIfBotIsCoHost(
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
                ];
                setSteps(stepsNFT);
                break;
            case "token":
                let stepsToken = [
                    {
                        title: "Set Token Address",
                        description: (
                            <TokenGate setActiveStep={setActiveStep} />
                        ),
                    },
                    {
                        title: "Add @bot007 as co-host",
                        description: (
                            <div className="flex flex-col space-y-2">
                                <Text>
                                    Add @bot007 as your channel co-host so it
                                    can hide casts
                                </Text>
                                <Button
                                    onClick={async () => {
                                        let isBotCoHost =
                                            await checkIfBotIsCoHost(
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
                ];
                setSteps(stepsToken);
                break;
            case "alfafrens":
                let stepsAlfaFrens = [
                    {
                        title: "Gate Channel by AlfaFrens Subscription",
                        description: (
                            <AlfaFrensGate setActiveStep={setActiveStep} />
                        ),
                    },
                    {
                        title: "Add @bot007 as co-host",
                        description: (
                            <div className="flex flex-col space-y-2">
                                <Text>
                                    Add @bot007 as your channel co-host so it
                                    can hide casts
                                </Text>
                                <Button
                                    onClick={async () => {
                                        let isBotCoHost =
                                            await checkIfBotIsCoHost(
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
                ];
                setSteps(stepsAlfaFrens);
                break;
        }
    }

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
                <div>
                    <Text>Subscription Type</Text>
                    <Select onChange={handleSubscriptionType}>
                        <option value="stream">Stream</option>
                        <option value="nft">NFT</option>
                        <option value="token">Token</option>
                        <option value="alfafrens">AlfaFrens</option>
                    </Select>
                </div>
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
