# SaveSift Privacy Policy

Effective date: November 2, 2026

## Scope and developer

This policy covers SaveSift — LinkedIn Capture (the Chrome extension) and the current SaveSift browser-local web application. SaveSift is maintained by GitHub user naubadnithinkumar. This policy describes the current proof of concept, including extension version 0.4.0. Planned integrations and features are not covered as if they already exist.

## Information we access

When you explicitly collect a post URL using the extension popup, the extension reads the active tab URL, validates that it is a LinkedIn activity URL, and stores its activity ID locally. On explicit request, the extension also reads LinkedIn post links from the loaded Saved Posts page, or extracts saved activity IDs from JSON response files you select. These IDs are merged into the local collection and can be exported as JSON or a text URL list. It does not automatically scroll, fetch collection API responses, or verify that every saved post has been collected.

When you request “Fetch from LinkedIn” or “Fetch content” in SaveSift, the extension locates or opens the specified LinkedIn post in a browser tab. It first attempts a public HTML request without credentials in the LinkedIn tab and parses recognized post content locally. If that yields no usable content, it reads the visible post text, derives a title from the first line, and may read the displayed author name and post URL. It checks tab URLs and page state to detect loading and sign-in requirements. It does not collect general browsing history or automatically synchronize LinkedIn saved posts.

The web application also processes text, titles, activity IDs, local workspace labels, and JSON files you choose to enter or import. Workspace labels are not authenticated identities. To check its connection, the extension provides its extension ID and version to the SaveSift page.

## How information is used

Data is used to collect and export post references, populate the post form, organize supplied content into topics, search your collection, and show source-linked extracted sentences. The current application does not send content to an AI model or use it to train models. Topic assignment and sentence extraction run locally in the browser.

## Local storage and retention

Collected activity IDs are stored in chrome.storage.local within your browser profile. Saved web-app records and the extension ID are stored in the web application's localStorage. Fetched content is returned to the form and is retained in the local collection when you choose Save post. Content displayed in an open page may remain in memory until that page is closed or reloaded.

Local data remains until you remove it, clear the relevant browser storage, or remove the extension. Browser cleanup and profile management may also remove it. The application does not provide cloud backup or cross-device synchronization. Exported JSON files remain wherever you save them and must be deleted separately.

## Sharing and network activity

On an explicit fetch request, the extension transfers the captured title, post text, author name when available, URL, and capture status to the requesting SaveSift page. This happens through browser extension messaging. The current application does not upload your saved collection or captured content to a SaveSift backend.

The extension permits requests from https://save-sift.onrender.com, the preview at https://saved-posts-lab-nithin.tanglednoodles.chatgpt.site, and http://localhost:8000 for development. Content returned to those pages is subject to the code running on the page; use only a SaveSift instance you trust.

Opening a LinkedIn post sends a normal browser request to LinkedIn, using your browser's existing LinkedIn session where applicable. LinkedIn receives those requests under its own policies. The extension does not read, store, or export your LinkedIn password, session cookies, or OAuth tokens.

Render hosts the production web application, and OpenAI Sites hosts the optional preview. These hosting providers and their delivery infrastructure may process ordinary request metadata, such as IP address, user agent, requested path, and access time when you load their pages or assets. Their handling of infrastructure logs is governed by their respective policies. The current SaveSift code includes no analytics, advertising, or tracking SDKs.

SaveSift does not sell user data, share it with advertisers or data brokers, or use it for creditworthiness or lending decisions. Content is not sent to an AI provider. If you contact us through GitHub, GitHub receives and hosts the information you submit under its own policies.

## Permissions

activeTab supports the user-initiated collection of the current post URL. storage retains collected references locally. scripting and access to LinkedIn allow the packaged extraction function to read the requested post page. Content scripts on the allowlisted SaveSift origins relay connection checks and capture requests. No cookies permission is requested. The extension's executable code is packaged with it; it does not download remote code for execution.

## Your controls and deletion

Use Clear collected URLs in the extension popup to delete its locally collected references. In the web app, use Remove for individual posts or Clear workspace for the current local workspace. Repeat for each workspace label you used, or clear all site data for the SaveSift origin in browser settings. Clearing site data also removes saved connection settings. Removing the extension clears its extension storage but does not clear the separate web application's storage or exported files. Close or reload open pages to discard unsaved form contents.

You can revoke site access, disable the extension, or uninstall it through Chrome. Avoid sharing sensitive post content or personal information in public support requests.

## Security and limitations

SaveSift restricts capture requests to specified app origins and validates activity IDs. Local collections are not separately encrypted by SaveSift and can be accessed by someone with access to your browser profile or by code running on the same app origin. Workspace labels are a convenience, not an access-control boundary. No software can guarantee absolute security.

## Changes and contact

We will update this policy when data handling changes, including before introducing server-side collection storage, analytics, AI processing, or additional platform integrations. The effective date will be updated. You can contact the developer through https://github.com/naubadnithinkumar/save-sift/issues. GitHub issues are public: do not include passwords, cookies, tokens, private post content, or other sensitive personal data. You may request a private contact method there without posting the sensitive details.
