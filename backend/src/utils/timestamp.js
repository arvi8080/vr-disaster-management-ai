function normalizeTimestamp(value) {
    if (value instanceof Date) {
        return Number.isFinite(value.getTime()) && value.getTime() > 0 ? value : null;
    }

    if (value && typeof value.toDate === "function") {
        return normalizeTimestamp(value.toDate());
    }

    let timestamp;
    if (typeof value === "number") {
        if (!Number.isFinite(value) || value <= 0) return null;
        timestamp = value < 1e12 ? value * 1000 : value;
    } else if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        if (/^\d+(\.\d+)?$/.test(trimmed)) {
            const numericValue = Number(trimmed);
            if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
            timestamp = numericValue < 1e12 ? numericValue * 1000 : numericValue;
        } else {
            timestamp = Date.parse(trimmed);
        }
    } else if (value && typeof value === "object") {
        const seconds = value._seconds ?? value.seconds;
        const nanoseconds = value._nanoseconds ?? value.nanoseconds ?? 0;
        if (typeof seconds !== "number" || !Number.isFinite(seconds) ||
            typeof nanoseconds !== "number" || !Number.isFinite(nanoseconds)) {
            return null;
        }
        timestamp = seconds * 1000 + nanoseconds / 1e6;
    } else {
        return null;
    }

    const date = new Date(timestamp);
    return Number.isFinite(date.getTime()) && date.getTime() > 0 ? date : null;
}

function timestampMillis(value) {
    return normalizeTimestamp(value)?.getTime() ?? null;
}

module.exports = { normalizeTimestamp, timestampMillis };
