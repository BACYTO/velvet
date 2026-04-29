# Security Specification - VELVET

## Data Invariants
1. A user cannot modify points of other users.
2. A user cannot delete or edit videos they didn't upload.
3. A user cannot set their own points during registration.
4. Timestamps must be server-generated.
5. All IDs must follow a strict regex pattern.

## The Dirty Dozen Payloads

1. **Self-Assigned Wealth**: Create user profile with `points: 999999`.
2. **Identity Theft**: Update another user's `unlocked` array.
3. **Ghost Video**: Create a video with a `uploaderId` that isn't the current user's UID.
4. **Shadow Edit**: Update a video's `uploaderId` to hijack ownership.
5. **Junk ID Poisoning**: Create a video with a document ID that is a 1MB string of junk characters.
6. **Negative Balance**: Update user points to a negative value.
7. **Time Traveler**: Set `createdAt` to a date in the future manually.
8. **PII Scraping**: Attempt to list all users to find emails (if emails were stored, but here we don't store them in public profile).
9. **Spam Comments**: Create a comment with a 100KB text body.
10. **Role Escalation**: Add an `isAdmin` field to a user profile manually.
11. **URL Poisoning**: Set `videoUrl` to a malicious script or a massive string.
12. **Orphaned Writes**: Create a comment for a video ID that doesn't exist.

## The Test Runner (firestore.rules.test.ts)
(To be implemented if a test environment is available, otherwise handled via rules drafting).
