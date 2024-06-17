/** @jsxImportSource frog/jsx */
import { Button, Frog, TextInput } from "frog";

import { handle } from "frog/next";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { createClient } from "@vercel/kv";
import {
    fetchAddressAndUsernameOfAnFid,
    fetchChannelOwnerAddress,
    getDegenXStreamBetween2Addresses,
} from "@/utils/api";
import abi from "@/utils/abi/CFA";

// When someone tries to click on frame url they go to subscribe page.
const app = new Frog({
    basePath: "/api/frame",
    browserLocation: "/subscribe/:channelId",
});

const kv = createClient({
    url: process.env.NEXT_PUBLIC_KV_REST_API_URL as string,
    token: process.env.NEXT_PUBLIC_KV_REST_API_TOKEN as string,
});

const CFA = "0xcfA132E353cB4E398080B9700609bb008eceB125";

app.frame("/:channelId", async (c) => {
    const channelId = c.req.param("channelId");

    if (channelId) {
        // Check if channel has enabled gating.
        // Check which type of gating
        let gatingType = await kv.get(`SUBTYPE_${channelId}`);

        switch (gatingType) {
            case "STREAM":
                let streamRate = await kv.get(`${channelId}`);

                return c.res({
                    action: "/finish",
                    image: (
                        <div
                            style={{
                                color: "white",
                                display: "flex",
                                width: "100%",
                                background: "black",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                            }}
                        >
                            <img
                                height="240"
                                width="240"
                                style={{ borderRadius: "240" }}
                                src="https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/1510a5b0-80e0-433b-2170-4883bc95c800/original"
                            />
                            <p style={{ fontSize: "48", fontWeight: "500" }}>
                                Degenx
                            </p>
                            <p style={{ fontSize: "32" }}>
                                To Cast stream {streamRate} DEGENx/Month
                            </p>
                        </div>
                    ),
                    intents: [
                        <Button action={`/${channelId}/eligibility`}>
                            Check Eligibility
                        </Button>,
                        <Button.Transaction target={`/${channelId}/stream`}>
                            Start Streaming
                        </Button.Transaction>,
                    ],
                });
            case "ALFAFRENS":
                return c.res({
                    image: (
                        <div
                            style={{
                                color: "white",
                                display: "flex",
                                width: "100%",
                                background: "black",
                                height: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                            }}
                        >
                            <img
                                height="240"
                                width="240"
                                style={{ borderRadius: "240" }}
                                src="https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/1510a5b0-80e0-433b-2170-4883bc95c800/original"
                            />
                            <p style={{ fontSize: "48", fontWeight: "500" }}>
                                Degenx
                            </p>
                            <p style={{ fontSize: "32" }}>
                                Subscribe to X's AlfaFrens
                            </p>
                        </div>
                    ),
                    intents: [
                        <Button action={`/${channelId}/eligibility`}>
                            Check Eligibility
                        </Button>,
                        <Button>Subscribe To AlfaFrens</Button>,
                    ],
                });
        }
    }

    return c.res({
        image: (
            <div
                style={{
                    color: "white",
                    display: "flex",
                    width: "100%",
                    background: "black",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <p style={{ fontSize: "48", fontWeight: "500" }}>
                    No Channel Information Found
                </p>
            </div>
        ),
    });
});

app.frame("/:channelId/eligibility", async (c) => {
    const channelId = c.req.param("channelId");
    const { frameData } = c;

    if (frameData) {
        const { fid } = frameData;
        if (channelId) {
            // Check which type of gating
            let gatingType = await kv.get(`SUBTYPE_${channelId}`);

            switch (gatingType) {
                case "STREAM":
                    // Checking if the user is streaming to channel owner

                    let channelOwnerAddress = await fetchChannelOwnerAddress(
                        channelId
                    );

                    let {
                        verifiedAddress: currentUserConnectedAddress,
                        username,
                    } = await fetchAddressAndUsernameOfAnFid(399712);

                    // Find out if the current fid connected address is streaming to channel owner
                    let streams = await getDegenXStreamBetween2Addresses(
                        currentUserConnectedAddress,
                        channelOwnerAddress
                    );

                    let stream = streams[0];

                    let { currentFlowRate } = stream;

                    if (currentFlowRate > 0) {
                        return c.res({
                            image: (
                                <div
                                    style={{
                                        color: "white",
                                        display: "flex",
                                        width: "100%",
                                        background: "black",
                                        height: "100%",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: "48",
                                            fontWeight: "500",
                                        }}
                                    >
                                        @{username} is eligible to cast in{" "}
                                        {channelId}
                                    </p>
                                </div>
                            ),
                        });
                    }

                    return c.res({
                        image: (
                            <div
                                style={{
                                    color: "white",
                                    display: "flex",
                                    width: "100%",
                                    background: "black",
                                    height: "100%",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "column",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "48",
                                        fontWeight: "500",
                                    }}
                                >
                                    Not Eligible, since you are not streaming.
                                </p>
                            </div>
                        ),
                    });
            }
        }
    }

    return c.res({
        image: (
            <div
                style={{
                    color: "white",
                    display: "flex",
                    width: "100%",
                    background: "black",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <p style={{ fontSize: "48", fontWeight: "500" }}>
                    No Channel Information Found
                </p>
            </div>
        ),
    });
});

app.frame("/finish", (c) => {
    const { transactionId } = c;
    return c.res({
        image: (
            <div style={{ color: "white", display: "flex", fontSize: 60 }}>
                Transaction ID: {transactionId}
            </div>
        ),
    });
});

app.transaction("/:channelId/stream", async (c) => {
    const channelId = c.req.param("channelId");
    const { frameData } = c;

    if (frameData) {
        const { fid } = frameData;

        let channelOwnerAddress = await fetchChannelOwnerAddress(channelId);

        let { verifiedAddress: currentUserConnectedAddress } =
            await fetchAddressAndUsernameOfAnFid(399712);

        return c.contract({
            abi,
            chainId: "eip155:8453",
            to: CFA,
            functionName: "createFlow",
            args: [
                "0x1eff3dd78f4a14abfa9fa66579bd3ce9e1b30529", //token
                currentUserConnectedAddress, // sender // receiver
                ,
                1835317460, // flowRate
                "", // userData
            ],
        });
    }

    return c.send({
        chainId: "eip155:8453",
        to: "0xd2135CfB216b74109775236E36d4b433F1DF507B",
        value: BigInt(1),
    });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
