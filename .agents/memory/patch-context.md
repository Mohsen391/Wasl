---
name: Patch context
description: Avoid ambiguous locations when applying ordered patches to repeated code.
---

Use unique neighboring lines when patching a repeated call, and keep hunks in source-file order.

**Why:** The patch matcher can match an earlier occurrence despite different indentation, making a later hunk appear out of order.

**How to apply:** Do not use a generic call plus a closing brace as the only context. Include a unique adjacent initialization or declaration.
