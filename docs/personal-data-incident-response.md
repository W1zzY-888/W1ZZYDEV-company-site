# Personal data incident response

Draft process.

1. Detect and record the event time, reporter and affected system.
2. Limit the incident: revoke exposed tokens, stop vulnerable endpoint, freeze risky automation.
3. Preserve evidence: logs, request IDs, affected row IDs, configuration snapshots.
4. Assess scope: data categories, number of subjects, transfer recipients, active exploitation.
5. Assign responsible owner and technical lead.
6. Prepare Roskomnadzor notification materials where legally required; submission is manual and outside code.
7. Communicate with affected subjects if required by counsel/authority.
8. Remove root cause, add regression tests and record completion.
