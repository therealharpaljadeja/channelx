"use client";

import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTitle from "@/components/Screen/ScreenTitle";
import ScreenTotal from "@/components/Screen/ScreenTotal";
import UserDataContext from "@/context/UserDataContext";
import { useContext } from "react";

export default function OwnedChannels() {
    const context = useContext(UserDataContext);

    if (!context) return null;

    const { userOwnedChannels, loading } = context;

    return (
        <Screen>
            <ScreenTitle>Owned Channels</ScreenTitle>
            <ScreenTotal />
            {userOwnedChannels && <ScreenList items={userOwnedChannels} />}
        </Screen>
    );
}
