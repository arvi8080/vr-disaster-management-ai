export function reportDate(value) {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) && value.getTime() > 0 ? value : null;
  }
  if (value && typeof value.toDate === 'function') {
    return reportDate(value.toDate());
  }

  let timestamp;
  if (typeof value === 'number') {
    timestamp = value > 0 && value < 1e12 ? value * 1000 : value;
  } else if (value && typeof value === 'object') {
    const seconds = value._seconds ?? value.seconds;
    const nanoseconds = value._nanoseconds ?? value.nanoseconds ?? 0;
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) ||
        typeof nanoseconds !== 'number' || !Number.isFinite(nanoseconds)) {
      return null;
    }
    timestamp = seconds * 1000 + nanoseconds / 1000000;
  } else if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim())) {
    const numericValue = Number(value);
    timestamp = numericValue > 0 && numericValue < 1e12
      ? numericValue * 1000
      : numericValue;
  } else if (typeof value === 'string') {
    timestamp = value;
  } else {
    return null;
  }

  const date = new Date(timestamp);
  return Number.isFinite(date.getTime()) && date.getTime() > 0 ? date : null;
}

export function formatReportDate(value) {
  return reportDate(value)?.toLocaleString() || 'Date unavailable';
}

export function formatEventDate(value) {
  return reportDate(value)?.toLocaleString() || 'Timestamp unavailable';
}

export function timestampMillis(value) {
  return reportDate(value)?.getTime() || 0;
}
