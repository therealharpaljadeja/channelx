import { Button, Input } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { createClient } from "@vercel/kv";
import ChannelDataContext from "@/context/ChannelDataContext";

const kv = createClient({
    url: process.env.NEXT_PUBLIC_KV_REST_API_URL as string,
    token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN as string,
});

export function NFTGate({ setActiveStep }) {
    const [nftAddress, setNFTAddress] = useState<string | null>(null);
    const context = useContext(ChannelDataContext);

    if (!context) return null;

    const { channel } = context;

    async function setNFTInKV() {
        if (channel) {
            await kv.set(`SUBTYPE_${channel.id}`, "NFT");
            console.log(`NFTAddress: ${nftAddress}`);
            await kv.set(`${channel.id}`, nftAddress);
            return setActiveStep(1);
        }
    }

    return (
        <div className="flex flex-col space-y-2">
            <div>
                NFT address to gate
                <Input
                    value={nftAddress}
                    onChange={({ target }) => {
                        console.log("Target", target.value);
                        setNFTAddress(target.value);
                    }}
                />
            </div>
            <Button onClick={setNFTInKV} colorScheme="purple">
                Set
            </Button>
        </div>
    );
}
