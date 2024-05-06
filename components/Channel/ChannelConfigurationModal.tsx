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
} from "@chakra-ui/react";

export default function ChannelConfigurationModal({
    channel,
    isOpen,
    onClose,
}: {
    channel: Channel | null;
    isOpen: boolean;
    onClose: () => void;
}) {
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
                    <div className="flex flex-col items-start w-full space-y-4">
                        <div className="flex flex-col space-y-2 justify-between items-start w-full">
                            <Text fontSize="sm">Threshold</Text>
                            <Input placeholder="5" />
                        </div>
                    </div>
                    <Button className="w-full" colorScheme="purple">
                        Save
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
