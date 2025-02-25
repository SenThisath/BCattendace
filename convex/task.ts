import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getPeriod } from "../lib/get-period";

export const saveUser = mutation({
    args: {
        userId: v.string(),
        username: v.string(),
        role: v.string(),
    },
    handler: async (ctx, { userId, username, role }) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();

        if (!existingUser) {
            await ctx.db.insert("users", {
                userId,
                username,
                role,
            });
        }
    },
});

export const getTeachers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("role"), "admin"))
            .collect();
    },
});

export const saveSection = mutation({
    args: { name: v.string() },
    handler: async (ctx, { name }) => {
        const existingSection = await ctx.db
            .query("sections")
            .withIndex("by_name", (q) => q.eq("name", name))
            .first();

        if (!existingSection) {
            await ctx.db.insert("sections", { name });
        }
    },
});

export const getSections = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("sections").collect();
    },
});

export const saveClass = mutation({
    args: {
        sectionId: v.id("sections"),
        name: v.string(),
    },
    handler: async (ctx, { sectionId, name }) => {
        await ctx.db.insert("classes", { sectionId, name });
    },
});

export const getClassesBySection = query({
    args: { sectionId: v.id("sections") },
    handler: async (ctx, { sectionId }) => {
        return await ctx.db
            .query("classes")
            .withIndex("by_section", (q) => q.eq("sectionId", sectionId))
            .collect();
    },
});

export const getClassById = query({
    args: { classId: v.id("classes") },
    handler(ctx, args) {
        return ctx.db
            .query("classes")
            .filter((q) => q.eq(q.field("_id"), args.classId))
            .unique();
    },
});

export const generateTimeTable = mutation({
    args: { classId: v.id("classes") },
    handler: async (ctx, { classId }) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const periods = 8;
        for (const day of days) {
            for (let period = 1; period <= periods; period++) {
                await ctx.db.insert("timetable", {
                    classId,
                    day,
                    period,
                    teacherId: undefined,
                });
            }
        }
    },
});

export const getTimeTable = query({
    args: { classId: v.id("classes") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("timetable")
            .filter((q) => q.eq(q.field("classId"), args.classId))
            .collect();
    },
});

export const assignteacher = mutation({
    args: {
        classId: v.id("classes"),
        day: v.string(),
        period: v.number(),
        teacherId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const existingEvent = await ctx.db
            .query("timetable")
            .filter((q) => q.eq(q.field("classId"), args.classId))
            .filter((q) => q.eq(q.field("day"), args.day))
            .filter((q) => q.eq(q.field("period"), args.period))
            .first();
        if (!existingEvent) throw new Error("No Event Found");
        await ctx.db.patch(existingEvent._id, { teacherId: args.teacherId });
    },
});

export const validateAndMark = mutation({
    args: {
        teacherId: v.id("users"),
        classId: v.id("classes"),
    },
    handler: async (ctx, args) => {
        // 1. Figure out which day and period it is right now
        const now = new Date();
        const options = { timeZone: "Asia/Colombo" };
        const day = new Intl.DateTimeFormat("en-US", {
            ...options,
            weekday: "long",
        }).format(now); // e.g. "Monday"
        const hour = parseInt(
            new Intl.DateTimeFormat("en-US", {
                ...options,
                hour: "2-digit",
                hour12: false,
            }).format(now),
            10
        );
        const minute = parseInt(
            new Intl.DateTimeFormat("en-US", {
                ...options,
                minute: "2-digit",
            }).format(now),
            10
        );
        const period = getPeriod(hour, minute);

        // 2. Check timetable for (classId, day, period)
        const timetableEntry = await ctx.db
            .query("timetable")
            .filter((q) => q.eq(q.field("classId"), args.classId))
            .filter((q) => q.eq(q.field("day"), day))
            .filter((q) => q.eq(q.field("period"), period))
            .first();

        if (!timetableEntry) {
            throw new Error(
                `No timetable entry for day=${day}, period=${period}.`
            );
        }

        if (
            !timetableEntry.teacherId ||
            timetableEntry.teacherId.toString() !== args.teacherId.toString()
        ) {
            throw new Error(
                "Teacher is not assigned to this class at this time!"
            );
        }

        // 3. Insert attendance record
        await ctx.db.insert("attendance", {
            teacherId: args.teacherId,
            classId: args.classId,
            day: day,
            period: period, // change
            status: "Attended", //change
            timestamp: Date.now(),
        });

        return { success: true, message: "Attendance marked successfully!" };
    },
});

export const getClassAttendance = query({
    args: { classId: v.id("classes"), day: v.string() },
    handler: async (ctx, args) => {
        const timetable = await ctx.db
            .query("timetable")
            .filter((q) => q.eq(q.field("classId"), args.classId))
            .filter((q) => q.eq(q.field("day"), args.day))
            .collect();
        const attendance = await ctx.db
            .query("attendance")
            .filter((q) => q.eq(q.field("classId"), args.classId))
            .filter((q) => q.eq(q.field("day"), args.day))
            .collect();
        return { timetable, attendance };
    },
});
