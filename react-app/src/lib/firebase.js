export function cloudErrorMessage(error) {
  const code    = error && error.code    ? String(error.code)    : "";
  const message = error && error.message ? String(error.message) : "";

  if (code.includes("permission-denied"))
    return "Firestore 규칙에서 읽기/쓰기가 차단되었습니다.";
  if (code.includes("not-found") || message.includes("404"))
    return "Firestore Database가 없거나 저장 문서가 아직 없습니다.";
  if (code.includes("unavailable"))
    return "Firestore 서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";

  return code || message || "Firebase 설정과 Firestore 규칙을 확인해주세요.";
}

export function parseFirebaseConfigText(text) {
  const config = {};
  const keys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId", "measurementId"];
  keys.forEach(key => {
    const match = text.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
    if (match) config[key] = match[1];
  });
  return config;
}

export function isFirebaseConfigured(config) {
  return !!(config && config.apiKey && config.projectId && config.appId);
}
