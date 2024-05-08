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

    const {
        userOwnedChannels,
        loading,
        currentFlowRates,
        streamedUntilUpdatedAts,
        updatedAtTimestamps,
    } = context;

    return (
        <Screen>
            <ScreenTitle>Owned Channels</ScreenTitle>
            {/* {streamedUntilUpdatedAts &&
                updatedAtTimestamps &&
                currentFlowRates && (
                    <ScreenTotal
                        streamedUntilUpdatedAts={streamedUntilUpdatedAts}
                        updatedAtTimestamps={updatedAtTimestamps}
                        currentFlowRates={currentFlowRates}
                    />
                )} */}
            {userOwnedChannels && <ScreenList items={userOwnedChannels} />}
        </Screen>
    );
}
