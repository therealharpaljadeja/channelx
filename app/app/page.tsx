"use client";

import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTitle from "@/components/Screen/ScreenTitle";
import ScreenTotal from "@/components/Screen/ScreenTotal";

export default function OwnedChannels() {
    return (
        <Screen>
            <ScreenTitle>Owned Channels</ScreenTitle>
            <ScreenTotal />
            <ScreenList />
        </Screen>
    );
}
