"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import {QRCodeCanvas} from 'qrcode.react';
import { ModeToggle } from "@/components/mode-toggle";

const sectionFormSchema = z.object({
    sectionName: z.string({
        required_error: "Section name required.",
    }),
});
const classFormSchema = z.object({
    className: z.string({
        required_error: "Class name required.",
    }),
});

const ClassManagement = () => {
    const [selectedSection, setSelectedSection] =
        useState<Id<"sections"> | null>(null);
    const createSection = useMutation(api.task.saveSection);
    const createClass = useMutation(api.task.saveClass);
    const sections = useQuery(api.task.getSections);
    const classes = useQuery(
        api.task.getClassesBySection,
        selectedSection ? { sectionId: selectedSection } : "skip"
    );

    const sectionForm = useForm<z.infer<typeof sectionFormSchema>>({
        resolver: zodResolver(sectionFormSchema),
        defaultValues: {
            sectionName: "",
        },
    });
    const classForm = useForm<z.infer<typeof classFormSchema>>({
        resolver: zodResolver(classFormSchema),
        defaultValues: {
            className: "",
        },
    });

    function onSectionSubmit(values: z.infer<typeof sectionFormSchema>) {
        console.log(values.sectionName);
        createSection({ name: values.sectionName });
        sectionForm.reset();
    }
    function onClassSubmit(values: z.infer<typeof classFormSchema>) {
        console.log(
            `Class Name: ${values.className} section Id: ${selectedSection}`
        );
        if (selectedSection) {
            createClass({ name: values.className, sectionId: selectedSection });
        } else {
            console.error("No section selected");
        }
    }

    return (
        <div className="flex">
            <ModeToggle />
            <div className="flex-1">
                <Form {...sectionForm}>
                    <form onSubmit={sectionForm.handleSubmit(onSectionSubmit)}>
                        <FormField
                            control={sectionForm.control}
                            name="sectionName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Add a section</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="6, 7, 8, 9, 10, 11..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
                <Table>
                    <TableCaption>List of the sections</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Section ID</TableHead>
                            <TableHead>Section Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sections?.map((section) => {
                            return (
                                <TableRow key={section._id}>
                                    <TableCell>{section._id}</TableCell>
                                    <TableCell>{section.name}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="flex-1">
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
                <Form {...classForm}>
                    <form onSubmit={classForm.handleSubmit(onClassSubmit)}>
                        <FormField
                            control={classForm.control}
                            name="className"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Add a class</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="A, B, C, D, E, F..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
                <Table>
                    <TableCaption>List of the classes</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Class ID</TableHead>
                            <TableHead>Section Name</TableHead>
                            <TableHead>Class Name</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes?.map((cls) => {
                            return (
                                <TableRow key={cls._id}>
                                    <TableCell>{cls._id}</TableCell>
                                    <TableCell>
                                        {
                                            sections?.find(
                                                (section) =>
                                                    section._id ===
                                                    cls.sectionId
                                            )?.name
                                        }
                                    </TableCell>
                                    <TableCell>{cls.name}</TableCell>
                                    <TableCell>
                                        {/* <Button onClick={() => console.log(cls._id)}>QR</Button> */}
                                        {/* <QRCode value={cls._id} /> */}
                                        <QRCodeCanvas value={cls._id} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default ClassManagement;
