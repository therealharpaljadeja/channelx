import { Heading } from "@chakra-ui/react";

export default function ScreenTitle({ children }: { children: string }) {
    return <Heading size="lg">{children}</Heading>;
}
