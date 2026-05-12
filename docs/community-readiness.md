# Community Readiness Checklist

This checklist defines the path from scaffold to a real Gentle-AI community integration candidate.

The goal is not to make the repository look ready. The goal is to make the gateway **work safely**: Telegram controls a local Gentle-AI configured agent, OpenCode first, without adding a model layer or bypassing permissions.

## Readiness verdict

Current status: **not ready for Gentle-AI inclusion yet**.

The architecture is aligned, but the product loop is incomplete. Ask for a Gentle-AI README/community mention only after the MVP loop works end-to-end and the security boundaries are enforced in code.

## Approval checklist

- [ ] Telegram can open an allowlisted project.
- [ ] Gateway starts or attaches to a local OpenCode runtime bound to localhost only.
- [ ] Telegram can send a normal message to the active agent session.
- [ ] Telegram receives the real assistant response from OpenCode.
- [ ] Permission requests are shown as Telegram inline buttons.
- [ ] Permission answers are sent back to OpenCode without bypassing agent policy.
- [ ] Session IDs map to the correct runtime/project.
- [ ] Multiple runtimes do not collide on ports.
- [ ] Unauthorized Telegram users are rejected.
- [ ] Project paths are protected with `realpath` and base-directory allowlisting.
- [ ] README states exactly what works today and what is planned.
- [ ] Install/development commands use `corepack pnpm` consistently.
- [ ] CI verifies typecheck and tests.

## MVP roadmap slices

Each slice should be reviewable on its own. Keep code, tests, and docs for the slice together.

The order is intentional: first make the public promise honest, then lock the safety boundaries, then build the real product loop.

| Slice | Outcome | Main scope | Acceptance |
| --- | --- | --- | --- |
| 1. Honest docs baseline | Docs match current implementation. | README/status, command matrix, install commands. | A new user can tell what works now vs planned. |
| 2. Localhost enforcement | OpenCode cannot bind publicly through config. | Config validation, adapter startup guard, tests. | `0.0.0.0` or public host config fails safely. |
| 3. Runtime/session mapping | Sessions route to the correct runtime. | Session manager or mapping in core/adapter. | Multi-project sessions do not fall back to the first runtime. |
| 4. Port probing | Multiple managed runtimes can start safely. | Free-port detection, collision tests. | Starting two runtimes does not reuse the same port. |
| 5. Message response loop | Telegram receives real OpenCode responses. | Polling or subscription bridge, formatter, Telegram delivery. | `/open`, send message, receive assistant output in Telegram. |
| 6. Permission request loop | Permission requests are actionable from Telegram. | OpenCode permission detection, inline buttons, callback handlers. | Approve once / approve always / deny reaches OpenCode. |
| 7. Session recovery commands | User can recover active work. | `/sessions`, `/session <id>`, `/continue`, state behavior. | Telegram can switch/recover sessions without losing runtime mapping. |
| 8. Safe runtime controls | User can inspect and stop work safely. | `/status`, `/abort`, `/diff`, `/close`, `/stop_runtime`. | Commands affect only the active mapped session/runtime. |
| 9. Security test pack | Core safety expectations are tested. | Unauthorized users, path traversal, localhost, permission flow. | Security-sensitive behavior has automated coverage. |
| 10. Community-ready README | Public positioning is ready. | README, Gentle-AI integration doc, screenshots/example flow if available. | README can be linked from Gentle-AI without overpromising. |

## Slice detail

### 1. Honest docs baseline

Purpose: stop overpromising before product work accelerates.

Right now the repository is more honest in `docs/roadmap.md` than in the top-level README. This slice makes the public entry point clear: the project is an experimental community integration, not a finished bot.

Build:

- Replace scaffold/upload wording in README.
- Add a status table: implemented, partial, planned.
- Use `corepack pnpm` in setup commands.
- Keep the Gentle-AI positioning clear: unofficial, independent, adapter-first.
- Link this readiness checklist from README and roadmap docs.
- Make command documentation match the actual Telegram command handlers.

