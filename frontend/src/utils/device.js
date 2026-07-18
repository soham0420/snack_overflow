// Generates and persists a simple per-browser device identifier so the
// backend's trusted-device / "new device" risk check has something real to
// compare against, instead of every login looking like a new device.
export function getDeviceFingerprint() {
    let id = localStorage.getItem("deviceFingerprint");

    if (!id) {
        id = "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("deviceFingerprint", id);
    }

    return id;
}

export function getDeviceName() {
    const ua = navigator.userAgent;

    if (/Mobi|Android/i.test(ua)) return "Mobile Browser";
    if (/Mac/i.test(ua)) return "Mac Browser";
    if (/Win/i.test(ua)) return "Windows Browser";
    if (/Linux/i.test(ua)) return "Linux Browser";
    return "Unknown Browser";
}
