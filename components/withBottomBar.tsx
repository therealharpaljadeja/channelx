import { ReactNode } from "react";
import BottomBar from "./BottomBar";
import TopBar from "./TopBar";

export default function WithBottomBar({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col flex-1 w-full h-full">
            <TopBar />
            {children}
            <BottomBar />
        </div>
    );
}
