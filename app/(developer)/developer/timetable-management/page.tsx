"use client";

import { Button } from "@/components/ui/button";
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
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const TimeTableManagement = () => {
    const [selectedSection, setSelectedSection] =
        useState<Id<"sections"> | null>(null);
    const [selectedClass, setSelectedClass] = useState<Id<"classes"> | null>(
        null
    );
    const sections = useQuery(api.task.getSections);
    const classes = useQuery(
        api.task.getClassesBySection,
        selectedSection ? { sectionId: selectedSection } : "skip"
    );
    const generateTimeTable = useMutation(api.task.generateTimeTable);
    const timetable = useQuery(
        api.task.getTimeTable,
        selectedClass ? { classId: selectedClass } : "skip"
    );
    const filterTimeTable = timetable?.filter(
        (entry) => entry.classId === selectedClass
    );
    const groupByDay = filterTimeTable?.reduce(
        (acc: { [key: string]: (typeof entry)[] }, entry) => {
            if (!acc[entry.day]) acc[entry.day] = Array(8).fill(null);
            acc[entry.day][entry.period - 1] =
                entry.teacherId ?
                    { ...entry, teacherId: entry.teacherId }
                :   { ...entry, teacherId: undefined };
            return acc;
        },
        {}
    );
    const handleTimeTableClick = () => {
        if (selectedClass) {
            generateTimeTable({ classId: selectedClass });
        }
    };
    const teachers = useQuery(api.task.getTeachers);
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const assignTeacher = useMutation(api.task.assignteacher);
    interface AssignTeacherParams {
        classId: Id<"classes">;
        day: string;
        period: number;
        teacherId: Id<"users">;
    }
    const handleAssignTeacher = async ({
        classId,
        day,
        period,
        teacherId,
    }: AssignTeacherParams) => {
        await assignTeacher({ classId, day, period, teacherId });
    };
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
                <Button onClick={handleTimeTableClick}>
                    Generate TimeTable
                </Button>
            )}
            <Table>
                <TableCaption>List of the timetable</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Day</TableHead>
                        {[...Array(8)].map((_, i) => (
                            <TableHead key={i}>Period {i + 1}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groupByDay &&
                        Object.entries(groupByDay).map(([day, periods]) => (
                            <TableRow key={day}>
                                <TableCell>{day}</TableCell>
                                {periods.map((teacher, i) => (
                                    <TableCell key={i}>
                                        {teachers?.find(
                                            (t) => t._id === teacher.teacherId
                                        )?.username || "N/A"}

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        console.log(day, i + 1)
                                                    }
                                                >
                                                    Edit Teacher
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Edit teacher
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Assign a teacher or
                                                        remove a teacher
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <Popover
                                                    open={open}
                                                    onOpenChange={setOpen}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={open}
                                                            className="w-[200px] justify-between"
                                                        >
                                                            {value ?
                                                                teachers?.find(
                                                                    (teacher) =>
                                                                        teacher._id ===
                                                                        value
                                                                )?.username
                                                            :   "Select teacher..."
                                                            }
                                                            <ChevronsUpDown className="opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[200px] p-0">
                                                        <Command>
                                                            <CommandInput
                                                                placeholder="Search teacher..."
                                                                className="h-9"
                                                            />
                                                            <CommandList>
                                                                <CommandEmpty>
                                                                    No teachers
                                                                    found.
                                                                </CommandEmpty>
                                                                <CommandGroup>
                                                                    {teachers?.map(
                                                                        (
                                                                            teacher
                                                                        ) => {
                                                                            return (
                                                                                <CommandItem
                                                                                    key={
                                                                                        teacher._id
                                                                                    }
                                                                                    value={
                                                                                        teacher._id
                                                                                    }
                                                                                    onSelect={(
                                                                                        currentValue: string
                                                                                    ) => {
                                                                                        const userId =
                                                                                            currentValue as Id<"users">;
                                                                                        setValue(
                                                                                            (
                                                                                                userId ===
                                                                                                    value
                                                                                            ) ?
                                                                                                ""
                                                                                            :   (userId as unknown as string)
                                                                                        );
                                                                                        setOpen(
                                                                                            false
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        teacher.username
                                                                                    }
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "ml-auto",
                                                                                            (
                                                                                                value ===
                                                                                                    teacher._id
                                                                                            ) ?
                                                                                                "opacity-100"
                                                                                            :   "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                </CommandItem>
                                                                            );
                                                                        }
                                                                    )}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <DialogFooter>
                                                    <Button
                                                        type="submit"
                                                        onClick={() =>
                                                            selectedClass &&
                                                            handleAssignTeacher(
                                                                {
                                                                    classId:
                                                                        selectedClass,
                                                                    day,
                                                                    period:
                                                                        i + 1,
                                                                    teacherId:
                                                                        value as Id<"users">,
                                                                }
                                                            )
                                                        }
                                                    >
                                                        Save changes
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TimeTableManagement;