Do not:

- Add aspirational install claims.
- Present permission buttons or response streaming as done until they work.

Acceptance:

- A new reader can identify what works today in under one minute.
- README does not include scaffold upload instructions.
- Every documented command is marked implemented, partial, or planned.

### 2. Localhost enforcement

Purpose: make the documented security boundary real in code.

The gateway starts local agent runtimes. That means a bad bind host is not a small config bug; it can expose a local coding agent server. This must be enforced before improving the product loop.

Build:

- Reject public bind hosts in config validation.
- Allow only loopback hosts such as `127.0.0.1` or `localhost`.
- Add tests for unsafe host values.
- Fail with an actionable error that explains why public bind hosts are rejected.
- Document the localhost-only rule in config examples.

Do not:

- Add an override flag for public binding in MVP.
- Treat this as documentation-only.

Acceptance:

- Config using `0.0.0.0` fails before spawning OpenCode.
- Safe loopback config still starts normally.
- Tests cover allowed and rejected host values.

### 3. Runtime/session mapping

Purpose: prevent cross-project/session confusion.

The current placeholder behavior can return the first runtime for a session. That is dangerous once more than one project or runtime exists. This slice gives the gateway a reliable ownership model.

Build:

- Track which runtime owns each agent session.
- Remove placeholder behavior that returns the first runtime.
- Add tests for two projects/runtimes.
- Decide where mapping lives: core session manager, adapter-level map, or a dedicated registry.
- Record project ID, runtime ID, agent session ID, and timestamps.

Do not:

- Guess runtime ownership from array order.
- Mix Telegram chat state with adapter runtime state without an explicit boundary.

Acceptance:

- Session lookup returns the correct runtime for at least two simultaneous runtimes.
- Unknown session IDs fail clearly.
- `/abort` and `/diff` cannot accidentally target another runtime.

### 4. Port probing

Purpose: support multiple managed runtimes safely.

The adapter currently uses the first configured port. That is fine for a sketch, not for a tool that opens real projects from a phone. This slice makes runtime startup deterministic and safe.

Build:

- Probe ports before spawning OpenCode.
- Respect configured port range.
- Fail clearly when no port is available.
- Avoid races where possible by checking immediately before spawn.
- Track allocated ports for managed runtimes.

Do not:

- Silently reuse an occupied port.
- Expand outside the configured port range without explicit config.

Acceptance:

- Starting two managed runtimes selects different ports.
- Occupied ports are skipped.
- Exhausted port range produces a useful error.

### 5. Message response loop

Purpose: make the gateway real.

This is the first visible product slice. Before this slice, Telegram can trigger work but cannot see the real result. After this slice, the gateway becomes a remote screen, not just a remote button.

Build:

- Send Telegram text to OpenCode.
- Fetch or subscribe to assistant responses.
- Deliver responses back to Telegram without summarizing.
- Handle Telegram message length limits through formatting/splitting only.
- Avoid duplicate message delivery when polling.
- Preserve enough metadata to know which Telegram chat/session receives the response.
- Surface adapter errors without leaking secrets.

Do not:

- Summarize, rewrite, classify, or “improve” assistant output.
- Add a second model or middleware reasoning layer.
- Block forever waiting for a response without timeout or progress feedback.

Acceptance:

- User runs `/open <project>`, sends a normal message, and receives the assistant response in Telegram.
- Long responses are split safely for Telegram.
- Duplicate polling does not resend the same assistant message repeatedly.

### 6. Permission request loop

Purpose: mirror local agent permissions remotely.

This is the slice that makes the gateway fit Gentle-AI/OpenCode trust boundaries. The gateway does not decide permissions; it only displays the agent's request and relays the user's decision.

Build:

- Detect OpenCode permission requests.
- Render Telegram inline buttons.
- Handle callback query actions.
- Send the answer back to OpenCode.
- Never invent permissions in the gateway.
- Include enough context in the Telegram message: project, tool, action/command, risk text when available.
- Expire or reject stale permission callbacks.

