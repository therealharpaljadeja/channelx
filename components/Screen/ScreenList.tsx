import Item from "./ScreenListItem";
import { Channel, User } from "@/utils/api";

function determineIfItemIsUser(item: Channel | User): item is User {
    if ((item as User).pfp_url) {
        return true;
    }

    return false;
}

export default function ScreenList({ items }: { items: Channel[] | User[] }) {
    return (
        <div className="flex flex-col max-h-[400px] overflow-y-auto space-y-2">
            {items.map((item) => {
                let fid;
                let name;
                let followers;
                let imageUrl;
                let streamedUntilUpdatedAt;
                let updatedAtTimestamp;
                let currentFlowRate;

                if (determineIfItemIsUser(item)) {
                    fid = item.fid;
                    name = item.display_name;
                    followers = item.follower_count;
                    imageUrl = item.pfp_url;
                    streamedUntilUpdatedAt = item.streamedUntilUpdatedAt;
                    updatedAtTimestamp = item.updatedAtTimestamp;
                    currentFlowRate = item.currentFlowRate;
                } else {
                    fid = item.id;
                    name = item.name;
                    followers = item.follower_count;
                    imageUrl = item.image_url;
                    streamedUntilUpdatedAt = item.streamedUntilUpdatedAt;
                    updatedAtTimestamp = item.updatedAtTimestamp;
                    currentFlowRate = item.currentFlowRate;
                }

                return (
                    <Item
                        key={fid}
                        name={name}
                        followers={followers}
                        imageUrl={imageUrl}
                        fid={fid}
                        streamedUntilUpdatedAt={streamedUntilUpdatedAt}
                        updatedAtTimestamp={updatedAtTimestamp}
                        currentFlowRate={currentFlowRate}
                    />
                );
            })}
        </div>
    );
}
