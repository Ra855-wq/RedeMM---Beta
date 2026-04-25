# Firebase Security Specification

## Data Invariants
1. **User Identity**: A user profile can only be created with the UID matching the authenticated user.
2. **Role Locking**: Users cannot elevate their own role to 'admin'.
3. **Patient Ownership**: Patients are owned by a doctor; only that doctor or an admin can access or delete the record.
4. **Chat Privacy**: Only participants in the `participants` array of a chat can read/write messages in that chat's subcollection.
5. **Atomic Timestamps**: All `createdAt` and `updatedAt` fields must align with `request.time`.

## The Dirty Dozen (Malicious Payloads)

1. **Self-Promotion**: User `doc_1` tries to update `users/doc_1` with `{ "role": "admin" }`.
2. **Ghost Patient**: User `doc_1` tries to create a patient with `doctorId: "doc_2"`.
3. **Identity Spoofing**: User `doc_1` tries to update `users/doc_2`.
4. **Shadow Field Injection**: Creating a patient with `{ "name": "John", "isAdmin": true, ... }`.
5. **Chat Eavesdropping**: User `doc_3` tries to list `chats/chat_1_2/messages` where `participants = ["doc_1", "doc_2"]`.
6. **Orphaned Message**: User `doc_1` sends a message to a chat they are not part of.
7. **Timestamp Fraud**: Sending `createdAt: "2020-01-01"` instead of server time.
8. **ID Poisoning**: Attempting to create a document with ID `../../etc/passwd`.
9. **Status Manipulation**: Non-admin user tries to set `status: "active"` on a pending account.
10. **PII Scraping**: Trying to list all `users` with a broad query.
11. **Resource Exhaustion**: Sending a message with a 2MB text body.
12. **State Shortcutting**: Updating a patient record without including required fields.

## Test Runner Plan
Generating `firestore.rules.test.ts` to verify these failures. (Omitted for brevity in this step, but part of the workflow).
