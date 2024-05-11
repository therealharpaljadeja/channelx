import { usePrivy } from "@privy-io/react-auth";
import { Button, Skeleton } from "@chakra-ui/react";
import { HiMiniPower } from "react-icons/hi2";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function TopBar() {
    const { logout, login, authenticated, ready } = usePrivy();

    return (
        <div className="border-b-2 border-gray-200 px-6 py-4">
            {ready ? (
                <div className="flex justify-between items-center">
                    {authenticated ? (
                        <Button
                            colorScheme="purple"
                            size={"sm"}
                            onClick={logout}
                            leftIcon={<HiMiniPower />}
                        >
                            Logout
                        </Button>
                    ) : (
                        <Button
                            colorScheme="purple"
                            color="white"
                            size="sm"
                            onClick={login}
                            leftIcon={
                                <img className="h-4 w-4" src="/farcaster.svg" />
                            }
                        >
                            Sign in with Farcaster
                        </Button>
                    )}
                </div>
            ) : (
                <Skeleton w="80px" h="25px" />
            )}
        </div>
    );
}
