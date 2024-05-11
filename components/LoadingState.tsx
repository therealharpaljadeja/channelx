import { Skeleton } from "@chakra-ui/react";
import Screen from "./Screen";

export function LoadingState() {
    return (
        <Screen>
            <Skeleton width="200px" height="40px" />
            <Skeleton className="w-full" height="120px" />
            <div className="flex flex-col space-y-2 !mt-6">
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[60px]" />
            </div>
        </Screen>
    );
}
