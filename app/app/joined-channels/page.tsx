"use client";

import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTitle from "@/components/Screen/ScreenTitle";
import ScreenTotal from "@/components/Screen/ScreenTotal";
import UserDataContext from "@/context/UserDataContext";
import { useContext } from "react";

export default function JoinedChannels() {
    const context = useContext(UserDataContext);

    if (!context) return null;

    const { userjoinedChannels } = context;

    return (
        <Screen>
            <ScreenTitle>Joined Channels</ScreenTitle>
            <ScreenTotal />
            {userjoinedChannels && <ScreenList items={userjoinedChannels} />}
        </Screen>
    );
}
