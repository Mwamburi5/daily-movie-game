# Owner-only chores before Approval 5 — one page (2026-09-10)

Everything on this page happens in a dashboard only Buri can open. An agent
prepared the paths and the expectations; **Buri does the clicking and ticks
the boxes**. No agent touches a dashboard, mints a cookie, or reads a token.
Dashboard labels are as of September 2026 and may have moved a menu over;
the *expect* column is what matters.

Order matters only in one place: **export the DNS records before the
`playmatchcut.com` redirect.** Everything else is independent. Total: about
an hour, in one or two slots. Deadlines come from
`docs/launch-status-review-2026-09-06.md` §2 and §7.

Facts an agent read on 2026-09-10 (read-only API / DNS, no changes made):

| fact | value |
|---|---|
| repo | `Mwamburi5/daily-movie-game`, public, default branch `main` |
| rulesets on `main` | none; branch protection: "not protected" |
| secret scanning / push protection / Dependabot security updates | all **disabled**; vulnerability alerts endpoint → 404 (alerts off) |
| default Actions token permissions | read-only (good) |
| nameservers, both domains | `ns1/ns2.vercel-dns.com` — the DNS records live in **Vercel**, the registrar is **Name.com** (expiry 2027-07-05, transfer lock on) |
| `playmatchcut.com` today | resolves to Vercel, serves a bare 404 (not attached to the project); `www.` the same |
| `www.matchcutdaily.com` today | 307 → `https://matchcutdaily.com/` |
| analytics wired in the app | `@vercel/analytics` only (`/_vercel/insights/script.js` = Web Analytics). **No Speed Insights script**, so the *Speed Insights* tab will be empty — see chore 3 |

---

## 1. MFA on the three accounts — deadline Sat 09-19 (launch-blocking)

Once the site is public the account *is* the site. Cheap, attended, unrecorded.

**1a. Vercel.** vercel.com → your avatar → **Account Settings** →
**Authentication** (sometimes under *Security*) → add a **Passkey** (Touch ID
on the Mac, or the iPhone) *and* enable **two-factor authentication** with an
authenticator app → save the **recovery codes** offline (the vault, not a
file in the repo) → confirm the recovery e-mail is current.
Expect: the Authentication page shows both a passkey and 2FA as enabled.
Closes: `docs/security-launch-checklist.md` → *Vercel account* → row 1.
While there (two minutes, same section of the checklist): **Settings → Tokens**
remove any token you do not recognise (row 2); the project has **no team
members** to prune.

- [ ] Vercel passkey + 2FA on, recovery codes stored offline

**1b. GitHub.** github.com → avatar → **Settings** → **Password and
authentication** → *Two-factor authentication* → **Enable** (authenticator
app, or a passkey as the primary) → **download the recovery codes** offline →
under *Passkeys*, add one. Then, same settings area: **SSH and GPG keys**,
**Applications → Authorized OAuth Apps**, **Developer settings → Personal
access tokens** — remove anything stale.
Expect: the 2FA panel says *enabled*; a passkey is listed.
Closes: `docs/security-launch-checklist.md` → *GitHub account and repository* → row 1.

- [ ] GitHub 2FA + passkey on, recovery codes stored offline, stale keys/apps/tokens removed

**1c. Name.com.** name.com → sign in → **My Account** → **Account Settings**
→ **Security** → **Two-Step Verification** → enable with an authenticator app
→ store the backup codes offline. Same page or *Domains*: confirm
**auto-renew is on** for both domains (they expire 2027-07-05), the payment
method is current, and an expiry alert goes to at least two channels you
control. (Transfer lock is already on — whois shows
`clientTransferProhibited`.)
Expect: two-step shows *enabled*; both domains show auto-renew on.
Closes: `docs/security-launch-checklist.md` → *Domain registrar and DNS* → rows 1 and 2.

- [ ] Name.com two-step on, backup codes offline, auto-renew + expiry alerts confirmed

---

## 2. A `main` ruleset — deadline Sat 09-19 (five minutes)

None exists today; Dependabot's six open PRs are exactly what a ruleset keeps
off `main`. All work since August is PR-based, so nothing you do changes.

