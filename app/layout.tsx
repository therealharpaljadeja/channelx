"use client";
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
    title: "ChannelX",
    description: "Gate your channel using DEGENx SuperFluid stream",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <main className="flex bg-white flex-col items-center justify-center space-y-4 max-h-screen">
                        <div className="border-2 items-center flex flex-col justify-center border-gray-200 w-full max-w-[430px] min-h-screen">
                            {children}
                        </div>
                    </main>
                </Providers>
            </body>
        </html>
    );
}
