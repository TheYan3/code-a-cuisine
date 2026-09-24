# n8n Workflows

This folder holds the exported n8n workflow JSONs that power recipe
generation.

| File | Endpoint | Purpose |
| --- | --- | --- |
| `recipe-generation.json` | `POST /webhook/generate-recipe` | Validates the request, checks the daily quota, asks Gemini, verifies the reply, stores three recipes and answers with their ids |
| `quota-lookup.json` | `GET /webhook/quota` | How many generations the calling IP has left today |
| `error-handler.json` | — | Mails workflow name, failing node, error message and execution link when any workflow fails |

## Why the generation workflow verifies so much

The Gemini API only promises *syntactically* valid JSON. `minItems`, `maxItems`
and `minimum` in a response schema are not guaranteed to be honoured, and this
node does not pass schema options through to the API at all — so the prompt
asks for the shape and the `Parse and verify recipes` node is what enforces it:
exactly three recipes, each using at least 70 percent of the listed ingredients
(capped at eight), at most three extra ingredients, cuisine, diet and time
bracket matching the request, steps renumbered without gaps, no step assigned
to a cook who is not there, nutrition present and positive.

A violation throws. That reaches the error workflow and sends mail, instead of
putting a broken recipe into the public library.

## Recipe language

The prompt in `Build prompt` tells the model to write every piece of recipe
text — title, ingredient names, steps — in English, regardless of the
language the request's ingredients were given in (the library is public and
in English throughout). `Parse and verify recipes` does not check the
language of the reply; there is no cheap, reliable way to verify that in
code, so a non-English reply would only be caught by a human noticing it in
the library.

## Quota

Three generations per IP per day, twelve across the whole system. Both counters
live under `/quota/<date>` in Firebase, which the database rules hide from
clients — only the service account reads and writes them. The check runs
*before* Gemini is called, because the paid call is what needs protecting, and
the counters are raised *after* the recipes are stored, so a failed write does
not consume quota.

When the visitor IP cannot be determined, the request counts against the
system-wide cap instead of a per-IP bucket. Otherwise a broken proxy setup
would silently turn the per-IP limit into no limit at all.

## Error handling

A few things about error workflows that cost several failed attempts, written
down rather than rediscovered:

- **It is not global.** Every workflow that should report failures needs
  `settings.errorWorkflow` pointing at the error handler's id.
- **Keep the error handler active.** The documentation says publishing is not
  required, but here it only produced a handler run once it was activated —
  one observation per state, so treat this as a working setup rather than a
  proven rule.
- **The error trigger ignores manual runs** by design, so test through the
  webhook or a schedule. `n8n-nodes-base.stopAndError` is the documented way
  to fail a workflow on purpose.
- Handler runs show up in the execution list a moment *after* the failing run,
  so checking immediately gives a false negative.

## Exporting

In n8n, open the workflow and use "Download" (or the three-dot menu →
"Download") to export it as JSON. Save the file here under a descriptive
name.

**Credentials must never end up in an export.** n8n stores credentials
separately and only references them by ID in the exported JSON — double
check a fresh export before committing it, especially after copying nodes
from elsewhere.

## Importing

Open the existing workflow in the n8n UI and use "Import from File" from
**its own** three-dot menu, not from the workflow overview. That replaces
the content while keeping the workflow ID and its activation state. A
freshly created workflow is inactive after import and needs to be switched
on by hand.
