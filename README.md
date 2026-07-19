# SecureAuth

An authentication system that doesn't just check your password — it checks the *login itself*. Every sign-in gets scored on device, location, VPN use and time of day, and the account can be locked down further with real TOTP-based two-factor authentication.

Built by team Snack Overflow.

## The core idea: TOTP, built from scratch

The brief was to solve weak, password-only login. Our answer is standard TOTP two-factor authentication — the same 6-digit, 30-second-rotating code you get from Google Authenticator, Authy, or 1Password — and we implemented the algorithm ourselves instead of pulling in a library.

`backend/utils/totp.js` is a self-contained RFC 6238 / RFC 4226 implementation: base32 encode/decode, HMAC-SHA1-based HOTP, and the time-stepped TOTP wrapper on top, using nothing but Node's built-in `crypto` module. No `speakeasy`, no `otplib`. We wanted to actually understand the algorithm we were shipping, not just call a function that produces the right number.

How it fits into the app:

- **Setup** — a logged-in user hits "Enable 2FA," the backend generates a random secret, and the frontend shows both a scannable QR code and a manual entry key (for anyone without a camera handy). Nothing is enabled yet at this point — the secret is stored, but `twoFactorEnabled` stays off.
- **Confirmation** — the user has to enter one real code from their app before 2FA actually switches on. This proves the secret was scanned correctly and the two clocks (server and phone) actually agree, instead of silently locking someone out of their own account.
- **Login** — once enabled, a correct password is no longer enough. The login response comes back as "enter your code," and only a verified TOTP code hands over a session token. There's a small drift window (±30s) so codes still work if the phone's clock is a few seconds off.
- **Turning it off** — requires re-entering your password, so a device left logged in somewhere can't be used to quietly disable your account's second factor.

We deliberately didn't make it mandatory. Right after registering, you land on a confirmation screen that explains what 2FA does and offers to set it up on the spot — but there's an equally visible "skip for now" option, and you can always turn it on later from the dashboard. Security features people are forced into are the ones they resent and work around; we'd rather people opt in once they understand what it's protecting.

## Everything else, briefly

**Risk-scored logins.** Every login attempt is scored based on whether the device is recognized, whether the location looks new, whether it's coming through a VPN, and what time it is. Low risk logs you straight in, medium risk asks you to confirm a security answer you set at registration, and high risk gets blocked outright.

**Registration screening.** New accounts are checked for disposable email domains, suspiciously fast/bot-like typing, and a failed CAPTCHA before they're even created.

**Account lockout.** Five wrong passwords in a row locks the account for 10 minutes, independent of anything else going on.

**Security dashboard.** Once logged in, you get a live risk gauge, the specific reasons behind your last score, plain-language recommendations, your trusted devices, and recent login history — plus a dedicated page that surfaces just the logins that got flagged.

**Password reset.** Standard token-based flow — request a reset, get a token (emailed in production, logged to the server console in dev since we didn't wire up a real mail provider), and set a new password within 15 minutes.

## Stack

- **Frontend:** React 19 + Vite, React Router, Axios
- **Backend:** Express 5, better-sqlite3, bcryptjs, jsonwebtoken, `qrcode` (for rendering the TOTP QR, not for the TOTP math itself)

## Running it locally

**Backend**
```
cd backend
npm install
cp .env.example .env   # set JWT_SECRET to something long and random
npm run dev
```
Runs on `http://localhost:5000` and creates `secureauth.db` (SQLite) on first run.

**Frontend**
```
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and expects the API at `http://localhost:5000/api` (see `frontend/src/services/api.js` if you need to point it elsewhere).

## Notes

This was built for a hackathon, so a few things are intentionally simple: the SQLite database is a single file with no migrations, pending login/2FA verifications live in memory rather than a real cache, and password reset emails just get logged to the console instead of actually sending. None of that affects how the TOTP flow itself works — that part is real and RFC-compliant.
