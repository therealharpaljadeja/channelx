"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button, Skeleton } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function Login() {
    const { login, authenticated, ready } = usePrivy();
    const router = useRouter();

    if (!ready) return <Skeleton width="240px" height="40px" />;

    if (authenticated) return router.push("/app");

    return (
        <div className="flex flex-col space-y-8">
            <div className="flex space-x-2 items-center justify-center">
                <img src="/lock.svg" className="w-8" />
                <img src="/ChannelX.svg" className="w-36" />
            </div>
            <Button
                colorScheme="purple"
                color="white"
                onClick={login}
                leftIcon={<img className="h-4 w-4" src="/farcaster.svg" />}
            >
                Sign in with Farcaster
            </Button>
        </div>
    );
}
