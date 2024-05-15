"use client";

import Screen from "@/components/Screen";
import ScreenList from "@/components/Screen/ScreenList";
import ScreenTitle from "@/components/Screen/ScreenTitle";
import ScreenTotal from "@/components/Screen/ScreenTotal";
import UserDataContext from "@/context/UserDataContext";
import { Text } from "@chakra-ui/react";
import { useContext } from "react";

export default function JoinedChannels() {
    const context = useContext(UserDataContext);

    if (!context) return null;

    const {
        userjoinedChannels,
        streamedUntilUpdatedAts,
        updatedAtTimestamps,
        currentFlowRates,
    } = context;

    console.log(
        userjoinedChannels,
        streamedUntilUpdatedAts,
        updatedAtTimestamps,
        currentFlowRates
    );

    return (
        <Screen>
            <ScreenTitle>Joined Channels</ScreenTitle>
            {streamedUntilUpdatedAts &&
                updatedAtTimestamps &&
                currentFlowRates && (
                    <ScreenTotal
                        title="Est. Expenditure"
                        streamedUntilUpdatedAts={streamedUntilUpdatedAts}
                        updatedAtTimestamps={updatedAtTimestamps}
                        currentFlowRates={currentFlowRates}
                    />
                )}
            {userjoinedChannels && userjoinedChannels.length ? (
                <ScreenList items={userjoinedChannels} />
            ) : (
                <div className="flex-1 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <Text>You are not subscribed to any channels</Text>
                </div>
            )}
        </Screen>
    );
}
