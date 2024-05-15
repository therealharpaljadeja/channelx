"use client";

import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTitle from "@/components/Screen/ScreenTitle";
import ScreenTotal from "@/components/Screen/ScreenTotal";
import UserDataContext from "@/context/UserDataContext";
import { Text } from "@chakra-ui/react";
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
            {userOwnedChannels && userOwnedChannels.length ? (
                <ScreenList items={userOwnedChannels} />
            ) : (
                <div className="flex-1 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <Text>You are a owner or co-host of any channels</Text>
                </div>
            )}
        </Screen>
    );
}
