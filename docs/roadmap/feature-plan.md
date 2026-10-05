---
title: Feature plan
description: Proposed future features for Vegan Grove, drawn from Vegan Toolkit and other established vegan sites, checked against what is already spec'd and against the privacy rules.
sidebar_position: 3
---

# Feature plan

Status: **Proposed 2026-10-04**

This page is a backlog of candidate features, not a commitment. It compares what the docs already spec with what the established vegan sites and apps do well, keeps what helps a member take a real-world action, and changes or drops what conflicts with the [principles](/product/principles). The starting point was [Vegan Toolkit](https://vegantoolkit.com/), an outreach trainer that Bailey sent and that Wes wants to adopt. Ten other sites follow. Everything here was surveyed on 2026-10-04, and features are described in our own words.

A feature on this page moves into a milestone only when it has a feature page with the usual sections (Why, What ships, Data and visibility, API, Screens, Open questions) and answers the four shipping questions in `SOUL.md`. Each candidate below names the one signal that would show it worked, computed as an aggregate per [ADR-0007](/architecture/adrs/adr-0007-no-third-party-analytics).

## What is already spec'd

| Feature | Status | Milestone | What it covers today |
|---|---|---|---|
| [Places](/features/places) | Proposed, scaffolded in the API, OSM and curated data imported | M1 | Map, vegan level, place pages, submit, reviews and check-ins, private place lists, [verification](/features/places/verification), [data sources](/features/places/data-sources) |
| [Guides](/features/guides) | Proposed | M1 | Outreach, rights, vegan 101, sanctuary, nutrition; admin-authored, cited |
| [Events](/features/events) | Proposed, events ingest running daily | M2 | Listing, private RSVP, details after RSVP, per-event ICS, reminders ([RSVP privacy](/features/events/rsvp-privacy), [ingest](/ingest/events)) |
| [Groves](/features/groves) | Proposed | M2 | Ten regional chapters, private membership, Grove feed |
| [Media](/features/media) | Built 2026-09-30 | M2 | Film library, watchlist, reactions; next milestone lists comments, "suggest a film", and a screening kit |
| [Notifications](/features/notifications) | Proposed, worker stubbed | M2 | Event reminders, friend requests, messages; nothing triggered by inactivity |
| [Friends](/features/friends) | Proposed | M3 | Invite codes and QR, no search by name |
| [Feed](/features/feed) | Proposed | M3 | Friends, Grove, and opt-in public posts |
| [Messages](/features/messages) | Proposed | M3 | Encrypted at rest, organizer broadcast |
| [Action log](/features/action-log) | Proposed | M3 | Private impact journal, opt-in Grove totals |
| [Ivy](/features/companion) | Proposed, service stubbed | M4 | Text companion with read-only tools over public data; no voice in v1 ([ADR-0012](/architecture/adrs/adr-0012-companion)) |

The [milestones](/roadmap/milestones) page lists what is deliberately not scheduled (recurring events, email reminders, web push, payments). The [features overview](/features/overview) lists what is deliberately not a feature (public profiles, people nearby, follower counts, leaderboards, streaks, paid placement, business-to-member messaging). Both lists bind this plan.

## Features to adopt from Vegan Toolkit

[Vegan Toolkit](https://vegantoolkit.com/) is an unofficial, free practice tool for street outreach in the Anonymous for the Voiceless (AV) style. A member practises a conversation with an AI bystander who pushes back, or uploads a recording of a real conversation, and gets graded against AV's outreach rubric. It is built for Cube of Truth volunteers, which makes it directly relevant: AV chapters are already in the [organizations directory](/ingest/organizations) and AV-moderated Cubes already arrive through the [events ingest](/ingest/events).

What it offers, in short:

| Vegan Toolkit feature | What it does | Page |
|---|---|---|
| Full simulator | A complete conversation with one of nine bystander personas (the curious newcomer, the traditionalist, the humane-label shopper, the flexitarian, the vegetarian, the health objector, the quiet vegan, the troll, a random pick), live by voice with a typed fallback | [/train](https://vegantoolkit.com/train) |
| Objections drill | One objection at a time, one reply, instant coaching, repeat | [/train](https://vegantoolkit.com/train) |
| Upload a clip | Audio or video of a real street conversation is transcribed with speaker separation, mapped to the outreach flowchart, and graded turn by turn | [/upload](https://vegantoolkit.com/upload) |
| Rubric grading | Scores for flowchart coverage, holding the contradiction, the victim's perspective, control points, and principle adherence, plus the best moment, the biggest deviation, and what to practise next | [home](https://vegantoolkit.com/) |
| Honest limits | The upload page says plainly what the AI cannot judge: body language, noisy audio, several bystanders, more than one good answer | [/upload](https://vegantoolkit.com/upload) |
| Personal dashboard | Conversations logged, time practised, step coverage, weak spots, recommended next drill, delete a review with its transcript and audio | signed-in area |
| Try first, sign in later | Practice works without an account; a magic-link sign-in saves reviews, unlocks more personas, and allows longer uploads | [/auth](https://vegantoolkit.com/auth) |
| Expert review | Experienced outreachers read each suggested reply with its reasoning, required elements, and common mistakes, and flag any that drift from the principles | [/av-experts](https://vegantoolkit.com/av-experts) |
| Official resources and support | Links to AV's official training hub ([Activism 101](https://activism101.com/): volunteer briefing, masterclass, flowcharts, example conversations) and to AV's donation page | [Activism 101](https://activism101.com/) |

What makes it useful is that it turns the hardest part of outreach, the first awkward conversations with hostile strangers, into private practice with specific feedback. Vegan Grove's loop already has Learn and Act; this fills the gap between them.

### 1. Objection library

- **What it is.** A set of objection cards in the `outreach` Guides category. Each card holds the objection, a suggested reply, why the reply works, what a good reply must include, and common mistakes. Cards carry a framework tag (`av`, `general`) so groups with different styles can each be served.
- **Why it matters.** New activists freeze on the same twenty or thirty lines. A card they can read on the bus before a Cube is the cheapest training there is.
- **How it fits.** Guides already exist, are public, carry no member data, and require outreach content to be written by people who do outreach and reviewed by an organizer. No AI is needed. The library becomes Ivy's source for the drill below. Write our own replies; cite AV's flowchart and Earthling Ed's free e-book as sources rather than reproducing them, and use AV's wording only with AV's permission.
- **Priority and effort.** High, small. Signal: guide reads per week for the category, as a counter.

### 2. Objections drill with Ivy

- **What it is.** Ivy picks a card, plays the bystander for one line, the member types a reply, and Ivy coaches against the card's required elements. Repeat.
- **Why it matters.** Reps on hard lines build confidence faster than reading. This is the Vegan Toolkit feature with the best ratio of value to risk.
- **How it fits.** A new Ivy mode with one new read-only tool (fetch objection cards). It sends only what Ivy already sends: the handle, interests, and the conversation text. Drill sessions follow Ivy's rule: gone after 24 hours unless pinned. A first-use line states the limits, as Vegan Toolkit does.
- **Priority and effort.** High, medium. Lands with Ivy in M4. Signal: drills completed per week.

### 3. Conversation simulator with personas

- **What it is.** A full typed conversation with a bystander persona, ending in a coaching report: scores per rubric dimension, the strongest moment, the biggest slip, and one thing to practise next.
- **Why it matters.** The drill trains single replies; a simulator trains the flow of a whole conversation, including when to disengage from a troll.
- **How it fits.** Personas and rubrics are configuration written by organizers, not by the model. Ship a framework-neutral rubric first; offer an AV rubric only with AV's agreement, because the flowchart and its scoring are theirs. The report is computed from the transcript, then the transcript expires on Ivy's schedule.
- **Priority and effort.** Medium, medium to large. Signal: share of simulator sessions that reach the report.

### 4. Private practice progress

- **What it is.** A practice section in the member's own area: sessions done, time practised, rubric dimensions that keep scoring low, and a suggested next drill.
- **Why it matters.** Members who see their own progress keep going, which is the same reasoning the Action log uses.
- **How it fits.** Store the report summary (scores and the suggested next step), not the transcript, as a new `practice` entry type in the [Action log](/features/action-log). Self-visibility only; no leaderboards, streaks, or badges shown to others; opt-in Grove totals ("Long Beach Grove: 140 practice sessions this month") reuse the existing aggregate. Needs a [data inventory](/privacy/data-inventory) row.
- **Priority and effort.** Medium, small once the simulator exists. Signal: members with a second session within 30 days of their first, as a count.

### 5. Organizer review of suggested replies

- **What it is.** Experienced organizers can flag a card or a suggested reply that drifts from their group's principles, with a reason.
- **Why it matters.** AI coaching is only as good as the replies it coaches toward. Vegan Toolkit asks AV veterans to check its replies; Vegan Grove has organizers who can do the same.
- **How it fits.** Use the existing `reports` flow with a new target type, handled by admins. The reviewer is never shown. Matches the editorial rule in [Guides](/features/guides).
- **Priority and effort.** Medium, small. Signal: open flags resolved within two weeks.

### 6. Prep links on outreach events, and a support link

- **What it is.** An event of type `outreach` hosted by an AV chapter shows "before you come" links: the official briefing and training on [Activism 101](https://activism101.com/), Vegan Toolkit for practice, and our objection library. The organization page carries its own donation link.
- **Why it matters.** AV asks volunteers to watch the briefing before every Cube. Putting it on the event page is the moment it is most likely to be watched.
- **How it fits.** A `prepLinks` list on organizations, copied onto their events, plus the "Support" link-out the [personas](/product/personas) page already promises sanctuaries. No member data.
- **Priority and effort.** High, small. Can ship in M2 with Events, before any AI work. Signal: event pages with prep links, and outbound clicks counted per day.

### 7. Voice practice

- **What it is.** The simulator by voice, as Vegan Toolkit's live mode does.
- **Why it matters.** Street outreach is spoken; typing is a weaker rehearsal.
- **How it fits.** [ADR-0012](/architecture/adrs/adr-0012-companion) rules out voice in v1. Voice adds a speech provider as a second third party and audio as a new class of member data. It needs a superseding ADR first.
- **Priority and effort.** Later, large.

### 8. Upload a real conversation for review

- **What it is.** Upload audio of a real street conversation and get a turn-by-turn review.
- **Why it matters.** Feedback on real conversations is the most valuable feedback there is.
- **How it fits, and why it waits.** This is the highest-risk feature on the page. The recording holds a stranger's voice, and on video their face, captured at a protest. That is personal data about someone who never agreed to the app. California also restricts recording confidential conversations without everyone's consent; whether a street conversation counts needs legal review, not an assumption. If it ever ships: audio only, metadata stripped on the device, deleted right after transcription, the transcript expiring like an Ivy chat, a consent prompt before upload, and an entry in the [threat model](/privacy/threat-model). Until then, point members to Vegan Toolkit's upload mode, which is free and built for this.
- **Priority and effort.** Later, large, behind an ADR and a legal check.

### Shortcut worth taking first

Vegan Toolkit is free and already good at the AV-specific parts. Linking to it from the outreach Guides and from AV events (item 6) gives members the trainer this month at no cost. Wes could also contact its maker about sharing the persona and objection work, which would avoid building a weaker copy of the AV rubric.

## Features inspired by other sites

Each row says whether Vegan Grove already has the feature. "Partial" means the spec covers part of it.

| Feature | Seen at | Vegan Grove today | Proposal | Priority, effort |
|---|---|---|---|---|
| Guided "try vegan" path with daily steps | [Veganuary](https://veganuary.com/), [Challenge 22](https://challenge22.com/), [Vegan Bootcamp](https://veganbootcamp.org/), [Vegan Outreach](https://veganoutreach.org/vegan/) | No | See A below | High, medium |
| Volunteer mentors for new vegans | [Challenge 22](https://challenge22.com/), [Vegan Outreach mentor program](https://veganoutreach.org/vegan-mentorship-program/) | No | See B below | Medium, medium |
| Subscribe to a calendar of all events or one group's events | [Animal Rights Calendar](https://animalrightscalendar.org/about) | Partial: per-event ICS only | Public webcal feeds per Grove, per organization, per event type. Public events only, no token, no member data. | High, small |
| Events on a map, online events | [Animal Rights Calendar](https://animalrightscalendar.com/map) | Partial: optional map on `/events` | Make the map a first-class view; add an `online` flag so a webinar from a SoCal org can be listed without an address. | Medium, small |
| Suggest an event | [Animal Rights Calendar](https://animalrightscalendar.org/contact) | No: members cannot host in v1 | "Suggest an event" lands `pending` like a submitted place; the suggester is never shown. Hosting rules stay as they are. | Medium, small |
| Host a screening kit | [Dominion Movement](https://dominionmovement.com/host-screening) | Partial: listed under the [Media](/features/media) next milestone | Keep as spec'd; Dominion's free, no-fee screening policy makes it the first title for the kit. | High, medium |
| Quick online actions with a running total | [The Humane League Fast Action Network](https://thehumaneleague.org/fast-action-network) | No | See C below | Medium, medium |
| Saved places for trips, offline | [HappyCow](https://www.happycow.net/members/faq) | Partial: private place lists | Offline caching of a member's own lists on mobile; a "trip" is just a list. | Low, medium |
| New spots in your area | [HappyCow app](https://www.happycow.net/mobile) | No | An opt-in weekly digest of newly approved places in the member's Groves, computed on the server from Grove membership. Never from device location. | Medium, small |
| Local champions who keep listings fresh | [HappyCow Ambassadors](https://www.happycow.net/ambassadors) | Partial: anonymous check-ins and corrections | Per-Grove place stewards granted by organizers, who see the Grove's disputed and unverified places as a work queue. No points, no public badge, no ranking. | Low, small |
| Photo-rich reviews | [HappyCow](https://www.happycow.net/members/faq) | Partial: photos on reviews are spec'd | Keep; EXIF stripped on device, as for the feed. Ingested places stay text-only until an upload path exists. | Medium, medium |
| Sanctuary visit details | HappyCow lists vegan tours; sanctuaries publish visit rules on their own sites | Partial: curated sanctuaries | Curated fields for visiting days, booking link, volunteer program, accessibility, and what to bring, linked to the sanctuary Guides. | High, small |
| Nutrition self-check | [Vegan Society VNutrition](https://www.vegansociety.com/news/blog/introducing-vnutrition), [Cronometer](https://cronometer.com/) | Partial: nutrition Guides | A cited checklist guide (B12, iodine, omega-3, calcium, protein). If interactive, ticks stay on the device. Never a server-side food diary. | Low, small |

### A. Starter path

- **What it is.** A 22 to 30 step path for someone trying vegan in Southern California. Each step is one small, local thing: read a Guide, eat at a fully vegan place in your Grove, watch a film from the library, go to a potluck, visit a sanctuary.
- **Why it matters.** The challenge format is the most proven onboarding in the movement; Veganuary estimates that roughly 30 million people tried vegan in January 2026 ([survey method in its FAQ](https://veganuary.com/faq/)). None of those programs can point a newcomer at a specific Long Beach cafe or a Saturday sanctuary day. Vegan Grove can, because it already holds Places, Events, Media, and Guides.
- **How it fits.** Activists are the customers; the path is a tool they hand to a curious friend, through a link or a QR at a Cube or a potluck. Progress lives on the device or, for a signed-in member, as private Action log entries. Delivery is in-app with an opt-in push for the day's step; email is not scheduled ([milestones](/roadmap/milestones)), and nothing nags after a missed day.
- **Priority and effort.** High, medium. Signal: paths started and paths finished, as counts.

### B. Mentors

- **What it is.** Experienced members who opt in to answer a newcomer's practical questions: groceries, eating out, family dinners.
- **Why it matters.** Both Challenge 22 and Vegan Outreach pair newcomers with volunteer mentors; Vegan Outreach reports 882 mentors and more than 7,325 matched mentees ([source](https://veganoutreach.org/vegan-mentorship-program/)).
- **How it fits.** A matching service would mean strangers messaging strangers, which [Messages](/features/messages) forbids, and a directory of mentors would be a member list. Adapt: mentoring happens through the existing friend model. A Grove runs a monthly "new vegan office hours" event; mentors bring invite codes; a starter-path step suggests going. Medical questions go to Guides with citations and to registered dietitians outside the app.
- **Priority and effort.** Medium, medium. Signal: office-hours events held per Grove per quarter.

### C. Quick actions

- **What it is.** A short, curated list of time-bound actions: a public comment on a city council item, a letter to a state legislator, a call to a company. Each has a deadline, a script, and a link to the official channel.
- **Why it matters.** The Humane League reports more than 100,000 actions taken through its app ([source](https://thehumaneleague.org/fast-action-network)). Members who cannot make Saturday's vigil can still act on Tuesday.
- **How it fits.** Admin-authored, public, no member data, like Guides. "I did it" is a tap that adds a private Action log entry and increments a public count, the same pattern as the media "I took action" reaction. Ivy can draft the letter, which [Ivy's page](/features/companion) already lists. No click tracking and no per-member history beyond the private log.
- **Priority and effort.** Medium, medium. Signal: "I did it" taps per action.

## Conflicts: what we will not copy

| Seen at | Feature | Why not | What we do instead |
|---|---|---|---|
| HappyCow, Yelp, Google Places | Their listings, reviews, or photos as data | Their terms forbid bulk use, and Google would put a key back in the product ([data sources](/features/places/data-sources)) | OSM, curated sanctuaries, member submissions |
| HappyCow | Member points, top-ambassador rankings, following members | Public leaderboards and follower models are ruled out in `SOUL.md` | Anonymous check-ins and private place stewards |
| Challenge 22, Vegan Outreach, Forks Meal Planner | Support groups on Facebook or WhatsApp | Puts members' identities on platforms that sell attention; Facebook and Instagram are never data sources ([ingest](/ingest)) | Groves and Grove-scoped posts |
| Forks Meal Planner, Cronometer | Paid tiers and subscriptions | No payments in v1 | Everything free; support links point out to sanctuaries and orgs |
| Cronometer | A server-side food diary and biometrics | Health data far beyond what the product deserves ([ADR-0005](/architecture/adrs/adr-0005-data-minimization)) | A cited nutrition checklist, kept on the device |
| abillion | A product-review social network | Large, costly to moderate, and outside the activism loop. abillion shut down on 2026-03-23 after reporting a 28 million member community ([notice](https://www.abillion.com/)) | Places only; products stay out of scope |
| Veganuary | Celebrity ambassadors, corporate partnerships | Businesses and orgs are guests; no sponsored placement | Organizers and Groves as the face of the product |
| HappyCow app | New-spot alerts from the device's location | No device location is stored or sent ([ADR-0005](/architecture/adrs/adr-0005-data-minimization)) | Digest by Grove membership |
| Vegan Toolkit | Server-stored street recordings | Bystanders' voices and faces are third-party personal data; possible consent issue | Link to Vegan Toolkit; revisit only with an ADR and legal review |
| Vegan Toolkit, AV, Earthling Ed | Copying the flowchart, rubric, or replies verbatim | Their material, and AV publishes the official versions itself | Write our own cards, cite and link theirs, ask before using AV's rubric |

## Suggested phasing

Phases follow the build order in `SOUL.md`: trust, then the core loop, then delight.

| Phase | When | Items |
|---|---|---|
| **Now** | Alongside M1 and M2, no AI and no new member data | Objection library (1), prep links and support link on outreach events (6), link to Vegan Toolkit and Activism 101, subscribable calendar feeds, sanctuary visit details, suggest an event, `online` event flag |
| **Next** | M3 and M4, once the Action log and Ivy exist | Objections drill (2), private practice progress (4), organizer review of replies (5), starter path (A), quick actions (C), host a screening kit, new-places digest by Grove, conversation simulator (3) at the end of M4 |
| **Later** | After M5, each behind its own ADR or evidence | Mentor office hours (B) once Groves are active, voice practice (7), upload review (8), offline lists, place stewards, nutrition self-check |

## Open questions

- Will AV agree to an AV-style rubric and persona set inside Vegan Grove, or should the simulator stay framework-neutral and link to Vegan Toolkit for AV-specific grading? Owner: Wes, before the simulator is designed.
- Should the objection library be public on the web or only in the app? Proposal: public, like every Guide.
- Should the starter path work without an account? Proposal: yes, with progress kept on the device only.
- Does the drill need its own rate limit apart from Ivy's? Settled by Ivy usage in M4.

## Sources

Surveyed 2026-10-04. Reach figures are quoted only where the source states them.

| Site | What we looked at | Reach as stated by the source |
|---|---|---|
| [Vegan Toolkit](https://vegantoolkit.com/) | [Train](https://vegantoolkit.com/train), [Upload](https://vegantoolkit.com/upload), [AV Experts](https://vegantoolkit.com/av-experts), [sign-in](https://vegantoolkit.com/auth) | Not stated |
| [Activism 101](https://activism101.com/) (Anonymous for the Voiceless) | Briefing, masterclass, flowcharts, example conversations; [AV home](https://www.anonymousforthevoiceless.org/) for chapters | Not stated |
| [HappyCow](https://www.happycow.net/) | [Member FAQ](https://www.happycow.net/members/faq), [app page](https://www.happycow.net/mobile), [Ambassadors](https://www.happycow.net/ambassadors) | More than 4.5 million app downloads ([app page](https://www.happycow.net/mobile)) |
| [Veganuary](https://veganuary.com/) | Pledge, meal plans, [FAQ](https://veganuary.com/faq/) | About 30 million people tried vegan in January 2026, a survey-based estimate ([FAQ](https://veganuary.com/faq/)) |
| [Challenge 22](https://challenge22.com/) | 22-day challenge, mentors, dietitians | More than 400 mentors ([home](https://challenge22.com/)) |
| [Vegan Outreach](https://veganoutreach.org/vegan/) | [Vegan Mentor Program](https://veganoutreach.org/vegan-mentorship-program/), 10 Weeks to Vegan | 882 mentors, 7,325+ mentees matched ([mentor page](https://veganoutreach.org/vegan-mentorship-program/)) |
| [Vegan Bootcamp](https://veganbootcamp.org/) | Free course-based challenge, mentors and dietitians | Not stated |
| [Animal Rights Calendar](https://animalrightscalendar.com/) | [About](https://animalrightscalendar.org/about), [map](https://animalrightscalendar.com/map) | Not stated |
| [Dominion Movement](https://dominionmovement.com/host-screening) | Host a screening, free download policy | Not stated |
| [The Humane League Fast Action Network](https://thehumaneleague.org/fast-action-network) | Quick digital actions | More than 100,000 actions taken (same page) |
| [The Vegan Society](https://www.vegansociety.com/) | [VNutrition](https://www.vegansociety.com/news/blog/introducing-vnutrition), Vegan Trademark, budget guides | Not stated |
| [Cronometer](https://cronometer.com/) | Nutrition tracking | Not used |
| [Forks Meal Planner](https://support.forksmealplanner.com/article/m19n90sm1j-what-does-premium-membership-include) | Weekly plans and grocery lists, paid | Not used |
| [abillion](https://www.abillion.com/) | Closure notice | 28 million member community before closing (closure notice) |
| Earthling Ed, [30 Non-Vegan Excuses](https://our-compass.org/2019/12/30/earthling-ed-e-book/) | Free objection-handling e-book | Not used |
