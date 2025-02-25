"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL as string
);

const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </ConvexProviderWithClerk>
    );
};

export default Providers;
