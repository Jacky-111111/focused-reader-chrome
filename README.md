# Focused Reader

A Chrome extension that applies **Bionic-style reading** to web pages—bolding the first portion of each word to create fixation points and help readers (especially those with ADHD) focus and read faster.

## Features

- **Bionic reading mode**: Bold the first ~50% of each word to guide the eye
- **One-click toggle**: Enable or disable via the extension popup
- **Instant effect**: No page reload required
- **Reversible**: Restore original text when turned off
- **State persistence**: Remembers your preference across sessions
- **Minimal permissions**: Uses `activeTab` + `scripting` only—no broad site access

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `focused-reader-chrome` folder

## Usage

1. Navigate to any webpage
2. Click the Focused Reader icon in the toolbar
3. Toggle **Bionic reading** on or off
4. The page updates immediately—no refresh needed

> **Note**: The extension cannot run on restricted pages (e.g. `chrome://`, `edge://`, Chrome Web Store).

## How It Works

- Uses the formula `Math.ceil(wordLength × 0.5)` to determine how many letters to bold per word
- Skips short words (1 character) and non-text elements (`script`, `style`, `code`, etc.)
- Stores your preference in `chrome.storage.local`

## Tech Stack

- Manifest V3
- Vanilla JavaScript (no external dependencies)
- `chrome.scripting` API for on-demand injection

## License

MIT
