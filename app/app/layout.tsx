"use client";

import WithBottomBar from "@/components/withBottomBar";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
    const { ready, authenticated } = usePrivy();
    const router = useRouter();

    if (!ready) return null;

    if (!authenticated) return router.push("/");

    return <WithBottomBar>{children}</WithBottomBar>;
}
