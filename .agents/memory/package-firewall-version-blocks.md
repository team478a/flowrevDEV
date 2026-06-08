---
name: Package firewall blocks some old npm patch versions
description: Why a specific dependency version 403s during pnpm install and how to find an allowed one.
---

# Package firewall can 403 specific (old) npm versions

`pnpm install` can fail with `ERR_PNPM_FETCH_403 ... Forbidden - 403 ... No
authorization header was set` for one specific package version while every other
package installs fine. This is the Replit package firewall blocking that exact
tarball (often older patch releases with known vulnerabilities), not an auth or
age problem.

**How to apply:** probe the mirror directly to find an allowed version, then pin to
it:

```bash
for v in 14.2.33 14.2.30 14.2.18; do \
  curl -s -o /dev/null -w "$v -> %{http_code}\n" \
  "http://package-firewall.replit.local/npm/<pkg>/-/<pkg>-$v.tgz"; done
```

A `200` is installable, `403` is blocked. Prefer the newest allowed patch within
the major.minor you need.
