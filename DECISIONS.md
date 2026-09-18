# Editorial & Architectural Decision Points

This document outlines the three core governance decision points evaluated for **Truth Lens**, detailing the default choice made for the platform and the editorial rationale (2–4 sentences) behind each decision.

---

### Decision Point 1 · Feed Order: What surfaces first?

- **Chosen Policy**: **Risk Priority** (`feedOrder = "risk"`) *(with interactive user toggles for Recency and Status)*.
- **Why**: In high-velocity information ecosystems like Indian WhatsApp groups, panic-inducing falsehoods spread exponentially faster than benign rumors. Ordering the feed by automated risk flags prioritizes claims exhibiting severe indicators (such as communal panic, curfew claims, or health disinformation) where the velocity of real-world harm is greatest. This guarantees that investigative journalists and volunteer fact-checkers direct their immediate attention toward mitigating high-contagion rumors before they reach viral saturation.

---

### Decision Point 2 · Visibility: Are unverified claims publicly visible or quarantined?

- **Chosen Policy**: **Publicly Visible with Caution Badges** (`visibility = "all"`) *(with configurable Quarantine Mode for strict newsrooms)*.
- **Why**: Viral misinformation already circulates across peer-to-peer encrypted channels long before newsrooms produce definitive debunk articles. Surfacing unverified claims immediately with prominent risk tags provides citizens with timely situational awareness, warning them not to forward suspicious content they may have received. This transparent posture prevents duplicate submissions and invites crowdsourced leads, while explicit warning badges ensure the platform does not inadvertently validate unreviewed claims.

---

### Decision Point 3 · Editing: Post-submission changes & flag recalculation

- **Chosen Policy**: **Audited Edits with Automatic Flag Recalculation** (`allowEditing = true`).
- **Why**: Citizens frequently submit hasty social media snippets lacking primary links or containing minor transcription errors that hinder verification. Allowing submitters to add corroborating source URLs or clarify context empowers civic participation and enables our heuristic analyzer to recalculate risk vectors immediately (such as clearing an "Unsourced Claim" flag). To preserve archival integrity and prevent malicious revisionism, every modification appends an immutable revision log with timestamps, prior text, and a mandatory editorial rationale.
