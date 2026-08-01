# Lead Encryption Contract

No custom production encryption is implemented in this stage.

Prepared interface:

- `FieldEncryptionProvider.encrypt`
- `FieldEncryptionProvider.decrypt`
- `FieldEncryptionProvider.getKeyVersion`

Implementations:

- `DisabledFieldEncryptionProvider`: fail closed.
- `NoOpFieldEncryptionProvider`: test/local synthetic data only; forbidden in production.

Config:

- `FIELD_ENCRYPTION_MODE=disabled`
- allowed future values: `disabled`, `noop_test_only`, `external_provider`

Production PostgreSQL should use a reviewed external/provider-backed encryption implementation before storing real personal data.
