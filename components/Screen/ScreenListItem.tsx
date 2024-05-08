import { Avatar, Heading, Spacer, Text } from "@chakra-ui/react";
import FlowingBalance from "../FlowingBalance";
import Link from "next/link";

export type ItemProps = {
    fid: number | string;
    name: string;
    imageUrl: string;
    followers: number;
    streamedUntilUpdatedAt?: string;
    updatedAtTimestamp?: string;
    currentFlowRate?: string;
};

export default function ScreenListItem({
    followers,
    name,
    imageUrl,
    fid,
    streamedUntilUpdatedAt,
    updatedAtTimestamp,
    currentFlowRate,
}: ItemProps) {
    return (
        <Link href={currentFlowRate ? "#" : `/channel/${fid}`}>
            <div className="flex border-2 items-center border-gray-200 space-x-4 rounded-md py-4 px-4 hover:bg-gray-50">
                <div className="flex space-x-4">
                    <div className="flex">
                        <Avatar src={imageUrl} />
                    </div>
                    <div className="flex-col space-y-2">
                        <Heading size="md">{name}</Heading>
                        <Text size="sm">{`${followers} Followers`}</Text>
                    </div>
                </div>
                <Spacer />
                <div className="flex">
                    <div className="flex space-x-[1px] items-end">
                        {streamedUntilUpdatedAt &&
                            updatedAtTimestamp &&
                            currentFlowRate && (
                                <>
                                    <FlowingBalance
                                        startingBalance={[
                                            BigInt(streamedUntilUpdatedAt),
                                        ]}
                                        startingBalanceDate={[
                                            new Date(
                                                Number(updatedAtTimestamp) *
                                                    1000
                                            ),
                                        ]}
                                        flowRate={[BigInt(currentFlowRate)]}
                                        size="sm"
                                    />
                                    <Text fontSize="xs">DEGENx</Text>
                                </>
                            )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
