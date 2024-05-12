"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { PrivyProvider } from "@privy-io/react-auth";
import theme from "@/theme";
import { UserDataProvider } from "@/context/UserDataContext";
import "@rainbow-me/rainbowkit/styles.css";
import {
    connectorsForWallets,
    getDefaultConfig,
    lightTheme,
    RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { createConfig, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import {
    metaMaskWallet,
    walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createClient, http } from "viem";

const connectors = connectorsForWallets(
    [
        {
            groupName: "Recommended",
            wallets: [metaMaskWallet, walletConnectWallet],
        },
    ],
    {
        appName: "ChannelX",
        projectId: "cb7693d9cb23ef0ab5a94126a7634b52",
    }
);

const config = createConfig({
    chains: [base],
    connectors,
    client({ chain }) {
        return createClient({ chain, transport: http() });
    },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId="clvp35gj00131gq17ttxx3s3r"
            config={{
                // Customize Privy's appearance in your app
                appearance: {
                    theme: "light",
                    accentColor: "#676FFF",
                    logo: "/lock.svg",
                },
                loginMethods: ["farcaster"],
                // Create embedded wallets for users who don't have a wallet
            }}
        >
            <ChakraProvider theme={theme}>
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <RainbowKitProvider
                            theme={lightTheme({
                                accentColor: "#8A63D2",
                            })}
                        >
                            <UserDataProvider>{children}</UserDataProvider>
                        </RainbowKitProvider>
                    </QueryClientProvider>
                </WagmiProvider>
            </ChakraProvider>{" "}
        </PrivyProvider>
    );
}
