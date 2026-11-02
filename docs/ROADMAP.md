# SaveSift roadmap

1. Generalize saved-item schema: platform, sourceId, URL; keep user mapping separate from content.
2. Add source filters and universal URL capture.
3. Import browser bookmark HTML and CSV/JSON.
4. Add authenticated backend and durable per-user storage.
5. Establish supported acquisition per platform; do not assume OAuth permits saved-content retrieval.
6. Add embeddings, multi-topic assignment, editable categories and source-linked LLM synthesis.

Automatic LinkedIn saved-state tracking, X bookmarks and Instagram saved collections are not implemented. Each requires independent access validation. Never export LinkedIn session cookies to the backend.
