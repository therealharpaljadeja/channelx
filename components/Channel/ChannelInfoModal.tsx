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
import { useEffect, useState } from "react";
import { ConstantFlowAgreementV1 } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import { Config, useAccount, useConfig } from "wagmi";
import { Account, Chain, Client, Transport } from "viem";
import { getConnectorClient } from "@wagmi/core";
import { Channel } from "@/utils/api";
import { createClient } from "@vercel/kv";

const hostAddress = "0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74";
const cfaV1Address = "0x19ba78B9cDB05A877718841c574325fdB53601bb";
const cfaV1ForwarderAddress = "0xcfA132E353cB4E398080B9700609bb008eceB125";

const cfaV1 = new ConstantFlowAgreementV1(
    hostAddress,
    cfaV1Address,
    cfaV1ForwarderAddress
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

const kv = createClient({
    url: process.env.NEXT_PUBLIC_KV_REST_API_URL as string,
    token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN as string,
});

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
    const { address } = useAccount();
    const config = useConfig();
    const [loading, setLoading] = useState(false);
    const [threshold, setThreshold] = useState("");

    useEffect(() => {
        async function getChannel() {
            if (channel) {
                let threshold = (await kv.get(channel?.id)) as string;
                setThreshold(threshold);
            }
        }

        getChannel();
    }, [channel]);

    if (!channel) return null;

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
            if (channel?.lead.verified_addresses.eth_addresses) {
                const createFlowOperation = await cfaV1.createFlow({
                    superToken: "0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529",
                    sender: address,
                    receiver: channel?.lead.verified_addresses.eth_addresses[0],
                    flowRate: "115740740740740",
                });

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
                                    10 DEGENx/day
                                </Text>
                            </div>
                        </div>
                        {threshold && (
                            <div className="flex space-y-2 justify-between items-center w-full">
                                <Text fontSize="sm">Threshold</Text>
                                <div className="flex justify-between items-center p-2">
                                    <Text
                                        fontSize="md"
                                        className="text-gray-700"
                                    >
                                        {threshold} DEGENx
                                    </Text>
                                </div>
                            </div>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    {address && (
                        <Button
                            onClick={startStream}
                            isLoading={loading}
                            colorScheme="purple"
                            size="lg"
                            className="w-full"
                        >
                            Start Stream
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
