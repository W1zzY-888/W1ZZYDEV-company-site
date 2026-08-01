# Lead Repository Routing

`RegionLeadRepositoryResolver` maps a resolved data region to a repository:

- `RU`
- `INTERNATIONAL`

No cross-region fallback is allowed. If `RU` is selected and RU repository is unavailable, the service returns infrastructure failure. It does not try the international repository.

Reads by public token may probe known regions in current backend-only test mode because there is no persisted RegionLock database yet. Future public reads must resolve resource region from an opaque token binding before repository access.
