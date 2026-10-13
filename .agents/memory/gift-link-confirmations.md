---
name: Gift-link confirmations
description: Why gift-link access changes must be tied to the state the sender confirmed.
---

Treat a gift-link confirmation as approval of the link state the sender saw, not permission to change whatever state exists later.

**Why:** A delayed replacement retry could otherwise re-enable access after another tab disabled the link, or silently replace a newly shared link. Rejecting stale confirmations preserves the sender's latest access decision.

**How to apply:** Keep link changes conditional and atomic. On conflicts or uncertain network outcomes, refresh the owner's view and require a fresh confirmation rather than automatically retrying.
