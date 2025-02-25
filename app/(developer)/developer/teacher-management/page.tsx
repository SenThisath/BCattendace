"use client";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

const TeacherManagement = () => {
    const teachers = useQuery(api.task.getTeachers);

    return (
        <div>
            <div className="p-5">
                {teachers ?
                    <Table>
                        <TableCaption>List of the teachers</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-left">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teachers?.map((teacher) => {
                                return (
                                    <TableRow key={teacher._id}>
                                        <TableCell>{teacher.userId}</TableCell>
                                        <TableCell>
                                            {teacher.username}
                                        </TableCell>
                                        <TableCell>{teacher.role}</TableCell>
                                        <TableCell>
                                            {teacher._creationTime}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                :   <h1>loading</h1>
                }
            </div>
        </div>
    );
};

export default TeacherManagement;
