// convex/lib/getPeriod.ts
export function getPeriod(hour: number, minute: number): number {
    // Convert current time to total minutes from midnight
    const totalMinutes = hour * 60 + minute;

    // Start = 7:50 AM -> 470 minutes from midnight
    const startMinutes = 7 * 60 + 50;

    // Period start times in minutes from midnight
    const periodTimes = [
        startMinutes, // Period 1: 7:50 - 8:30
        startMinutes + 40, // Period 2: 8:30 - 9:10
        startMinutes + 80, // Period 3: 9:10 - 9:50
        startMinutes + 120, // Period 4: 9:50 - 10:30
        // startMinutes + 160,  // Interval: 10:30 - 10:50 (SKIP)
        startMinutes + 180, // Period 5: 10:50 - 11:30
        startMinutes + 220, // Period 6: 11:30 - 12:10
        startMinutes + 260, // Period 7: 12:10 - 12:50
        startMinutes + 400, // Period 8: 12:50 - 1:30 /// 300 change TODO
    ];

    // If before first period, treat as period 1
    if (totalMinutes < periodTimes[0]) return 1;

    // If after last period, treat as period 8
    if (totalMinutes >= periodTimes[periodTimes.length - 1]) return 8;

    // Determine which slot we fall into
    for (let i = 0; i < periodTimes.length - 1; i++) {
        if (
            totalMinutes >= periodTimes[i] &&
            totalMinutes < periodTimes[i + 1]
        ) {
            return i + 1; // Because array is 0-indexed, periods are 1-indexed
        }
    }

    // Fallback
    return 8;
}
