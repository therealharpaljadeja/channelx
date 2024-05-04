import {
    Button,
    Heading,
    IconButton,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";
import { MdCheck, MdContentCopy } from "react-icons/md";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useState } from "react";

export default function ChannelInfoModal({
    channel,
    isOpen,
    onClose,
}: {
    channel: Channel | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [copied, setCopied] = useState(false);
    if (!channel) return null;

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
                    <div className="flex flex-col items-start w-full space-y-2">
                        <div className="flex space-y-2 justify-between items-center w-full">
                            <Text fontSize="sm">Channel Owner</Text>

                            <div className="flex items-center space-x-2 rounded-md p-2">
                                <Text fontSize="md" className="text-gray-700">
                                    {`${channel.lead.verified_addresses.eth_addresses[0].substring(
                                        0,
                                        7
                                    )}...`}
                                </Text>
                                <CopyToClipboard
                                    text={
                                        channel.lead.verified_addresses
                                            .eth_addresses[0]
                                    }
                                    onCopy={() => {
                                        setCopied(true);
                                        setTimeout(() => {
                                            setCopied(false);
                                        }, 3000);
                                    }}
                                >
                                    <IconButton
                                        aria-label="Channel Owner Copy"
                                        colorScheme="purple"
                                        size={"sm"}
                                        variant={"outline"}
                                        disabled={copied}
                                        icon={
                                            copied ? (
                                                <MdCheck />
                                            ) : (
                                                <MdContentCopy />
                                            )
                                        }
                                    />
                                </CopyToClipboard>
                            </div>
                        </div>
                        <div className="flex space-y-2 justify-between items-center w-full">
                            <Text fontSize="sm">Stream Rate</Text>
                            <div className="flex justify-between items-center p-2">
                                <Text fontSize="md" className="text-gray-700">
                                    69 DEGENx/mo
                                </Text>
                            </div>
                        </div>
                        <div className="flex space-y-2 justify-between items-center w-full">
                            <Text fontSize="sm">Threshold</Text>
                            <div className="flex justify-between items-center p-2">
                                <Text fontSize="md" className="text-gray-700">
                                    10 DEGENx
                                </Text>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="purple" size="lg" className="w-full">
                        Start Stream
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
