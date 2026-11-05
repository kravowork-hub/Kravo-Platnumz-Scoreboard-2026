# Security Specification & Invariants

## 1. Data Invariants
1. **Master Admin Exclusivity:** Only `kravoplatnumzofficial@gmail.com` with a verified email token or verified admin registry document can list all users and alter an account's authorization status.
2. **Anti-Escalation & Self-Unrevocation:** Non-admin users cannot alter `role`, `status`, `revokedAt`, or `revokedReason` on their user documents. Once an account is set to `status: 'revoked'`, all subsequent write attempts by that user on their profile, channels, or match history are denied.
3. **Owner Integrity:** `uid` and `ownerUid` must strictly match the authenticated caller (`request.auth.uid`).
4. **Id Hardening:** Document IDs and channel slugs must pass `isValidId` and regex `^[a-zA-Z0-9_\-]+$`.
5. **Channel Public Overlay Invariant:** Channel live state documents (`/channels/{channelSlug}`) are publicly readable to allow OBS Browser Sources to display live matches without credentials.
6. **Subcollection Inheritance:** Match history documents (`/channels/{channelId}/history/{matchId}`) require verified non-revoked ownership or master admin authority.

## 2. The Dirty Dozen Payloads (Designed to Fail with PERMISSION_DENIED)
1. **Payload 1 (Self-Promotion Attack):** Non-admin user attempts to create a user profile with `"role": "admin"`.
2. **Payload 2 (Un-Revoke Attack):** Revoked user attempts to send `{ "status": "active" }` to their profile document.
3. **Payload 3 (Spoofed Admin Email):** User with unverified email (`email_verified == false`) claims `kravoplatnumzofficial@gmail.com` to list users.
4. **Payload 4 (Ghost Field Injection):** Malicious write to `/users/{userId}` with ghost field `"canBypassRules": true`.
5. **Payload 5 (ID Poisoning Attack):** Document ID contains 2KB malicious string or illegal path characters.
6. **Payload 6 (Channel Hijack):** User B attempts to write live match state with `ownerUid: "User_A"`.
7. **Payload 7 (Revoked Channel Update):** Revoked user attempts to send live score update to their channel.
8. **Payload 8 (Anonymous Channel Write):** Unauthenticated caller attempts to modify live scores on a channel.
9. **Payload 9 (History Subcollection Poisoning):** Non-owner attempts to write to `/channels/{channelId}/history/{matchId}`.
10. **Payload 10 (Negative Score / Denial of Logic):** Payload with negative scores `{ "score1": -50 }`.
11. **Payload 11 (Admin Profile Tampering):** Non-admin attempts to delete or write directly to `/admins/{adminId}`.
12. **Payload 12 (Blanket User Scraping):** Unauthenticated or non-admin user attempts to list `/users`.

## 3. Security Assertions Summary
- Rule set version: 2
- Master Admin: `kravoplatnumzofficial@gmail.com` (Verified token required)
- ABAC Enforcement: User status (`active` vs `revoked`) evaluated before write permission is granted.
