# Safari refinement release

Prepared 9 October 2026; owner approved publication 10 October 2026, Asia/Singapore.
Based on deployed a8b270f. Static architecture, approved
ap. geometry, destinations, service keys, status/Worker contracts and favicon stay.

## Evidence and changes

Narrow320px in-app preview measured search input12px and header buttons38x44px.
Source lacked viewport-fit/safe-area handling; palette max-height used static vh.
Kept satisfactory hero composition, bento layout, themes and navigation logic.

- Mobile/coarse-pointer search now16px; no disabling native zoom.
- Header controls44x44px at narrow breakpoint; category/navigation44px minimum.
- viewport-fit=cover with horizontal inset-aware shells, header/footer padding.
- Palette dynamic viewport height where supported, existing vh fallback retained.
- CSS/JS token portal-safari-20261009 prevents stale mixed assets on future release.
- AGENTS/brand README reflect mandatory appropriate family co-branding, not mass
  deployment or third-party trademark replacement.

## Focused verification

In-app320/390/430 portrait and852x393 landscape: no horizontal overflow; portrait
header75px, controls44px, search16px, hero decoded. Menu Escape, search filtering,
palette open/close checked. Mobile counter is intentionally hidden; inspect cards.
Landscape desktop-pointer input remains12px; coarse-pointer rule is16px. This is
not an actual iPhone. Previous unchanged app/Worker suites not rebuilt or rerun.
No Playwright browser cache found; earlier launch boundary not bypassed/installed.
No physical iPhone or complete accessibility certification claimed. Screenshot is
outside public tree. Local links/whitespace checked before handover.

## Owner iPhone acceptance

1. Use an owner-approved preview path or approve later publication. Do not expose
   a development server or change routes automatically.
2. Check small/large iPhone portrait/landscape: notch/Home indicator, expanded and
   collapsed Safari toolbar, hero/card text and horizontal scrolling.
3. Open/close menu and palette; search/filter, focus input, dismiss keyboard, rotate.
   Confirm no forced input zoom or stranded overlay/results.
4. Dark/light/system, reload persistence and first-paint appearance.
5. Increased text, pinch zoom, VoiceOver and reduced-motion settings.
6. Status refresh, Protected caveat and unknown/error fallback; privacy/VPN/404 links.
7. Comfortable touch targets and no font/image-loading layout jump.

## Release and rollback

Publication authorized; exact release commit/build/live verification is recorded
in private documentation after release. Review source/privacy, commit/push only
approved website set, verify exact Pages build and live files separately. No Worker
release needed. Rollback reviewed revert + normal push/Pages verification, never
client-storage clearing or service changes. Security details stay in private docs.
