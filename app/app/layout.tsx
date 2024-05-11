"use client";

import { LoadingState } from "@/components/LoadingState";
import WithBottomBar from "@/components/withBottomBar";
import UserDataContext from "@/context/UserDataContext";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { ReactNode, useContext } from "react";

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
