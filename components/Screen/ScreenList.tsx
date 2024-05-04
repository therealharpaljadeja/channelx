import Item from "./ScreenListItem";

export default function ScreenList({ items }: { items: Channel[] }) {
    return (
        <div className="flex flex-col max-h-[400px] overflow-y-scroll space-y-2">
            {items.map((item) => (
                <Item
                    key={item.id}
                    name={item.name}
                    followers={item.follower_count}
                    imageUrl={item.image_url}
                    id={item.id}
                />
            ))}
        </div>
    );
}
