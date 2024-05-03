import { ReactNode } from "react";

export default function Screen({ children }: { children: ReactNode }) {
    return <div className="flex flex-1 p-4 space-y-4 flex-col">{children}</div>;
}
