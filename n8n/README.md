# n8n Workflows

This folder holds the exported n8n workflow JSONs that power recipe
generation.

| File | Endpoint | Purpose |
| --- | --- | --- |
| `recipe-generation.json` | `POST /webhook/generate-recipe` | Validates the request, checks the daily quota, asks Gemini, verifies the reply, stores three recipes and answers with their ids |
| `quota-lookup.json` | `GET /webhook/quota` | How many generations the calling IP has left today — called by the Angular app's preferences page when it opens, which shows the number and disables "Generate a recipe" at zero |
| `quota-cleanup.json` | — (daily at 00:05) | Deletes the quota counters of every past day |
| `error-handler.json` | — | Mails workflow name, failing node, error message and execution link to `ALERT_MAIL_TO` when one of the three workflows above fails (each sets it as its Error Workflow) |

Inside n8n, sticky notes frame each section of a workflow, and the webhook and
response nodes are named after their method/path and status code
(`POST /generate-recipe (from Angular app)`, `Return 429 – daily quota used up`, …).

## Why the generation workflow verifies so much

The `Generate recipes` node has "Output Content as JSON" switched on, which sets
`responseMimeType: application/json` on the API call. Before that was set the
model did return broken JSON (a stray `]` near the end), so JSON mode is not
optional. It only covers syntax, though: `minItems`, `maxItems` and `minimum`
in a response schema are not guaranteed to be honoured, and this node has no
response schema option at all — so the prompt asks for the shape and the
`Parse and verify recipes` node is what enforces it:
exactly three recipes, each using at least 70 percent of the listed ingredients
(capped at eight), at most three extra ingredients, cuisine, diet and time
bracket matching the request, steps renumbered without gaps, no step assigned
to a cook who is not there, one non-empty responsibility label per cook,
nutrition present and positive.

A violation throws instead of putting a broken recipe into the public library.
What happens then is described under _When generation fails_ below.

## When generation fails

The webhook answers through Respond to Webhook nodes (named after the status
code they send, e.g. `Return 200 – three recipes to app`), so a run that simply
stops never answers and the frontend would wait forever. Every node after the
quota check that can realistically fail therefore has its error output wired
up (`On Error: Continue (using error output)`):

- `Generate recipes` and `Parse and verify recipes` go to `Retry Gemini once?`, which
  sends the request to the model **once more**. It lets exactly one retry
  through because it checks its own `$runIndex`, so a request costs at most
  two Gemini calls. The quota is only raised after the recipes are stored, so
  a retry is never counted twice.
- The second failure, and any failure of `Store recipes`,
  `Collect ids and raise counters` or `Raise quota counters`, goes to
  `Return 500 – generation failed` (`{"error": "..."}`) and then to
  `Fail run → error workflow emails admin`, a Stop and Error node. That fails the run on purpose, so
  the error workflow still mails the original message.
- `Build prompt` and `Build response` only rearrange data and have no error
  output.
- A store or counter failure is not retried: the three writes are not atomic,
  and a second attempt could put duplicates into the library. If only
  `Raise quota counters` fails, the recipes are already in the library and the
  visitor still gets the 500.

Code node error messages must not contain colons. The task runner splits a
thrown message at `:` and keeps only the last part, which once turned the mail
for a broken model reply into `150,"u [line 11]`. The full model reply is in
the execution data of the failed run anyway.

The frontend gives up after 90 seconds on its own (`GENERATE_TIMEOUT_MS` in
`src/app/core/recipe-api.ts`) in case the webhook never answers for a reason
this workflow cannot catch.

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
_before_ Gemini is called, because the paid call is what needs protecting, and
the counters are raised _after_ the recipes are stored, so a failed write does
not consume quota.

When the visitor IP cannot be determined, the request counts against the
system-wide cap instead of a per-IP bucket. Otherwise a broken proxy setup
would silently turn the per-IP limit into no limit at all.

The IP address is never stored. Both workflows first decide whether the
address is usable (missing or private ranges fall back to the system-wide cap,
see above), then the `Hash client IP` node (Crypto, HMAC-SHA256) turns it into
the key under `/quota/<date>`. The secret is the HMAC secret of the n8n
credential **Quota IP hash salt** (type Crypto) — it lives only in n8n, never
in an export. Generation and lookup must use the same credential, or they
would count different keys. Losing or rotating the secret only resets the
current day's per-IP counters.

`quota-cleanup.json` runs every night at 00:05 Europe/Berlin, lists the date
keys with a shallow read and deletes every day before today in one PATCH with
`null` values. A missed night is caught up by the next run, so a day's
counters are kept for roughly 24 hours at most.

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
- **Addresses come from the environment.** The mail node
  (`Email failure alert to admin`) reads its sender from `JOIN_MAIL_USER` and
  its recipient from `ALERT_MAIL_TO`, the admin address of the n8n instance,
  so no address is committed here. Both live in the `.env` next to the n8n
  stack's `docker-compose.yml`, are passed through in its `environment:`
  list, and need `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` so expressions can read
  them. After changing them, recreate the container
  (`docker compose up -d`).
- Handler runs show up in the execution list a moment _after_ the failing run,
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
