"use client";

import { ChannelDataProvider } from "@/context/ChannelDataContext";
import { ReactNode } from "react";

export default function ChannelLayout({ children }: { children: ReactNode }) {
    return <ChannelDataProvider>{children}</ChannelDataProvider>;
}
