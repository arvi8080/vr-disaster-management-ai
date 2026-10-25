using System;
using System.Collections.Generic;

namespace ResQVerse.Unity
{
    [Serializable]
    public sealed class FirebaseSimulationResult
    {
        public string simulationId;
        public string userId;
        public string simulationType;
        public string fireLocation;
        public string completionStatus;
        public string completedAt;
        public bool? fireWasExtinguished;
        public float? totalResponseTime;
        public float? powerIsolationTime;
        public float? pinRemovalTime;
        public float? extinguishingTime;
        public bool? pinWasRemoved;
        public bool? powerWasTurnedOff;
        public bool? procedureViolation;
        public int? safetyViolations;
        public int? objectivesCompleted;
        public List<SimulationEventRecord> events = new List<SimulationEventRecord>();
    }

    [Serializable]
    public sealed class SimulationEventRecord
    {
        public string eventType;
        public string timestamp;

        public SimulationEventRecord(string type, DateTime time)
        {
            eventType = type;
            timestamp = time.ToUniversalTime().ToString("o");
        }
    }
}
