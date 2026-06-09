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

## Different failure: pnpm minimum-release-age blocks brand-new versions

`ERR_PNPM_NO_MATURE_MATCHING_VERSION` is NOT the firewall — it's pnpm's
`minimumReleaseAge` setting refusing a version published too recently (roughly
within the last day). The tarball returns `200` from the mirror but pnpm still
rejects it. The error names the latest version and its publish time.

**How to apply:** pick a slightly older, already-mature stable version instead of
`latest`. List recent publish dates with node (no python3 in this env):

```bash
node -e "const cp=require('child_process');const d=JSON.parse(cp.execSync('pnpm view <pkg> time --json').toString());Object.entries(d).filter(([k])=>!['created','modified'].includes(k)&&!k.includes('-')).sort((a,b)=>a[1].localeCompare(b[1])).slice(-8).forEach(([k,v])=>console.log(k,v));"
```
