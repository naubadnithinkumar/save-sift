# SaveSift

Your saves, across platforms. Organized into knowledge.

## Product direction
A platform-independent bookmark organizer with source filters (LinkedIn, X, Instagram, Web, files) and cross-platform topics. These additional integrations are planned, not implemented. The current POC supports LinkedIn activity references and user-supplied text.

## Run locally
Requires Python 3 and Node.js for checks. No dependencies or build step.

```bash
python3 scripts/package_extension.py
python3 -m http.server 8000 --directory dist
# Open http://localhost:8000
node check.cjs
```

The extension ZIP is generated rather than checked into Git. You can also load the extension/ directory directly in Chrome.

## Current POC

## Scope
Buildless browser-local app plus explicit-click Chrome URL collector. No OAuth, backend, automatic LinkedIn saved-state sync, content retrieval, embeddings, or LLM integration. Topic classification uses keyword rules; combined highlights extract the opening sentence of up to five displayed posts. Demo content and IDs are synthetic.

## Try it
Open the published app. Load demo, filter topics, search, edit content, switch local workspace labels, export/import JSON. Import the supplied SaveState JSON to produce one activity reference. Paste text to organize it. Data lives in localStorage; labels are not a security boundary.

## Extension
Download extension.zip, extract it, open chrome://extensions, enable Developer mode, choose Load unpacked and select the extracted folder containing manifest.json. Open a LinkedIn activity URL, click the extension, collect URL, export JSON, import it into the app. It requests only activeTab and storage. It does not read cookies, scrape content, call Voyager, detect Save/Unsave, sync mobile activity, or send background requests. Extension has not been loaded into Chrome in this environment.

## Minimal production data model
user_saved_posts: userId + activityId, unique compound key; activityId is a string. Derive userId from server authentication. Keep content, processing state and topic membership separate. Do not infer unsaves from partial imports.

## Next stages
1. Validate the organizer on real user-supplied text.
2. Establish a permitted content acquisition path before live LinkedIn sync.
3. Implement authenticated API, durable database, scoped user access, idempotent save/delete, retry queue.
4. Add embeddings, editable multi-topic assignment and source-linked LLM summaries.
5. Verify cross-device reconciliation, deletion and data export.

## Acceptance checks
Duplicate IDs create one record; IDs retain all digits; imported saved:false items are ignored; user text is escaped; no content means Needs content; local workspace labels load separate collections; extension exports the app-compatible schema.
