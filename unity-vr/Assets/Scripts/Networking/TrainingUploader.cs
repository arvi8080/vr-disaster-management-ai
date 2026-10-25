using System;
using System.Collections;
using UnityEngine;

namespace ResQVerse.Unity
{
    public sealed class TrainingUploader : MonoBehaviour
    {
        [SerializeField] private FirebaseRestClient firebaseClient;

        public string UserId => firebaseClient == null ? null : firebaseClient.UserId;
        public bool IsSignedIn => firebaseClient != null && firebaseClient.IsSignedIn;

        public void SignOut()
        {
            if (firebaseClient != null) firebaseClient.SignOut();
        }

        public void SignIn(string email, string password, Action onSuccess, Action<string> onError)
        {
            if (firebaseClient == null)
            {
                onError?.Invoke("Firebase REST client is not assigned.");
                return;
            }

            StartCoroutine(firebaseClient.SignIn(email, password, onSuccess, onError));
        }

        public IEnumerator Upload(FirebaseSimulationResult result, Action onSuccess, Action<string> onError)
        {
            if (firebaseClient == null)
            {
                onError?.Invoke("Firebase REST client is not assigned.");
                yield break;
            }

            if (result == null)
            {
                onError?.Invoke("Simulation result is missing.");
                yield break;
            }

            result.userId = firebaseClient.UserId;
            yield return firebaseClient.UploadSimulation(result, onSuccess, onError);
        }
    }
}
