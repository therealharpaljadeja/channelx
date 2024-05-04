"use client";

import WithBottomBar from "@/components/withBottomBar";
import { ReactNode } from "react";

export default function ChannelLayout({ children }: { children: ReactNode }) {
    return <WithBottomBar>{children}</WithBottomBar>;
}
