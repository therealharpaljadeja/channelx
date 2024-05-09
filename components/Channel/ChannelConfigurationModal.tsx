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
import { useState } from "react";

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

    async function setChannelThreshold() {
        if (channel && threshold) {
            setLoading(true);
            try {
                console.log("adasda");
                await kv.set(channel.id, threshold);
                toast({
                    title: "Threshold set",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            } catch (error) {
                console.log(error);
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
