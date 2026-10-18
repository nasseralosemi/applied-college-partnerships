# Security Specification & Threat Model

## Data Invariants
1. Agreements must have a valid non-empty ID, partner name, sector, and valid status.
2. Executions must be tied to a valid agreementId and partnerName.
3. Surveys must reference a valid agreementId and record valid scores (1-5 range).
4. Evaluations must reference a valid agreementId and contain bounded scores (0-100 overall score).
5. User accounts must have valid roleType and account status ('نشط' | 'معطل').

## Dirty Dozen Payloads Handled
1. Oversized document ID injection (>128 chars).
2. Missing required fields (e.g., creating agreement without partnerName).
3. Privilege escalation in user accounts (e.g., unauthorized modifying of roleType).
4. Unbounded arrays or arbitrary payload injections.
5. Injected script tags or unexpected property keys in update operations.
6. Deletion of non-existent records.
7. Negative beneficiary count in execution activities.
8. Status poisoning with unrecognized enum states.
9. Cross-collection reference mismatch.
10. Rapid payload flooding.
11. Reading PII without proper context.
12. Direct mutation of server timestamp fields.
