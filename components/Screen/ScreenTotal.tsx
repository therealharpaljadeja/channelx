import { Heading, Text } from "@chakra-ui/react";
import FlowingBalance from "../FlowingBalance";

export default function ScreenTotal({
    streamedUntilUpdatedAts,
    updatedAtTimestamps,
    currentFlowRates,
}: {
    streamedUntilUpdatedAts: string[];
    updatedAtTimestamps: string[];
    currentFlowRates: string[];
}) {
    if (!streamedUntilUpdatedAts) return null;

    let streamedUntilUpdatedAtsBigInt = streamedUntilUpdatedAts.map(
        (streamedUntilUpdatedAt) => BigInt(streamedUntilUpdatedAt)
    );
    let currentFlowRatesBigInt = currentFlowRates.map((currentFlowRate) =>
        BigInt(currentFlowRate)
    );
    let updatedAtTimestampsDate = updatedAtTimestamps.map(
        (updatedAtTimestamp) => new Date(Number(updatedAtTimestamp) * 1000)
    );

    return (
        <div className="py-4">
            <div className="shadow-lg shadow-[#A78FD2] py-4 bg-[url('/background.svg')] bg-cover text-white space-y-4 flex flex-col items-center justify-center">
                <Heading size="sm">Est. Earnings</Heading>
                <div className="flex items-end space-x-2">
                    <FlowingBalance
                        startingBalance={streamedUntilUpdatedAtsBigInt}
                        startingBalanceDate={updatedAtTimestampsDate}
                        flowRate={currentFlowRatesBigInt}
                        size="lg"
                    />
                    <Text size="md">DEGENx</Text>
                </div>
            </div>
        </div>
    );
}
