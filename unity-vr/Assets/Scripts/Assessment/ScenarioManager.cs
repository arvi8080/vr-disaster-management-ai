using System;
using UnityEngine;

namespace ResQVerse.Assessment
{
    public sealed class ScenarioManager : MonoBehaviour
    {
        [SerializeField] private string simulationType = "Fire";
        [SerializeField] private string fireLocation = "Training site";
        [SerializeField] private PerformanceTracker performanceTracker;

        public void StartScenario()
        {
            if (performanceTracker == null)
                throw new InvalidOperationException("Assign a PerformanceTracker to the ScenarioManager.");

            performanceTracker.Begin(simulationType, fireLocation);
        }

        public void CompleteScenario(Action onSuccess = null, Action<string> onError = null)
        {
            if (performanceTracker == null)
            {
                onError?.Invoke("Assign a PerformanceTracker to the ScenarioManager.");
                return;
            }

            performanceTracker.Complete(onSuccess, onError);
        }
    }
}
