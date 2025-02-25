"use client";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Id } from "@/convex/_generated/dataModel";
import { SignOutButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import React, { useState } from "react";

const SuperAdmin = () => {
    const sections = useQuery(api.task.getSections);
    const [selectedSection, setSelectedSection] =
        useState<Id<"sections"> | null>(null);
    const [selectedClass, setSelectedClass] = useState<Id<"classes"> | null>(
        null
    );
    const [day, setDay] = useState("");
    const classes = useQuery(
        api.task.getClassesBySection,
        selectedSection ? { sectionId: selectedSection } : "skip"
    );
    const data = useQuery(
        api.task.getClassAttendance,
        selectedClass && day ? { classId: selectedClass, day: day } : "skip"
    );
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];
    console.log(data?.attendance);
    return (
        <div>
            <Select
                onValueChange={(value: Id<"sections">) => {
                    setSelectedSection(value);
                    console.log(value);
                }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {sections?.map((section) => {
                            return (
                                <SelectItem
                                    key={section._id}
                                    value={section._id}
                                >
                                    {section.name}
                                </SelectItem>
                            );
                        })}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {selectedSection && (
                <Select
                    onValueChange={(value) => {
                        setSelectedClass(value as Id<"classes">);
                        console.log(value);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {classes?.map((cls) => {
                                return (
                                    <SelectItem key={cls._id} value={cls._id}>
                                        {cls.name}
                                    </SelectItem>
                                );
                            })}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            )}
            {selectedClass && (
                <Select
                    onValueChange={(value) => {
                        setDay(value);
                        console.log(value);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="Monday">Monday</SelectItem>
                            <SelectItem value="Tuesday">Tuesday</SelectItem>
                            <SelectItem value="Wednesday">Wednesday</SelectItem>
                            <SelectItem value="Thursday">Thursday</SelectItem>
                            <SelectItem value="Friday">Friday</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            )}
            <Table>
                <TableCaption>A list of attendance</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {periods.map((period) => {
                        //   const record = data?.timetable.find(
                        //       (a) => a.period === period
                        // );
                        const record = data?.attendance.find(
                            (a) => a.period === period
                        );
                        return (
                            <TableRow key={period}>
                                <TableCell>{period}</TableCell>
                                <TableCell>
                                    {record ? record.teacherId : ""}
                                </TableCell>
                            <TableCell>{record ? record.status : ""}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <SignOutButton />
        </div>
    );
};

export default SuperAdmin;
