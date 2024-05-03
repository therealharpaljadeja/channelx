"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { PrivyProvider } from "@privy-io/react-auth";
import theme from "@/theme";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId="clvp35gj00131gq17ttxx3s3r"
            config={{
                // Customize Privy's appearance in your app
                appearance: {
                    theme: "light",
                    accentColor: "#676FFF",
                    logo: "https://your-logo-url",
                },
                loginMethods: ["farcaster"],
                // Create embedded wallets for users who don't have a wallet
            }}
        >
            <ChakraProvider theme={theme}>{children}</ChakraProvider>{" "}
        </PrivyProvider>
    );
}
