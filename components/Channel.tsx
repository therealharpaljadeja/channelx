import { Avatar, Flex, Text } from "@chakra-ui/react";

export default function ListItem({ itemData }: { itemData: Channel }) {
    return (
        <Flex
            className="border-2 rounded-md border-gray-200 p-2"
            key={itemData.id}
        >
            <Flex>
                <Avatar name={itemData.name} src={itemData.image_url} />
            </Flex>
            <Flex marginLeft={"10px"} flexDirection={"column"}>
                <Text size="md">{itemData.name}</Text>
                <Text size="sm">{`${itemData.follower_count} Followers`}</Text>
            </Flex>
        </Flex>
    );
}
