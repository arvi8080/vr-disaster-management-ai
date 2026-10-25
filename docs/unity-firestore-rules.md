# Unity simulation result rules

Merge this match into the existing Firestore rules for the current Firebase project. Review the complete deployed rules first: Firestore grants access when any matching `allow` expression grants it, so a broad existing rule can override these restrictions. Do not replace unrelated application rules with this snippet.

```firestore
match /simulationResults/{simulationId} {
  allow create: if request.auth != null
    && request.resource.data.keys().hasAll([
      'simulationId',
      'userId',
      'simulationType',
      'completionStatus',
      'completedAt',
      'events'
    ])
    && request.resource.data.keys().hasOnly([
      'simulationId',
      'userId',
      'simulationType',
      'fireLocation',
      'completionStatus',
      'completedAt',
      'totalResponseTime',
      'powerIsolationTime',
      'pinRemovalTime',
      'extinguishingTime',
      'pinWasRemoved',
      'powerWasTurnedOff',
      'procedureViolation',
      'safetyViolations',
      'objectivesCompleted',
      'events'
    ])
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.simulationId == simulationId
    && request.resource.data.simulationType is string
    && request.resource.data.completionStatus == 'Completed'
    && request.resource.data.completedAt is timestamp
    && request.resource.data.events is list
    && (!('fireLocation' in request.resource.data)
      || request.resource.data.fireLocation is string)
    && (!('totalResponseTime' in request.resource.data)
      || ((request.resource.data.totalResponseTime is int
        || request.resource.data.totalResponseTime is float)
        && request.resource.data.totalResponseTime >= 0))
    && (!('powerIsolationTime' in request.resource.data)
      || ((request.resource.data.powerIsolationTime is int
        || request.resource.data.powerIsolationTime is float)
        && request.resource.data.powerIsolationTime >= 0))
    && (!('pinRemovalTime' in request.resource.data)
      || ((request.resource.data.pinRemovalTime is int
        || request.resource.data.pinRemovalTime is float)
        && request.resource.data.pinRemovalTime >= 0))
    && (!('extinguishingTime' in request.resource.data)
      || ((request.resource.data.extinguishingTime is int
        || request.resource.data.extinguishingTime is float)
        && request.resource.data.extinguishingTime >= 0))
    && (!('pinWasRemoved' in request.resource.data)
      || request.resource.data.pinWasRemoved is bool)
    && (!('powerWasTurnedOff' in request.resource.data)
      || request.resource.data.powerWasTurnedOff is bool)
    && (!('procedureViolation' in request.resource.data)
      || request.resource.data.procedureViolation is bool)
    && (!('safetyViolations' in request.resource.data)
      || (request.resource.data.safetyViolations is int
        && request.resource.data.safetyViolations >= 0))
    && (!('objectivesCompleted' in request.resource.data)
      || (request.resource.data.objectivesCompleted is int
        && request.resource.data.objectivesCompleted >= 0));

  allow update, delete: if false;
}
```

Results are created by the authenticated trainee, are immutable to the client, and are read by the Node backend using the existing Firebase Admin credentials for this same project. Admin SDK reads bypass Firestore client security rules. Restrict the Firebase Web API key with Firebase project API restrictions and enforce document access through Firestore rules; the key is not an Admin credential.
