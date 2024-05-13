import { Channel } from "@/utils/api";
import {
    Button,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useToast,
} from "@chakra-ui/react";
import { createClient } from "@vercel/kv";
import axios from "axios";
import { useState } from "react";
import { MdInfo } from "react-icons/md";

const kv = createClient({
    url: process.env.NEXT_PUBLIC_KV_REST_API_URL as string,
    token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN as string,
});

export default function ChannelConfigurationModal({
    channel,
    isOpen,
    onClose,
}: {
    channel: Channel | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [threshold, setThreshold] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    if (!channel) return null;

    async function handleThresholdChange(e: React.FormEvent<HTMLInputElement>) {
        let threshold = e.currentTarget.value;
        setThreshold(threshold);
    }

    async function createChannelWebhook(channelId: string, channelUrl: string) {
        console.log(process.env.NEXT_PUBLIC_NEYNAR_API_KEY);
        let response = await axios.post(
            "https://api.neynar.com/v2/farcaster/webhook",
            {
                name: channelId,
                url: "https://cast-hide-2.vercel.app/api/cast",
                subscription: {
                    "cast.created": { root_parent_urls: [channelUrl] },
                },
            },
            {
                headers: {
                    Accept: "application/json",
                    api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
                },
            }
        );

        console.log(response);
    }

    async function setChannelThreshold() {
        if (channel && threshold) {
            setLoading(true);
            try {
                let channelExists = await kv.get(channel.id);

                console.log("ChannelExists", channelExists);

                if (!channelExists) {
                    // Create webhook for channel because is not being tracked
                    await createChannelWebhook(channel.id, channel.parent_url);
                }

                await kv.set(channel.id, threshold);

                toast({
                    title: "Threshold set.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
                toast({
                    title: "Just add @bot007 as a co-host and the bot will do the rest",
                    status: "info",
                    containerStyle: {
                        width: "350px",
                    },
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
                onClose();
            } catch (error) {
                toast({
                    title: "Something went wrong",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
            <ModalOverlay />
            <ModalContent className="pb-4">
                <ModalHeader>
                    <ModalCloseButton />
                </ModalHeader>
                <ModalBody className="flex flex-col items-center space-y-6">
                    <div className="flex flex-col items-center space-y-2">
                        <img
                            className="h-14 w-14 rounded-full"
                            src={channel.image_url}
                        />
                        <Heading size="md">{channel.name}</Heading>
                    </div>
                    <div className="flex flex-col items-start w-full space-y-4">
                        <div className="flex flex-col space-y-2 justify-between items-start w-full">
                            <Text fontSize="sm">Threshold</Text>
                            <Input
                                onChange={handleThresholdChange}
                                placeholder="5"
                            />
                            <div className="flex space-x-2 items-center">
                                <MdInfo className="text-gray-500" />
                                <Text fontSize="sm" className="text-gray-500">
                                    {Number(threshold) * 30} DEGENx income per
                                    month
                                </Text>
                            </div>
                        </div>
                    </div>
                    <Button
                        disabled={!threshold}
                        isLoading={loading}
                        onClick={setChannelThreshold}
                        className="w-full"
                        colorScheme="purple"
                    >
                        Save
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
