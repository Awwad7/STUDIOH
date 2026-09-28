# /brag plan — BespokeJobs (revamp of bespokejobs-promo.mp4)

## Source
- The user's 41s promo `bespokejobs-promo.mp4` (branding, UI, demo data) plus their written brief.
- bespokejobs.ai itself is blocked from this environment, so everything visual comes from the uploaded video.

## Rubric
- **What it is:** BespokeJobs reads your resume, ranks live job openings against your experience, and writes a tailored resume and cover letter for the roles you pick. Free during beta.
- **Who it's for:** US job seekers who are actively applying (most fields, not just tech) and are tired of searching lots of sites and rewriting their resume for every job.
- **What sets it apart:** transparent scores (skills, title, seniority, location) that employers can't pay to influence; two resumes (ATS + hiring team) plus a cover letter per role; 2M+ jobs from ~45,000 employers; resumes are never sold or sent to employers.
- **Strongest claim:** "see exactly why a role scored." / "employers can't pay to rank higher."
- **Visual hook:** twenty job-search tabs piling up on screen and a resume filename mutating `resume_v1.docx` → `resume_FINAL_v7_actually_final.docx`, then everything is swept away.
- **Real UI to show:** upload card with skill chips → ranked shortlist → score breakdown card → three document cards with download buttons (all taken from the original video).
- **Tone:** polished, with one light joke in the hook (app-store clarity, polished pacing).
- **Share caption:** see share-copy.txt.

## What changes from the original
- 41s → 23.5s. The hook lands within the first 5s, and the brand reveal lands on a beat at 4.39s.
- The hook is animated (tabs pile up, the filename keeps mutating) instead of static text.
- The UI is shown at 2–3× the original size and is centered, instead of small cards in empty space.
- The proof points become part of the flow: privacy under upload, the 2M+/45,000 counter over the ranked list, and "employers can't pay" under the breakdown. There's no separate stats slide.
- A simulated cursor clicks through the flow: pick the top match, then download the documents.

## Visual identity (sampled from the video)
- Background `#05060C`, faint 64px grid, teal radial glow `#0B2A2A`
- Card `#0C1018`, border `rgba(94,232,212,.18)`; the active card glows
- Accent / mint `#5EE8D4`; text `#F2F4F7`; muted `#8A93A3`
- Inter (variable), 600–700 for headlines; lowercase headlines as in the original
- Logo: mint rounded tile with a dark "b", then `bespokejobs` in white and `.ai` in mint

## Avoid
- Anything like "beat the ATS". The ATS resume is labeled only "for applicant tracking systems".
- Anything implying we apply for people. The only action is download.
- Real user data. The demo data is Sample Candidate, Northwind Health, Halcyon Foods, Lakeshore Logistics and Aster Manufacturing.

## Storyboard — 1920×1080, 30fps, 23.5s
| # | Scene | Time | On screen |
|---|---|---|---|
| 1 | Hook | 0.00–4.39 | Tabs fly in and stack like a browser tab strip that overflows (fictional titles: "Operations Manager – Chicago…", "Jobs near me – page 3"…), with a counter ticking to **20**. Headline: **"twenty tabs."** (0.4s). At 1.9s: **"one resume, rewritten every time."**, and a resume card's filename cycles v1 → v2 → FINAL → FINAL_v7_actually_final. |
| 2 | Reveal | 4.39–7.09 | (Beat-locked at 4.39.) The tabs get swept away and the logo tile pops. **"stop searching."** then **"read the ones that fit."** in mint. |
| 3 | Upload | 7.09–10.37 | `01 · upload` — **"drop in your resume."** The Sample Candidate resume drops in, a scan line sweeps, then 8 skill chips pop out on alternate beats. Footer: 🔒 "never sold. never sent to employers." |
| 4 | Ranked | 10.37–13.64 | `02 · ranked` — **"live openings, ranked for you."** A counter "2,000,000+ open jobs · 45,000 employers" counts up. 4 rows arrive and their bars fill (94/89/83/71). The cursor moves to the top row and clicks it at 13.11 (strong cue). |
| 5 | Why | 13.64–16.93 | `03 · why it matched` — **"see exactly why a role scored."** The score card 94 counts up and 4 bars fill: Skills overlap 96, Title alignment 92, Seniority 90, Location fit 100. Line: **"employers can't pay to rank higher."** |
| 6 | Documents | 16.93–19.66 | `04 · tailored documents` — **"two resumes and a cover letter, per role."** Three cards fan in: Resume *for applicant tracking systems* (.docx), Resume *for hiring teams* (.pdf), Cover letter *written for this role* (.pdf). The cursor clicks download and a "3 files downloaded" toast appears. |
| 7 | CTA | 19.66–23.50 | Logo, then **"a job search tailored to you."** The **Find my matches** button lands and pulses at 20.75. Under it: "free during beta · bespokejobs.ai". Music fades out. |

Durations: 4.39 + 2.70 + 3.28 + 3.27 + 3.29 + 2.73 + 3.84 = 23.5s.

## Audio
- Music: `happy-beats-business-moves-vol-12` (steady, clean; polished) at about 0.34, with a 0.2s fade-in and a 1.4s fade-out.
- Music cue guidance (bundled preset, 110 BPM, beat ≈ 0.545s): lock the reveal to 4.39, the top-match click to 13.11 and the document fan-in to 17.47. Skill chips go on alternate beats (7.64, 8.74, 9.83…).
- SFX (sparse, low high-frequency risk): soft ticks on a few tabs (`ui/rollover2`), `impactSoft_medium_001` on the reveal, `drop_001` when the resume lands, `click_003` on the row click and the download click, `card-slide-1` on the document fan, and `bong_001` on the CTA button.
