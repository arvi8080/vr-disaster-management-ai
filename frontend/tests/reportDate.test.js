import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatEventDate, formatReportDate, reportDate, timestampMillis } from '../src/utils/reportDate.js';
import { getSafetyPracticeObjective, getSafetyViolationDetail, getUnityEventLabel, getUnitySequence, getUnityTiming } from '../src/utils/unityReportEvidence.js';

test('parses Firestore Timestamp shapes and Unix seconds as actual dates', () => {
  const expected = new Date('2026-10-19T12:45:03.000Z').getTime();

  assert.equal(reportDate({ _seconds: expected / 1000, _nanoseconds: 0 }).getTime(), expected);
  assert.equal(reportDate({ seconds: expected / 1000, nanoseconds: 0 }).getTime(), expected);
  assert.equal(reportDate(expected / 1000).getTime(), expected);
  assert.equal(reportDate('1760858103').getTime(), 1760858103 * 1000);
  assert.equal(reportDate(1760858103000).getTime(), 1760858103000);
  assert.equal(timestampMillis('2026-10-19T12:45:03.000Z'), expected);
  assert.equal(formatEventDate(1760858103), new Date(1760858103 * 1000).toLocaleString());
});

test('does not present zero or invalid event timestamps as real dates', () => {
  assert.equal(formatReportDate(0), 'Date unavailable');
  assert.equal(formatEventDate({ _seconds: 0, _nanoseconds: 0 }), 'Timestamp unavailable');
  assert.equal(reportDate('not-a-timestamp'), null);
  assert.equal(timestampMillis(0), 0);
});

test('derives missing action durations from the same validated event intervals', () => {
  const start = 1760858103;
  const session = {
    unityMetrics: { powerIsolationTime: 8 },
    performanceFeatures: {
      events: [
        { eventType: 'SCENARIO_STARTED', timestamp: start },
        { eventType: 'POWER_ISOLATED', timestamp: start + 8 },
        { eventType: 'EXTINGUISHER_PIN_REMOVED', timestamp: start + 12 },
        { eventType: 'EXTINGUISHING_STARTED', timestamp: start + 20 },
        { eventType: 'FIRE_EXTINGUISHED', timestamp: start + 37 },
        { eventType: 'SCENARIO_COMPLETED', timestamp: start + 40 }
      ]
    }
  };

  assert.equal(getUnityTiming(session, 'powerIsolationTime').seconds, 8);
  assert.equal(getUnityTiming(session, 'pinRemovalTime').seconds, 12);
  assert.equal(getUnityTiming(session, 'extinguishingTime').seconds, 17);
  assert.equal(getUnityTiming(session, 'totalResponseTime').seconds, 40);
  assert.equal(getUnityTiming(session, 'powerIsolationTime').warning, null);
  assert.equal(getUnityTiming({
    unityMetrics: { pinRemovalTime: 45 },
    performanceFeatures: { events: session.performanceFeatures.events }
  }, 'pinRemovalTime').warning, 'Event interval (12.00 s) differs from Unity duration (45.00 s).');
});

test('marks unverified timing unavailable and sequence conclusions attempt-specific', () => {
  const session = {
    performanceFeatures: {
      events: [
        { eventType: 'POWER_ISOLATED', timestamp: 1760858103 },
        { eventType: 'EXTINGUISHER_PIN_REMOVED', timestamp: 1760858102 },
        { eventType: 'EXTINGUISHING_STARTED', timestamp: 1760858104 },
        { eventType: 'SAFETY_VIOLATION', timestamp: 1760858103, metadata: { reason: 'Pin removed before power isolation.' } }
      ]
    }
  };

  assert.equal(getUnityTiming(session, 'pinRemovalTime').seconds, null);
  assert.deepEqual(getUnitySequence(session), {
    result: 'Out of sequence',
    detail: 'Recorded action order: pin removal occurred before power isolation.'
  });
  assert.equal(getSafetyViolationDetail(session, session.performanceFeatures.events[3]), 'Pin removed before power isolation.');
  assert.equal(getSafetyPracticeObjective(session), 'Practice isolating power before removing the extinguisher pin.');
  assert.equal(getUnityEventLabel('POWER_ISOLATED'), 'Power isolated');
});