Path: `https://github.com/Mwamburi5/daily-movie-game/settings/rules` →
**New ruleset** → **New branch ruleset** →

- Ruleset name: `main`
- Enforcement status: **Active**
- Target branches → **Add target** → **Include default branch**
- Rules, tick these:
  - **Restrict deletions**
  - **Require a pull request before merging** — set *Required approvals* to
    **0** (GitHub does not let you approve your own PR; the PR itself is the
    guard, not the review). Optional: *Require conversation resolution before
    merging*.
  - **Require status checks to pass** — tick *Require branches to be up to
    date before merging*, then **Add checks** and type each of these exactly
    (they are the job names in `.github/workflows/ci.yml`; pick the *GitHub
    Actions* source when it asks):
    `build-and-budgets` · `duel-rules` · `daily-rules` · `connections-rules` ·
    `browser-smoke` · `dependency-review`
  - **Block force pushes**
- Bypass list: leave **empty**. In an emergency you disable the ruleset for a
  minute (Enforcement status → Disabled) rather than carry a standing bypass.
- **Create**. Copy the ruleset's URL into the security checklist's last GitHub
  row together with a green CI run URL for the current `main` SHA
  (`d22a2553…`; `gh run list --branch main --workflow CI` shows it).

Expect: the *Rules* page lists `main` as Active with four rules; a direct
`git push origin main` is now refused; PRs merge exactly as before once the
six checks are green.
Closes: `docs/security-launch-checklist.md` → *GitHub account and repository* → rows 3 and 8.

- [ ] `main` ruleset active, URL recorded in the security checklist

