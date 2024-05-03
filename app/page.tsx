"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button, Skeleton } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function Login() {
    const { login, authenticated, ready } = usePrivy();
    const router = useRouter();

    if (!ready) return <Skeleton height="20px" />;

    if (authenticated) return router.push("/app");

    return (
        <Button
            colorScheme="purple"
            color="white"
            onClick={login}
            leftIcon={<img className="h-4 w-4" src="./farcaster.svg" />}
        >
            Sign in with Farcaster
        </Button>
    );
}
