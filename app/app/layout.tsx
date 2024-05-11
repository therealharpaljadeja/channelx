"use client";

import Screen from "@/components/Screen";
import WithBottomBar from "@/components/withBottomBar";
import UserDataContext from "@/context/UserDataContext";
import { Skeleton } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { ReactNode, useContext } from "react";

export function LoadingState() {
    return (
        <Screen>
            <Skeleton width="200px" height="40px" />
            <Skeleton className="w-full" height="120px" />
            <div className="flex flex-col space-y-2 !mt-6">
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
            </div>
        </Screen>
    );
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const { ready, authenticated } = usePrivy();
    const router = useRouter();
    const context = useContext(UserDataContext);

    if (!ready || !context) return null;

    if (!authenticated) return router.push("/");

    const { loading } = context;

    return (
        <WithBottomBar>{loading ? <LoadingState /> : children}</WithBottomBar>
    );
}