Do not:

- Auto-approve permissions.
- Convert “approve once” into “approve always”.
- Execute shell commands directly from Telegram.

Acceptance:

- Approve once reaches OpenCode as one-time allow.
- Approve always reaches OpenCode as remembered allow when supported.
- Deny reaches OpenCode and the user sees confirmation.
- Unauthorized Telegram users cannot answer permissions.

### 7. Session recovery commands

Purpose: make phone control usable beyond one message.

The product must survive normal mobile usage: closing Telegram, coming back later, or switching between projects. This slice makes session state explicit and recoverable.

Build:

- Implement direct session attach.
- Implement continue-latest behavior.
- Show enough metadata to choose the correct session.
- Keep active chat state separate from runtime/session ownership.
- Define current persistence limits if state is still in-memory.

Do not:

- Attach to a session from the wrong project.
- Hide ambiguity when multiple sessions look similar.

Acceptance:

- `/sessions` lists usable sessions for the active project/runtime.
- `/session <id>` attaches to the requested session.
- `/continue` picks the latest safe candidate or asks for a specific session when ambiguous.

### 8. Safe runtime controls

Purpose: expose useful controls without becoming a shell.

Remote controls are useful only if they are scoped. This slice gives the user operational control over the active work without turning Telegram into a general-purpose terminal.

Build:

- Keep `/abort` scoped to the active session.
- Keep `/diff` read-only.
- Let `/close` detach Telegram without killing local work.
- Let `/stop_runtime` stop only the active managed runtime.
- Make destructive-ish actions explicit in the confirmation or response text.
- Report what was affected: project, runtime, session.

Do not:

- Add arbitrary command execution.
- Stop all runtimes from a chat-scoped command.
- Show diffs to unauthorized users.

Acceptance:

- Controls affect only the active mapped session/runtime.
- `/close` detaches chat state while the local runtime can continue.
- `/stop_runtime` stops one managed runtime and updates status.

### 9. Security test pack

Purpose: prove the scary parts.

Security cannot stay as prose. This slice turns the most important boundaries into tests so future product work does not regress them.

Build tests for:

- Unauthorized Telegram user rejection.
- Path traversal rejection.
- Public host rejection.
- Permission answer mapping.
- Session/runtime isolation.
- Telegram callback ownership.
- Safe handling of missing/invalid config.

Do not:

- Depend on real Telegram or real OpenCode for all tests.
- Put secrets in fixtures.

Acceptance:

- Security-sensitive behavior is covered by automated tests.
- CI runs the test pack.
- Any intentionally untested external behavior is documented.

### 10. Community-ready README

Purpose: make the project linkable.

This is last on purpose. A polished README before a working product would create false confidence. After the MVP loop works, the README becomes the public entry point for Gentle-AI users.

Build:

- Lead with what works.
- Show one happy-path flow.
- State non-goals clearly.
- Mention Gentle-AI, OpenCode, and Engram accurately.
- Include install/development commands that actually work.
- Add screenshots or compact transcript if useful.
- Link security, architecture, and readiness docs.

Do not:

- Ask Gentle-AI maintainers for inclusion before MVP done.
- Claim support for future adapters before they exist.

Acceptance:

- README can be linked from Gentle-AI without overpromising.
- A Gentle-AI/OpenCode user can install, configure, and try the MVP path.
- Limitations are clear and visible.

## Definition of MVP done

MVP is done when one allowlisted Telegram user can:

1. list projects;
2. open an allowlisted project;
3. send a message to `gentle-orchestrator` through OpenCode;
4. receive the real assistant response;
5. approve or deny a permission request;
6. recover the session later;
7. inspect status or abort safely.

## After MVP

Only after MVP is real:

- polish README for public consumption;
- add screenshots or a compact terminal/Telegram walkthrough;
- create a release tag;
- ask Gentle-AI maintainers to consider linking it under Community Integrations.
