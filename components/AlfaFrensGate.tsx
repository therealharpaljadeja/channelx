import { Button, Input } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { createClient } from "@vercel/kv";
import ChannelDataContext from "@/context/ChannelDataContext";
import axios from "axios";

const kv = createClient({
    url: process.env.NEXT_PUBLIC_KV_REST_API_URL as string,
    token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN as string,
});

export function AlfaFrensGate({ setActiveStep }: any) {
    const context = useContext(ChannelDataContext);

    if (!context) return null;

    const { channel } = context;

    async function createChannelWebhook(channelId: string, channelUrl: string) {
        let response = await axios.post(
            "https://api.neynar.com/v2/farcaster/webhook",
            {
                name: channelId,
                url: "https://cast-hide-2.vercel.app/api/alfafrens",
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
    }

    async function setNFTInKV() {
        if (channel) {
            await kv.set(`SUBTYPE_${channel.id}`, "ALFAFRENS");
            await kv.set(`${channel.id}`, "ALFAFRENS");
            await createChannelWebhook(channel.id, channel.parent_url);
            return setActiveStep(1);
        }
    }

    return (
        <div className="flex flex-col space-y-2">
            <Button onClick={setNFTInKV} colorScheme="purple">
                Set
            </Button>
        </div>
    );
}
