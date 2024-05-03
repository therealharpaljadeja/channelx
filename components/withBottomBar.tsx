import { ReactNode } from "react";
import BottomBar from "./BottomBar";

export default function WithBottomBar({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col flex-1 w-full h-full">
            {children}
            <BottomBar />
        </div>
    );
}
