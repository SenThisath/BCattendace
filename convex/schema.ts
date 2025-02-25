import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        userId: v.string(),
        username: v.string(),
        role: v.string(),
    }).index("by_userId", ["userId"]),

    sections: defineTable({
        name: v.string(),
    }).index("by_name", ["name"]),

    classes: defineTable({
        sectionId: v.id("sections"),
        name: v.string(),
    }).index("by_section", ["sectionId"]),
    timetable: defineTable({
        classId: v.id("classes"),
        day: v.string(),
        period: v.number(),
        teacherId: v.optional(v.id("users")),
    }).index("by_class", ["classId"]),
    attendance: defineTable({
        teacherId: v.id("users"),
        classId: v.id("classes"),
        day: v.string(), // e.g., "Monday"
        period: v.number(), // 1 - 8
        status: v.string(), // e.g., "Attended"
        timestamp: v.number(), // e.g., Date.now()
    }).index("by_class", ["classId"]),
});
