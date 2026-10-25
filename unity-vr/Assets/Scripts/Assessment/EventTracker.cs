using System;
using System.Collections.Generic;
using ResQVerse.Unity;

namespace ResQVerse.Assessment
{
    public sealed class EventTracker
    {
        private readonly List<SimulationEventRecord> _events = new List<SimulationEventRecord>();

        public IReadOnlyList<SimulationEventRecord> Events => _events;
        public int SafetyViolations { get; private set; }
        public int ObjectivesCompleted { get; private set; }
        public int CorrectDecisions { get; private set; }
        public int WrongDecisions { get; private set; }

        public void Reset()
        {
            _events.Clear();
            SafetyViolations = 0;
            ObjectivesCompleted = 0;
            CorrectDecisions = 0;
            WrongDecisions = 0;
        }

        public void RecordObjectiveCompleted()
        {
            ObjectivesCompleted++;
            Record("OBJECTIVE_COMPLETED");
        }

        public void RecordSafetyViolation()
        {
            SafetyViolations++;
            Record("SAFETY_VIOLATION");
        }

        public void RecordCorrectDecision()
        {
            CorrectDecisions++;
            Record("CORRECT_DECISION");
        }

        public void RecordWrongDecision()
        {
            WrongDecisions++;
            Record("WRONG_DECISION");
        }

        public void Record(string eventType)
        {
            _events.Add(new SimulationEventRecord(eventType, DateTime.UtcNow));
        }
    }
}
