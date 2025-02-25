"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

const DashBoard = () => {
    const { user } = useUser();
    const saveUser = useMutation(api.task.saveUser);
    useEffect(() => {
        if (user) {
            saveUser({
                userId: user.id,
                username: user.username || "", // Get username from Clerk
                role: user.publicMetadata?.role as string, // Set role dynamically if needed
            });
        }
    }, [user, saveUser]);
    return (
        <div>
            developer dashboard <br />
            <SignOutButton />
        </div>
    );
};

export default DashBoard;
