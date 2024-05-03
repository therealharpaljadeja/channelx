import { Button, Heading } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiMiniPower } from "react-icons/hi2";

export default function BottomBar() {
    const { logout } = usePrivy();
    const pathname = usePathname();

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
                            Channels Joined
                        </Heading>
                    </Link>
                </div>
                <Button
                    colorScheme="purple"
                    size={"xs"}
                    onClick={logout}
                    leftIcon={<HiMiniPower />}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
}
