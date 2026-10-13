---
name: Runtime availability versus protected secrets
description: A runtime environment value is not proof that it was securely saved.
---

A key can exist in the runtime while protected-secret existence checks report false. Ordinary environment values may be persisted in project configuration.

**Why:** This project received credentials through ordinary environment configuration rather than protected Secrets, making them visible in a configuration diff.

**How to apply:** Check existence only in the runtime and protected Secrets. Never dump configuration diffs or environment contents when credentials may have been entered as ordinary variables. Remove credential-bearing ordinary variables using environment management, then request protected replacements and rotation.
