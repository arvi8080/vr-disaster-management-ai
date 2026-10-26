import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEventDate, formatReportDate, reportDate, timestampMillis } from '../src/utils/reportDate.js';

test('parses Firestore Timestamp shapes and Unix seconds as actual dates', () => {
  const expected = new Date('2026-10-19T12:45:03.000Z').getTime();

  assert.equal(reportDate({ _seconds: expected / 1000, _nanoseconds: 0 }).getTime(), expected);
  assert.equal(reportDate({ seconds: expected / 1000, nanoseconds: 0 }).getTime(), expected);
  assert.equal(reportDate(expected / 1000).getTime(), expected);
  assert.equal(timestampMillis('2026-10-19T12:45:03.000Z'), expected);
});

test('does not present zero or invalid event timestamps as real dates', () => {
  assert.equal(formatReportDate(0), 'Date unavailable');
  assert.equal(formatEventDate({ _seconds: 0, _nanoseconds: 0 }), 'Timestamp unavailable');
  assert.equal(reportDate('not-a-timestamp'), null);
  assert.equal(timestampMillis(0), 0);
});
