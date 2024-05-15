import UserDataContext from "@/context/UserDataContext";
import { Heading, Skeleton } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";

export default function BottomBar() {
    const pathname = usePathname();
    const { authenticated } = usePrivy();
    const context = useContext(UserDataContext);

    if (!authenticated || !context) return null;

    const { loading } = context;

    if (loading)
        return (
            <div className="border-t-2 border-gray-200 p-6">
                <div className="flex justify-between">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-6 w-36" />
                </div>
            </div>
        );

    return (
        <div className="border-t-2 border-gray-200 p-6">
            <div className="flex justify-between">
                <div className="flex flex-col">
                    <Link href="/app">
                        <Heading
                            fontWeight={pathname === "/app" ? "700" : "500"}
                            size="xs"
                        >
                            Manage Channels
                        </Heading>
                    </Link>
                </div>
                <div className="flex flex-col">
                    <Link href="/app/joined-channels">
                        <Heading
                            fontWeight={
                                pathname === "/app/joined-channels"
                                    ? "700"
                                    : "500"
                            }
                            size="xs"
                        >
                            Channels Subscribed
                        </Heading>
                    </Link>
                </div>
            </div>
        </div>
    );
}
