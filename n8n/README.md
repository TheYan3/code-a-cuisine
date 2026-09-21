# n8n Workflows

This folder holds the exported n8n workflow JSONs that power recipe
generation.

| File | Workflow | Purpose |
| --- | --- | --- |
| `error-handler.json` | Error handler — mail on workflow failure | Mails workflow name, failing node, error message and execution link when any workflow fails |

Still to come: the recipe generation workflow (`POST /webhook/generate-recipe`)
and the quota lookup (`GET /webhook/quota`).

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
