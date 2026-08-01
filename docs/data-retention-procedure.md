# Data retention procedure

Draft. Retention periods are `TODO_REQUIRED` and must be approved by the owner/legal counsel.

1. Identify records by type: leads, chats, attachments, reviews, consent proofs, data subject requests.
2. Run SQL dry-run functions first and export the affected IDs.
3. Verify identity and legal basis before deletion requested by a subject.
4. Archive records when business/legal need remains but active processing is no longer needed.
5. Delete related Storage objects before marking attachment deletion complete.
6. Keep minimal deletion log: entity type, entity id hash, action, timestamp, admin id, reason.
7. Process in small batches and require explicit limit to prevent mass deletion.
8. Do not enable cron in production until dry-run reports are reviewed.
