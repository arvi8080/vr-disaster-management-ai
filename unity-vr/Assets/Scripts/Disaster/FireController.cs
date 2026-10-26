using System;
using ResQVerse.Assessment;
using UnityEngine;

namespace ResQVerse.Disaster
{
    public sealed class FireController : MonoBehaviour
    {
        [SerializeField] private PerformanceTracker performanceTracker;

        public void PowerTurnedOff()
        {
            GetTracker().RecordPowerTurnedOff();
        }

        public void ExtinguisherPinRemoved()
        {
            GetTracker().RecordPinRemoved();
        }

        public void ExtinguishingStarted()
        {
            GetTracker().RecordExtinguishingStarted();
        }

        public void FireExtinguished()
        {
            GetTracker().RecordFireExtinguished();
        }

        public void ProcedureViolation()
        {
            GetTracker().RecordSafetyViolation();
        }

        public void ProcedureViolation(string action, string reason)
        {
            GetTracker().RecordSafetyViolation(action, reason);
        }

        private PerformanceTracker GetTracker()
        {
            if (performanceTracker == null)
                throw new InvalidOperationException("Assign a PerformanceTracker to the FireController.");
            return performanceTracker;
        }
    }
}
