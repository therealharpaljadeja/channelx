"use client";

import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTitle from "@/components/Screen/ScreenTitle";
import ScreenTotal from "@/components/Screen/ScreenTotal";

export default function JoinedChannels() {
    return (
        <Screen>
            <ScreenTitle>Joined Channels</ScreenTitle>
            <ScreenTotal />
            <ScreenList />
        </Screen>
    );
}
