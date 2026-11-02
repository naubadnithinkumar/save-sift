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
Buildless browser-local app plus explicit-click Chrome URL collector and browser-session post capture. No OAuth, backend, automatic LinkedIn saved-state sync, embeddings, or LLM integration. Topic classification uses keyword rules; combined highlights extract the opening sentence of up to five displayed posts. Demo content and IDs are synthetic.

## Try it
Open the published app. Load demo, filter topics, search, edit content, switch local workspace labels, export/import JSON. Import the supplied SaveState JSON to produce one activity reference. Paste text to organize it. Data lives in localStorage; labels are not a security boundary.

## Chrome extension v0.2.1

1. Download this repository and extract it, or pull the latest main branch.
2. Open `chrome://extensions`, enable Developer mode, and Load unpacked the `extension/` directory. If already installed, reload it and approve the new LinkedIn host permission.
3. Reload the SaveSift page in the same Chrome profile after installing/reloading the extension.
4. Open https://save-sift.onrender.com, expand **Connect Chrome extension**, click **Check extension connection**. The ID is detected automatically. Refresh the app after installing the extension.
5. Enter a LinkedIn activity URL or ID and click **Fetch from LinkedIn**. The extension opens or focuses the post tab.
6. If redirected to login, sign in directly on LinkedIn, return to SaveSift and retry. OAuth is not a way to obtain browser-session cookies.
7. Return to SaveSift, review the title/text and click **Save post**.

The title is derived from the first visible line of post text because posts do not always have a standalone title. Extraction depends on LinkedIn’s DOM and may fail or be truncated; expand the post manually and retry, or paste content. Images, video, and documents are not extracted. This is a technical POC; LinkedIn’s restrictions on scraping extensions remain a platform constraint.

The extension requests `activeTab`, `storage`, `scripting`, and access to `https://www.linkedin.com/*`. Only the allowlisted SaveSift origins can request capture. It validates the activity ID, opens a LinkedIn page, and reads visible post text. It never reads or exports cookies, requests no cookies permission, calls no Voyager endpoints, and does not track Save/Unsave. Post content returns to the SaveSift page and is stored locally only after Save. Extension IDs are not authentication credentials. The Chrome integration has not been end-to-end verified in a logged-in browser here.

```bash
node check.cjs
node check-extension.cjs
```

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

### v0.2.1 connection fix
Uses an isolated content-script bridge instead of requiring chrome.runtime in the web page. After reloading the extension, reload SaveSift; the bridge is injected only on allowlisted app origins.

## Privacy policy

[Published policy](https://save-sift.onrender.com/privacy.html) · [Repository policy](PRIVACY.md)

## Saved-post URL collection (v0.3.0)

Reload the updated extension, open LinkedIn My Items → Saved posts, then click
**Collect loaded Saved Posts URLs** in the popup. Scroll the LinkedIn list manually
and repeat. IDs are deduplicated locally. Only links currently present inside the
page's main area are collected; lazy loading, virtualized items, unsupported URL
formats, and LinkedIn DOM changes can leave gaps. No completeness claim is made.

For response-based extraction, save each saved-post collection response from
DevTools as a separate valid JSON file. Use **Import saved-post response JSON files**
to select all pagination files. The importer recursively reads only saved:true
SaveState entities, ignores unrelated activity references, and preserves IDs as
strings. A malformed file aborts that import without changing the collection.
Never import request headers or cookies.

Use **Export URL list (.txt)** for canonical post URLs, or **Export JSON for app**
for SaveSift's existing import. These actions require no new permissions, read no
cookies, make no Voyager API calls, and do not automatically track saves or unsaves.
Run `node check-collection.cjs` for response-extraction regression checks.
