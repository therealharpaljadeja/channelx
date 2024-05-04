import { Avatar, Heading, Spacer, Text } from "@chakra-ui/react";
import FlowingBalance from "../FlowingBalance";
import Link from "next/link";

export type ScreenListItem = {
    name: string;
    followers: number;
    imageUrl: string;
    id: string;
};

export default function ScreenListItem({
    followers,
    name,
    imageUrl,
    id,
}: ScreenListItem) {
    return (
        <Link href={`/channel/${id}`}>
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
                        <div className="w-[100px] flex items-center">
                            <FlowingBalance
                                startingBalance={BigInt("1000000000000000000")}
                                startingBalanceDate={
                                    new Date("2024-01-01T00:00:00.000Z")
                                }
                                flowRate={BigInt("1000000000000000")}
                                size="sm"
                            />
                        </div>
                        <Text fontSize="xs">DEGENx</Text>
                    </div>
                </div>
            </div>
        </Link>
    );
}
