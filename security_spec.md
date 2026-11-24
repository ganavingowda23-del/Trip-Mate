# TripMate Firestore Security Specification

## 1. Data Invariants
1. Every document in `/trips/{tripId}` belongs strictly to one authenticated, email-verified user (`ownerId == request.auth.uid`).
2. Document IDs (`tripId`) must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
3. No client may read, list, create, update, or delete another user's trip.
4. Immutable ownership and creation timestamps (`ownerId`, `createdAt`) cannot be modified on update.
5. `createdAt` and `updatedAt` must equal server `request.time`.
6. Unlisted or "shadow" fields are rejected via `keys().hasAll(...) && keys().hasOnly(...)` on create and `affectedKeys().hasOnly(...)` on update.

## 2. Adversarial "Dirty Dozen" Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Create**: `request.auth == null` attempting to write `/trips/trip-1`.
2. **Unverified Email Create**: `request.auth.token.email_verified == false` attempting to create `/trips/trip-1`.
3. **Identity Spoofing**: Signed-in user `uid_A` creating `/trips/trip-1` with `ownerId: "uid_B"`.
4. **Shadow Field Injection (Create)**: Valid payload plus extra field `isAdmin: true`.
5. **Shadow Field Injection (Update)**: Owner updating `title` alongside extra field `ownerId: "uid_B"`.
6. **ID Poisoning**: Creating `/trips/invalid$id!with.dots` or a 1.5KB path ID.
7. **Oversized String Exhaustion**: Setting `title` to > 160 chars or `notes` to > 2000 chars.
8. **Invalid Budget Enum**: Setting `budgetTier: "unlimited"`.
9. **Unbounded Array Attack**: Passing 25 items in `interests` (limit 10) or 30 items in `days` (limit 21).
10. **Client Timestamp Forgery**: Setting `createdAt` or `updatedAt` to a client-supplied past/future timestamp instead of `serverTimestamp()`.
11. **Cross-Tenant List Scraping**: User `uid_A` running `getDocs(collection(db, 'trips'))` without `where('ownerId', '==', uid_A)`.
12. **Cross-Tenant Delete**: User `uid_A` attempting `deleteDoc` on a trip owned by `uid_B`.
