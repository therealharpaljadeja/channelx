// theme.ts (Version 2 needs to be a tsx file, due to usage of StyleFunctions)
import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import type { StyleFunctionProps } from "@chakra-ui/styled-system";

// Version 2: Using functions
const overrides = extendTheme({
    colors: {
        farcaster: {
            500: "#8A63D2",
            600: "#543D80",
        },
    },
});

export default overrides;
