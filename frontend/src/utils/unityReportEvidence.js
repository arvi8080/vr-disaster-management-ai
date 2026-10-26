import { timestampMillis } from './reportDate.js';

const EVENT_LABELS = {
  SCENARIO_STARTED: 'Scenario started',
  PLAYER_MOVED: 'Player moved',
  HAZARD_DETECTED: 'Hazard detected',
  HAZARD_IGNORED: 'Hazard ignored',
  VICTIM_DETECTED: 'Person located',
  VICTIM_RESCUED: 'Person rescued',
  FIRE_EXTINGUISHED: 'Fire extinguished',
  POWER_ISOLATED: 'Power isolated',
  EXTINGUISHER_PIN_REMOVED: 'Extinguisher pin removed',
  EXTINGUISHING_STARTED: 'Extinguisher operation started',
  WRONG_DECISION: 'Incorrect decision recorded',
  CORRECT_DECISION: 'Correct decision recorded',
  SAFETY_VIOLATION: 'Safety rule violation recorded',
  EVACUATION_STARTED: 'Evacuation started',
  EVACUATION_COMPLETED: 'Evacuation completed',
  OBJECTIVE_COMPLETED: 'Training objective completed',
  COMMUNICATION_ACTION: 'Communication action recorded',
  TEAMWORK_ACTION: 'Teamwork action recorded',
  SCENARIO_COMPLETED: 'Scenario completed'
};

const TIMINGS = {
  powerIsolationTime: {
    start: ['SCENARIO_STARTED'],
    end: ['POWER_ISOLATED']
  },
  pinRemovalTime: {
    start: ['SCENARIO_STARTED'],
    end: ['EXTINGUISHER_PIN_REMOVED']
  },
  extinguishingTime: {
    start: ['EXTINGUISHING_STARTED'],
    end: ['FIRE_EXTINGUISHED']
  },
  totalResponseTime: {
    start: ['SCENARIO_STARTED'],
    end: ['SCENARIO_COMPLETED']
  }
};

function unityEvents(session) {
  return Array.isArray(session?.performanceFeatures?.events)
    ? session.performanceFeatures.events.filter(event => event && typeof event === 'object')
    : [];
}

function findEventTime(events, eventTypes) {
  for (const eventType of eventTypes) {
    const event = events.find(item => item.eventType === eventType && timestampMillis(item.timestamp) !== null);
    if (event) return timestampMillis(event.timestamp);
  }
  return null;
}

export function getUnityEventLabel(eventType) {
  return EVENT_LABELS[eventType] || 'Recorded training event';
}

export function getUnityTiming(session, metric) {
  const definition = TIMINGS[metric];
  if (!definition) return { seconds: null, source: 'unavailable', valid: false };

  const events = unityEvents(session);
  const start = findEventTime(events, definition.start);
  const end = findEventTime(events, definition.end);
  const stored = session?.unityMetrics?.[metric];
  const hasStored = typeof stored === 'number' && Number.isFinite(stored) && stored >= 0;
  if (start !== null && end !== null) {
    const seconds = (end - start) / 1000;
    if (Number.isFinite(seconds) && seconds >= 0) {
      return {
        seconds,
        source: 'event timestamps',
        valid: true,
        warning: hasStored && Math.abs(stored - seconds) > 1
          ? `Event interval (${seconds.toFixed(2)} s) differs from Unity duration (${stored.toFixed(2)} s).`
          : null
      };
    }
    return {
      seconds: null,
      source: 'event timestamps',
      valid: false,
      warning: 'End event timestamp precedes its start event; the duration was rejected.'
    };
  }

  if (hasStored) {
    return { seconds: stored, source: 'Unity recorded duration', valid: true };
  }
  return { seconds: null, source: 'unavailable', valid: false };
}

export function getUnitySequence(session) {
  const events = unityEvents(session);
  const sequence = [
    ['POWER_ISOLATED', 'power isolation'],
    ['EXTINGUISHER_PIN_REMOVED', 'pin removal'],
    ['EXTINGUISHING_STARTED', 'extinguisher operation']
  ].map(([eventType, label]) => {
    const timestamp = findEventTime(events, [eventType]);
    return { eventType, label, timestamp };
  });

  if (sequence.some(event => event.timestamp === null)) {
    return { result: 'Unknown / not assessed', detail: null };
  }
  if (new Set(sequence.map(event => event.timestamp)).size !== sequence.length) {
    return { result: 'Unknown / not assessed', detail: null };
  }
  if (sequence.every((event, index) => index === 0 || event.timestamp > sequence[index - 1].timestamp)) {
    return { result: 'Correct sequence recorded', detail: null };
  }

  const ordered = sequence.slice().sort((a, b) => a.timestamp - b.timestamp);
  const positions = Object.fromEntries(ordered.map((event, index) => [event.eventType, index]));
  if (positions.POWER_ISOLATED > positions.EXTINGUISHER_PIN_REMOVED) {
    return {
      result: 'Out of sequence',
      detail: 'Recorded action order: pin removal occurred before power isolation.'
    };
  }
  if (positions.EXTINGUISHER_PIN_REMOVED > positions.EXTINGUISHING_STARTED) {
    return {
      result: 'Out of sequence',
      detail: 'Recorded action order: extinguisher operation started before pin removal.'
    };
  }
  return {
    result: 'Out of sequence',
    detail: 'Recorded action order: extinguisher operation started before power isolation.'
  };
}

export function getSafetyViolationDetail(session, event) {
  if (typeof event?.metadata?.reason === 'string' && event.metadata.reason.trim()) {
    return event.metadata.reason.trim();
  }
  if (typeof event?.reason === 'string' && event.reason.trim()) {
    return event.reason.trim();
  }
  const sequence = getUnitySequence(session);
  return sequence.detail || 'Unity recorded a safety violation but did not record its specific cause.';
}

export function getSafetyPracticeObjective(session) {
  const events = unityEvents(session);
  const reason = events.find(event => event.eventType === 'SAFETY_VIOLATION')?.metadata?.reason
    || events.find(event => event.eventType === 'SAFETY_VIOLATION')?.reason
    || getUnitySequence(session).detail
    || '';
  const normalizedReason = reason.toLowerCase();

  if (normalizedReason.includes('pin removal occurred before power isolation') ||
      (normalizedReason.includes('pin') && normalizedReason.includes('before power isolation'))) {
    return 'Practice isolating power before removing the extinguisher pin.';
  }
  if (normalizedReason.includes('extinguishing began before required step') &&
      normalizedReason.includes('power isolation') &&
      normalizedReason.includes('pin removal')) {
    return 'Practice isolating power and removing the extinguisher pin before starting extinguisher operation.';
  }
  if (normalizedReason.includes('extinguishing began before') && normalizedReason.includes('pin removal')) {
    return 'Practice removing the extinguisher pin before starting extinguisher operation.';
  }
  if (normalizedReason.includes('extinguishing began before') && normalizedReason.includes('power isolation')) {
    return 'Practice isolating power before starting extinguisher operation.';
  }
  return 'Review the recorded safety violation with a trainer; Unity did not record a specific corrective action.';
}
