import { Heading, Text } from "@chakra-ui/react";
import FlowingBalance from "../FlowingBalance";

export default function ScreenTotal({
    startingBalance = "1000000000000000000",
    startingBalanceDate = "2024-01-01T00:00:00.000Z",
    flowRate = "1000000000000000",
}: {
    startingBalance?: string;
    startingBalanceDate?: string;
    flowRate?: string;
}) {
    return (
        <div className="py-4">
            <div className="shadow-lg shadow-[#A78FD2] py-4 border-2 border-[#A78FD2] bg-[#8A63D2] text-white space-y-4 flex flex-col items-center justify-center">
                <Heading size="sm">Est. Earnings</Heading>
                <div className="flex items-end space-x-2">
                    <FlowingBalance
                        startingBalance={BigInt(startingBalance)}
                        startingBalanceDate={new Date(startingBalanceDate)}
                        flowRate={BigInt(flowRate)}
                        size="lg"
                    />
                    <Text size="md">DEGENx</Text>
                </div>
            </div>
        </div>
    );
}
