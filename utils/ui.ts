import { createSystem } from "frog/ui";

export const {
    Box,
    Columns,
    Column,
    Heading,
    HStack,
    Rows,
    Row,
    Spacer,
    Text,
    VStack,
    vars,
    Image,
    Icon,
} = createSystem({
    fonts: {
        default: [
            {
                name: "Open Sans",
                source: "google",
                weight: 400,
            },
            {
                name: "Open Sans",
                source: "google",
                weight: 600,
            },
        ],
        madimi: [
            {
                name: "Madimi One",
                source: "google",
            },
        ],
    },
});
