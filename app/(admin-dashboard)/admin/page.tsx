"use client";

import { SignOutButton } from "@clerk/nextjs";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
    const { user } = useUser();
    const saveUser = useMutation(api.task.saveUser);
    const validateAndMark = useMutation(api.task.validateAndMark);
    const getTeachers = useQuery(api.task.getTeachers);

    const [currentUser, setCurrentUser] = useState<Id<"users"> | undefined>(
        undefined
    );
    const [result, setResult] = useState("");

    useEffect(() => {
        if (user) {
            saveUser({
                userId: user.id,
                username: user.username || "", // Get username from Clerk
                role: user.publicMetadata?.role as string, // Set role dynamically if needed
            });
        }
    }, [user, saveUser]);

    useEffect(() => {
        const teacherId = getTeachers?.find(
            (teacher) => user && teacher.userId === user.id
        )?._id;
        setCurrentUser(teacherId);
        console.log(`current user ${currentUser}`);
    }, [getTeachers, user, currentUser]);

    return (
        <div>
            <div>
                <div style={{ width: 400, height: 400 }}>
                    <Scanner
                        onScan={(result) =>
                            setResult(result[0].rawValue ?? null)
                        }
                    />
                </div>
                {result && (
                    <Button
                        onClick={async () => {
                            if (user) {
                                await validateAndMark({
                                    classId: result as Id<"classes">,
                                    teacherId: currentUser as Id<"users">,
                                });
                                setResult("");
                            }
                        }}
                    >
                        Mark Attended
                    </Button>
                )}
            </div>
            <div>
                <SignOutButton />
            </div>
        </div>
    );
};

export default AdminPage;