**Optional, same settings area, two more minutes** (observed disabled on
2026-09-10; checklist rows 4–5, not in this week's five): **Settings → Code
security** → enable *Dependabot alerts*, *Dependabot security updates*,
*Secret scanning* and *Push protection*. Nothing in the repo trips them today
(`npm run check:security` already scans for secrets).

- [ ] (optional) alerts / security updates / secret scanning / push protection on

---

## 3. The Vercel dashboard look — was due 09-08, now **by Sun 09-13** (five minutes)

Path: `https://vercel.com/mwamburi5s-projects/marquee` →

1. **Analytics** tab → range *Last 7 days*. Expect **Visitors and Page Views
   above zero** (the nightly smoke and the canary each load the page, plus any
   real plays) and a **Top Pages** row for `/`. Expect **no custom events** —
   the project is on Hobby, which has none (decision D1, runbook §1). Their
   absence is by design, not a fault.
2. **Speed Insights** tab. Expect it to be **empty or asking you to enable
   it**. The app loads only the Web Analytics script; Speed Insights (which
   is where Vercel shows Web Vitals) is a separate script the app does not
   ship. Three docs say "Web Vitals arriving" — that expectation was wrong
   and is corrected in the 2026-09-10 addendum to the status review. If you
   want Web Vitals it is a code + CSP change with its own approval, after
   launch. Do **not** click *Enable* here now — it changes nothing without the
   script and it is a settings change inside the runway.
3. **Deployments** tab → the one marked *Production* is
   `marquee-a9w1nt9c4` (`dpl_HWeNAMnK2eLernz47PCG9RAmgCu6`, 2026-09-05) and the
   previous one `dpl_8SighytERqgygRYvbf1eMyLis6SL` still exists (that is the
   rollback target — it must not be deleted).
4. **Settings → Environment Variables**: expect **no `VITE_*` variable
   carrying a secret** (the TMDB key is author-time only and never a browser
   variable). Two minutes; closes Vercel row 6.

Write one line with the page-view number and the date into
`docs/daily-duel-216-production-deploy-receipt.md` §P4.5 (or tell an agent
to). Closes: the receipt's pending row 5; `HANDOFF/09-open-work.md` row 2;
`docs/launch-status-review-2026-09-06.md` §2 row 2. The release checklist's
"Web Vitals arrive" and "`mode_start` … verified" rows stay open by D1 and by
the missing Speed Insights script — the addendum records both.

- [ ] page views seen (number + date written down) · Speed Insights empty as expected · production + rollback deployments present · no secret `VITE_*` vars

---

## 4. Export the DNS records, then the D7 `playmatchcut.com` redirect — export any day, redirect by **Sun 09-20** (outside the freeze)

Both domains delegate to Vercel's nameservers, so the records live in Vercel,
not at Name.com.

**4a. Export first.** `https://vercel.com/mwamburi5s-projects` → **Domains**
(team level) → `matchcutdaily.com` → the **DNS Records** list → screenshot
it, or copy every row (type, name, value, TTL) into the vault. Repeat for
`playmatchcut.com`. If you prefer the terminal, from any folder:

```bash
npx --yes vercel@59.11.1 whoami && npx --yes vercel@59.11.1 dns ls matchcutdaily.com && npx --yes vercel@59.11.1 dns ls playmatchcut.com
```

Expect: `matchcutdaily.com` shows Vercel's A / CNAME records and nothing that
delegates unwanted services (no stray MX/TXT/CAA you did not add). Store the
export in the vault, not in the repo.
Closes: `docs/security-launch-checklist.md` → *Domain registrar and DNS* → rows 4 and 5.

- [ ] DNS records for both domains exported to the vault

**4b. Then the redirect.** `https://vercel.com/mwamburi5s-projects/marquee`
→ **Settings → Domains** → **Add** → `playmatchcut.com` → because the domain
is already in the team's Domains it attaches at once → choose **Redirect to
another domain** → `matchcutdaily.com` → status code **307 (temporary)** for
now — it mirrors what `www.matchcutdaily.com` does today and stays
reversible; switch to 308 after launch when the alias is permanent. Repeat
for `www.playmatchcut.com`. Then verify from the terminal:

```bash
curl -sI https://playmatchcut.com/ | grep -iE '^(HTTP|location)'
```

Expect: `HTTP/2 307` and `location: https://matchcutdaily.com/`. Nothing
about `matchcutdaily.com` changes; the prod-smoke and canary crons are
unaffected (they target the apex only).
Closes: `docs/launch-status-review-2026-09-06.md` §2 row 3 and §7 D7;
`HANDOFF/09-open-work.md` row 3; the security checklist's Vercel row 7
(`playmatchcut.com` in its explicitly approved redirected state).
Not inside the freeze: **never after Wed 09-23**.

- [ ] `playmatchcut.com` + `www` redirect live, `curl` shows 307 → apex

---

## 5. Dependabot — rule D10 first, then snooze (deadline Fri 09-18)

Six PRs are open (`gh pr list`): #4 tailwindcss 4.3.0→4.3.3 (patch), #6
`@tailwindcss/vite` 4.3.0→4.3.3 (patch), #15 `actions/upload-artifact`
4.6.2→7.0.1 (major, CI-only), and three build-tool majors whose CI is red —
#5 vite 6→8, #7 react 18→19, #8 `@vitejs/plugin-react` 4→6. The status
review's recommendation for D10 is *snooze; security lockfile bumps only*.

Nothing here is a code change. A `.github/dependabot.yml` `ignore:` block
would be one, so it waits for an agent PR after the 10-04 readout if you
still want it.

On each PR page, comment exactly:

- #5, #7, #8, #15 → `@dependabot ignore this major version` — Dependabot
  closes the PR and stops proposing that major (a later patch of the current
  major still gets a PR, which is what you want for security fixes).
- #4, #6 → leave open, unmerged (they are harmless patches; merge them on the
  first post-launch train with a rebuild, or `@dependabot ignore this minor
  version` if the noise bothers you).

Expect: four PRs closed by Dependabot with a confirmation comment; two remain.
New PRs may still appear on Mondays (09-14, 09-21) — the `main` ruleset in
chore 2 means none of them can land without your click.
Closes: `docs/launch-status-review-2026-09-06.md` §3 "Dependabot snooze (D10)";
`HANDOFF/09-open-work.md` "snooze the five Dependabot PRs … plus the new #15".

- [ ] D10 ruled · four majors ignored · two patches parked

---

## When all five are ticked

Tell an agent. It will (a) tick the matching rows in the security checklist,
the release checklist, HANDOFF and the status review in one docs-only commit,
and (b) treat MFA + ruleset as the two preconditions Approval 5 was waiting
on (status review §2 row 5 "Blocked by"). Approval 5 itself stays its own
commit, its own Preview, its own deploy, on your word.
