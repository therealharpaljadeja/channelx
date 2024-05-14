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
        <div className="w-full h-full bg-[#371a6c] overflow-hidden flex-1 flex relative flex-col justify-center">
            <img
                src="/Token.png"
                className="w-24 h-24 absolute top-24 left-4"
            />
            <img
                src="/Token.png"
                className="w-28 h-28 absolute top-[-24px] left-72"
            />
            <img
                src="/Token.png"
                className="w-36 h-36 absolute top-36 left-48"
            />

            <div className="flex flex-1 flex-col space-y-8 justify-center items-center">
                <div className="flex space-x-2 mt-36 items-center justify-center">
                    <img src="/ChannelX-logo.svg" className="w-36" />
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
            <div className="bg-transparent flex justify-center w-full p-12 bg-[url('/Stream.svg')] bg-cover bg-[position:56px_48px]">
                <img src="/FBI.svg" />
            </div>
        </div>
    );
}
