using System;
using System.Collections;
using System.Diagnostics;
using ResQVerse.Unity;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace ResQVerse.Assessment
{
    public sealed class PerformanceTracker : MonoBehaviour
    {
        [SerializeField] private TrainingUploader uploader;

        private readonly EventTracker _eventTracker = new EventTracker();
        private Stopwatch _clock;
        private string _simulationType;
        private string _fireLocation;
        private float? _powerIsolationTime;
        private float? _pinRemovalTime;
        private float? _extinguishingStartedAt;
        private float? _extinguishingTime;
        private bool? _powerWasTurnedOff;
        private bool? _pinWasRemoved;
        private bool _procedureViolation;
        private bool _fireExtinguished;
        private FirebaseSimulationResult _pendingResult;

        public bool IsRunning => _clock != null && _clock.IsRunning;
        public EventTracker Events => _eventTracker;

        public void Begin(string simulationType, string fireLocation)
        {
            if (_pendingResult != null)
                throw new InvalidOperationException("Upload or retry the previous simulation before starting another.");
            if (IsRunning) throw new InvalidOperationException("A simulation is already in progress.");
            if (string.IsNullOrWhiteSpace(simulationType))
                throw new ArgumentException("Simulation type is required.", nameof(simulationType));

            _simulationType = simulationType.Trim();
            _fireLocation = fireLocation == null ? null : fireLocation.Trim();
            _eventTracker.Reset();
            _clock = Stopwatch.StartNew();
            _powerIsolationTime = null;
            _pinRemovalTime = null;
            _extinguishingStartedAt = null;
            _extinguishingTime = null;
            _powerWasTurnedOff = simulationType.IndexOf("fire", StringComparison.OrdinalIgnoreCase) >= 0 ? false : (bool?)null;
            _pinWasRemoved = simulationType.IndexOf("fire", StringComparison.OrdinalIgnoreCase) >= 0 ? false : (bool?)null;
            _procedureViolation = false;
            _fireExtinguished = false;
            _eventTracker.Record("SCENARIO_STARTED");
        }

        public void RecordPowerTurnedOff()
        {
            EnsureRunning();
            if (_powerWasTurnedOff == true) return;
            _powerWasTurnedOff = true;
            _powerIsolationTime = (float)_clock.Elapsed.TotalSeconds;
            _eventTracker.Record("POWER_ISOLATED");
            _eventTracker.RecordObjectiveCompleted();
        }

        public void RecordPinRemoved()
        {
            EnsureRunning();
            if (_pinWasRemoved == true) return;
            if (_powerWasTurnedOff != true)
            {
                _eventTracker.RecordSafetyViolation(
                    "Extinguisher pin removal",
                    "The extinguisher pin was removed before power isolation was recorded.");
                _procedureViolation = true;
            }
            _pinWasRemoved = true;
            _pinRemovalTime = (float)_clock.Elapsed.TotalSeconds;
            _eventTracker.Record("EXTINGUISHER_PIN_REMOVED");
            _eventTracker.RecordObjectiveCompleted();
        }

        public void RecordExtinguishingStarted()
        {
            EnsureRunning();
            if (!_extinguishingStartedAt.HasValue)
            {
                var missingSteps = new System.Collections.Generic.List<string>();
                if (_powerWasTurnedOff != true) missingSteps.Add("power isolation");
                if (_pinWasRemoved != true) missingSteps.Add("extinguisher pin removal");
                if (missingSteps.Count > 0)
                {
                    _eventTracker.RecordSafetyViolation(
                        "Extinguisher operation",
                        $"Extinguishing began before required step(s): {string.Join(" and ", missingSteps)}.");
                    _procedureViolation = true;
                }
                _extinguishingStartedAt = (float)_clock.Elapsed.TotalSeconds;
                _eventTracker.Record("EXTINGUISHING_STARTED");
            }
        }

        public void RecordFireExtinguished()
        {
            EnsureRunning();
            if (_fireExtinguished) return;
            if (!_extinguishingTime.HasValue)
                _extinguishingTime = Math.Max(
                    0,
                    (float)_clock.Elapsed.TotalSeconds - (_extinguishingStartedAt ?? 0));
            _fireExtinguished = true;
            _eventTracker.RecordObjectiveCompleted();
            _eventTracker.Record("FIRE_EXTINGUISHED");
        }

        public void RecordSafetyViolation()
        {
            EnsureRunning();
            _procedureViolation = true;
            _eventTracker.RecordSafetyViolation();
        }

        public void RecordSafetyViolation(string action, string reason)
        {
            EnsureRunning();
            _procedureViolation = true;
            _eventTracker.RecordSafetyViolation(action, reason);
        }

        public void RecordCorrectDecision()
        {
            EnsureRunning();
            _eventTracker.RecordCorrectDecision();
        }

        public void RecordWrongDecision()
        {
            EnsureRunning();
            _eventTracker.RecordWrongDecision();
        }

        public void Complete(Action onSuccess = null, Action<string> onError = null)
        {
            if (_pendingResult != null)
            {
                StartCoroutine(UploadResult(_pendingResult, onSuccess, onError));
                return;
            }
            if (!IsRunning)
            {
                onError?.Invoke("Start the scenario before completing it.");
                return;
            }
            if (uploader == null || !uploader.IsSignedIn)
            {
                onError?.Invoke("Sign in to the existing ResQVerse account before completing the scenario.");
                return;
            }

            _clock.Stop();
            _eventTracker.Record("SCENARIO_COMPLETED");
            var result = new FirebaseSimulationResult
            {
                simulationId = Guid.NewGuid().ToString("N"),
                simulationType = _simulationType,
                fireLocation = _fireLocation,
                completionStatus = "Completed",
                completedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'"),
                fireWasExtinguished = _fireExtinguished,
                totalResponseTime = (float)_clock.Elapsed.TotalSeconds,
                powerIsolationTime = _powerIsolationTime,
                pinRemovalTime = _pinRemovalTime,
                extinguishingTime = _extinguishingTime,
                pinWasRemoved = _pinWasRemoved,
                powerWasTurnedOff = _powerWasTurnedOff,
                procedureViolation = _procedureViolation,
                safetyViolations = _eventTracker.SafetyViolations,
                objectivesCompleted = _eventTracker.ObjectivesCompleted
            };
            foreach (var item in _eventTracker.Events) result.events.Add(item);
            _pendingResult = result;
            StartCoroutine(UploadResult(_pendingResult, onSuccess, onError));
        }

        private IEnumerator UploadResult(
            FirebaseSimulationResult result,
            Action onSuccess,
            Action<string> onError)
        {
            var complete = false;
            string uploadError = null;
            yield return uploader.Upload(result, () => complete = true, error => uploadError = error);
            if (complete)
            {
                _pendingResult = null;
                onSuccess?.Invoke();
            }
            else
            {
                var message = uploadError ?? "Simulation upload did not complete.";
                Debug.LogError($"Unity simulation upload failed: {message}");
                onError?.Invoke(message);
            }
        }

        private void EnsureRunning()
        {
            if (!IsRunning) throw new InvalidOperationException("Start the scenario before recording telemetry.");
        }
    }
}
