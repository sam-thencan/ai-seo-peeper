# Privacy Policy: Prompt Research Buddy

_Last updated: 2026-08-24_

Prompt Research Buddy is a Chrome extension that runs prompt research inside ChatGPT and shows the web-search queries ChatGPT performs. This policy explains what it does with your data.

## TL;DR

- Nothing is sent to the developer or to any server run by the developer.
- The extension makes no network requests of its own. The only traffic is ChatGPT's own traffic, initiated in your browser, in your logged-in ChatGPT session.
- Everything the extension stores (captured queries, research session state, your form inputs) stays in your Chrome profile on your machine.
- No analytics, no telemetry, no trackers.

## What the extension handles

**Captured queries.** On chatgpt.com the extension reads the streaming response that ChatGPT's page already sends to your browser and extracts the search queries, the prompt you sent, the model name, and the conversation id. Per-tab captures live in `chrome.storage.session` (cleared on browser restart).

**Research sessions.** When you start a research session, the extension stores your inputs (business name, URL, keyword data, competitors, priorities), the prompts ChatGPT selects, the queries captured for each, and the final prompt list in `chrome.storage.local` so the session survives restarts. You can delete it at any time from the panel (Start new research, or Debug > Clear stored session).

**Automation.** During a session the extension types into ChatGPT's message box, presses send, opens new chats, and attempts to change the model picker, on chatgpt.com only, in the tab it opened, and only after you press Start. It does not read or modify any other site.

## What we do NOT collect

No analytics, crash reporting, fingerprinting, ads, or sale/sharing of data with anyone.

## Permissions

| Permission | Purpose |
|---|---|
| `sidePanel` | The extension's UI. |
| `storage` | Store captured queries, research session state, form drafts, and settings locally. |
| `tabs` | Find the ChatGPT tab to display captures for, open/navigate the tab the research session drives, and badge the icon with unread counts. |
| `alarms` | Keep the background worker alive during long research turns. |
| `notifications` | Show a desktop notification when a research session finishes. |
| host `https://chatgpt.com/*` | Inject the scripts that read ChatGPT's response stream and drive the chat UI during a session. |

## Third parties

Only OpenAI, and only because you are using ChatGPT. Your prompts and data go to ChatGPT exactly as if you typed them. See OpenAI's own privacy policy for how they handle it. Note that temporary chats opened for grounding runs follow OpenAI's temporary-chat retention rules.

## Contact

File an issue on the project's GitHub repository.
