using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace ResQVerse.Unity
{
    public sealed class FirebaseRestClient : MonoBehaviour
    {
        private const string ProjectId = "vr-disaster-training-platform";
        private const string AuthBaseUrl = "https://identitytoolkit.googleapis.com/v1";
        private const string SecureTokenUrl = "https://securetoken.googleapis.com/v1";
        private const string FirestoreBaseUrl = "https://firestore.googleapis.com/v1";

        [SerializeField] private string webApiKey;

        private string _idToken;
        private string _refreshToken;
        private string _userId;
        private DateTime _tokenExpiresAt;

        public string UserId => _userId;
        public bool IsSignedIn => !string.IsNullOrEmpty(_idToken) && !string.IsNullOrEmpty(_userId);

        public void SignOut()
        {
            ClearIdentity();
        }

        public IEnumerator SignIn(string email, string password, Action onSuccess, Action<string> onError)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrEmpty(password))
            {
                onError?.Invoke("Enter the email and password used by your ResQVerse account.");
                yield break;
            }
            if (string.IsNullOrWhiteSpace(webApiKey))
            {
                onError?.Invoke("Configure the Firebase Web API key on the Firebase REST client.");
                yield break;
            }

            var body = JsonUtility.ToJson(new SignInRequest
            {
                email = email.Trim(),
                password = password,
                returnSecureToken = true
            });
            using (var request = CreateJsonRequest(
                $"{AuthBaseUrl}/accounts:signInWithPassword?key={webApiKey}",
                UnityWebRequest.kHttpVerbPOST,
                body))
            {
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success)
                {
                    onError?.Invoke($"Firebase sign-in failed ({request.responseCode}): {ReadError(request)}");
                    yield break;
                }

                var response = JsonUtility.FromJson<AuthTokenResponse>(request.downloadHandler.text);
                if (response == null || string.IsNullOrEmpty(response.idToken) ||
                    string.IsNullOrEmpty(response.refreshToken) || string.IsNullOrEmpty(response.localId))
                {
                    onError?.Invoke("Firebase sign-in returned an incomplete identity token.");
                    yield break;
                }

                _idToken = response.idToken;
                _refreshToken = response.refreshToken;
                _userId = response.localId;
                _tokenExpiresAt = DateTime.UtcNow.AddSeconds(ParseExpiry(response.expiresIn));
            }

            onSuccess?.Invoke();
        }

        public IEnumerator UploadSimulation(
            FirebaseSimulationResult result,
            Action onSuccess,
            Action<string> onError)
        {
            if (!IsSignedIn)
            {
                onError?.Invoke("Sign in with your ResQVerse account before uploading a simulation.");
                yield break;
            }
            if (string.IsNullOrWhiteSpace(result.simulationId) ||
                string.IsNullOrWhiteSpace(result.simulationType) ||
                string.IsNullOrWhiteSpace(result.completionStatus))
            {
                onError?.Invoke("Simulation ID, type, and completion status are required.");
                yield break;
            }

            if (DateTime.UtcNow >= _tokenExpiresAt.AddMinutes(-1))
            {
                yield return RefreshIdToken(onError);
                if (!IsSignedIn) yield break;
            }

            result.userId = _userId;
            if (string.IsNullOrEmpty(result.completedAt))
            {
                result.completedAt = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);
            }

            var documentId = Uri.EscapeDataString(result.simulationId);
            var url = $"{FirestoreBaseUrl}/projects/{ProjectId}/databases/(default)/documents/simulationResults/{documentId}?currentDocument.exists=false";
            using (var request = CreateJsonRequest(url, "PATCH", BuildFirestoreDocument(result)))
            {
                request.SetRequestHeader("Authorization", $"Bearer {_idToken}");
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success)
                {
                    onError?.Invoke($"Firestore upload failed ({request.responseCode}): {ReadError(request)}");
                    yield break;
                }
            }

            onSuccess?.Invoke();
        }

        private IEnumerator RefreshIdToken(Action<string> onError)
        {
            using (var request = CreateJsonRequest(
                $"{SecureTokenUrl}/token?key={webApiKey}",
                UnityWebRequest.kHttpVerbPOST,
                JsonUtility.ToJson(new RefreshTokenRequest { grant_type = "refresh_token", refresh_token = _refreshToken })))
            {
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success)
                {
                    ClearIdentity();
                    onError?.Invoke($"Firebase session refresh failed ({request.responseCode}): {ReadError(request)}");
                    yield break;
                }

                var response = JsonUtility.FromJson<RefreshTokenResponse>(request.downloadHandler.text);
                if (response == null || string.IsNullOrEmpty(response.id_token) ||
                    string.IsNullOrEmpty(response.refresh_token) || string.IsNullOrEmpty(response.user_id))
                {
                    ClearIdentity();
                    onError?.Invoke("Firebase session refresh returned an incomplete identity token.");
                    yield break;
                }

                _idToken = response.id_token;
                _refreshToken = response.refresh_token;
                _userId = response.user_id;
                _tokenExpiresAt = DateTime.UtcNow.AddSeconds(ParseExpiry(response.expires_in));
            }
        }

        private static UnityWebRequest CreateJsonRequest(string url, string method, string body)
        {
            var request = new UnityWebRequest(url, method)
            {
                uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body)),
                downloadHandler = new DownloadHandlerBuffer()
            };
            request.SetRequestHeader("Content-Type", "application/json");
            return request;
        }

        private static string BuildFirestoreDocument(FirebaseSimulationResult result)
        {
            var fields = new List<string>
            {
                StringField("simulationId", result.simulationId),
                StringField("userId", result.userId),
                StringField("simulationType", result.simulationType),
                StringField("completionStatus", result.completionStatus),
                TimestampField("completedAt", result.completedAt)
            };
            AddStringField(fields, "fireLocation", result.fireLocation);
            AddNumberField(fields, "totalResponseTime", result.totalResponseTime);
            AddNumberField(fields, "powerIsolationTime", result.powerIsolationTime);
            AddNumberField(fields, "pinRemovalTime", result.pinRemovalTime);
            AddNumberField(fields, "extinguishingTime", result.extinguishingTime);
            AddBooleanField(fields, "pinWasRemoved", result.pinWasRemoved);
            AddBooleanField(fields, "powerWasTurnedOff", result.powerWasTurnedOff);
            AddBooleanField(fields, "procedureViolation", result.procedureViolation);
            AddIntegerField(fields, "safetyViolations", result.safetyViolations);
            AddIntegerField(fields, "objectivesCompleted", result.objectivesCompleted);

            var eventValues = new List<string>();
            if (result.events != null)
            {
                foreach (var item in result.events)
                {
                    if (item == null || string.IsNullOrWhiteSpace(item.eventType)) continue;
                    var eventFields = new List<string>
                    {
                        StringField("eventType", item.eventType),
                        TimestampField("timestamp", item.timestamp)
                    };
                    if (!string.IsNullOrWhiteSpace(item.action))
                        eventFields.Add(StringField("action", item.action));
                    if (!string.IsNullOrWhiteSpace(item.reason))
                        eventFields.Add(StringField("reason", item.reason));
                    eventValues.Add("{\"mapValue\":{\"fields\":{" + string.Join(",", eventFields) + "}}}");
                }
            }
            fields.Add($"\"events\":{{\"arrayValue\":{{\"values\":[{string.Join(",", eventValues)}]}}}}");
            return $"{{\"fields\":{{{string.Join(",", fields)}}}}}";
        }

        private static string StringField(string name, string value) =>
            $"{QuoteJson(name)}:{{\"stringValue\":{QuoteJson(value ?? string.Empty)}}}";

        private static string TimestampField(string name, string value) =>
            $"{QuoteJson(name)}:{{\"timestampValue\":{QuoteJson(value)}}}";

        private static string NumberField(string name, double value) =>
            $"{JsonUtility.ToJson(name)}:{{\"doubleValue\":{value.ToString("R", CultureInfo.InvariantCulture)}}}";

        private static string IntegerField(string name, int value) =>
            $"{QuoteJson(name)}:{{\"integerValue\":{QuoteJson(value.ToString(CultureInfo.InvariantCulture))}}}";

        private static string BooleanField(string name, bool value) =>
            $"{JsonUtility.ToJson(name)}:{{\"booleanValue\":{value.ToString().ToLowerInvariant()}}}";

        private static void AddStringField(List<string> fields, string name, string value)
        {
            if (!string.IsNullOrWhiteSpace(value)) fields.Add(StringField(name, value));
        }

        private static void AddNumberField(List<string> fields, string name, float? value)
        {
            if (value.HasValue && !float.IsNaN(value.Value) && !float.IsInfinity(value.Value) && value.Value >= 0)
                fields.Add(NumberField(name, value.Value));
        }

        private static void AddIntegerField(List<string> fields, string name, int? value)
        {
            if (value.HasValue && value.Value >= 0) fields.Add(IntegerField(name, value.Value));
        }

        private static void AddBooleanField(List<string> fields, string name, bool? value)
        {
            if (value.HasValue) fields.Add(BooleanField(name, value.Value));
        }

        private static string QuoteJson(string value)
        {
            var builder = new StringBuilder(value.Length + 2);
            builder.Append('"');
            foreach (var character in value)
            {
                switch (character)
                {
                    case '"': builder.Append("\\\""); break;
                    case '\\': builder.Append("\\\\"); break;
                    case '\b': builder.Append("\\b"); break;
                    case '\f': builder.Append("\\f"); break;
                    case '\n': builder.Append("\\n"); break;
                    case '\r': builder.Append("\\r"); break;
                    case '\t': builder.Append("\\t"); break;
                    default:
                        if (character < 0x20)
                            builder.Append("\\u").Append(((int)character).ToString("x4", CultureInfo.InvariantCulture));
                        else
                            builder.Append(character);
                        break;
                }
            }
            return builder.Append('"').ToString();
        }

        private static long ParseExpiry(string value)
        {
            return long.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var seconds) && seconds > 0
                ? seconds
                : 3600;
        }

        private static string ReadError(UnityWebRequest request)
        {
            if (!string.IsNullOrEmpty(request.downloadHandler?.text))
                return request.downloadHandler.text;
            return request.error ?? "Unknown Firebase error.";
        }

        private void ClearIdentity()
        {
            _idToken = null;
            _refreshToken = null;
            _userId = null;
            _tokenExpiresAt = DateTime.MinValue;
        }

        [Serializable]
        private sealed class SignInRequest
        {
            public string email;
            public string password;
            public bool returnSecureToken;
        }

        [Serializable]
        private sealed class RefreshTokenRequest
        {
            public string grant_type;
            public string refresh_token;
        }

        [Serializable]
        private sealed class AuthTokenResponse
        {
            public string idToken;
            public string refreshToken;
            public string localId;
            public string expiresIn;
        }

        [Serializable]
        private sealed class RefreshTokenResponse
        {
            public string id_token;
            public string refresh_token;
            public string user_id;
            public string expires_in;
        }
    }
}
