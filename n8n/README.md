# n8n Workflows

This folder holds the exported n8n workflow JSONs that power recipe
generation. There are no workflow files here yet — this is the drop
location for once the workflows exist.

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
