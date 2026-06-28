# Online Solitaire — Single-Player TCG Playtester

A browser-based **single-player playtester for image-based trading card games**. Upload your own
card images, build a deck, and play it out solo on a virtual board to test how the deck flows — draw
hands, set shields, build mana, tap and untap, and shuffle, all on your own.

There is no opponent, no networking, and no rules enforcement: it simply moves cards wherever you
drag them, so it works as a freeform tabletop for any card game you supply images for.

> This tool ships with **no card images or game data**. You provide your own images, and the app
> only renders them locally in your browser.

## Features

- **Deck builder** — add card images from your device and choose 1–4 copies of each.
- **Play board** with the usual zones: hand, mana, shield, battle, trash (graveyard), deck, and a
  deck-top preview, plus stacking cards into overlapping groups.
- **Card actions** — drag between zones, tap/untap, flip face-down, shuffle, draw, set shields, and
  send cards to the top/bottom of the deck.
- **Keyboard shortcuts** while playing:
  | Key | Action |
  | --- | --- |
  | `Space` | Flip selected card(s) face-down/up |
  | `Esc` | Deselect all |
  | `M` | Toggle magnify (zoom) mode |
  | `O` | Stack selected cards into a group |
  | `R` | Untap all cards |
  | `T` | Tap selected card(s) |

Everything runs client-side; your images never leave your machine.

## Tech stack

- [React 18](https://react.dev/) bootstrapped with [Create React App](https://create-react-app.dev/)
- [React Router](https://reactrouter.com/) for the deckbuilder / play routes
- [SortableJS](https://sortablejs.github.io/Sortable/) for drag-and-drop within zones

## Getting started

Requires [Node.js](https://nodejs.org/) 18+.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:3000)
npm start
```

Open the app, add card images on the builder page, set the copies of each card, then confirm the
deck to move to the play board.

## Available scripts

| Command | What it does |
| --- | --- |
| `npm start` | Run the dev server with hot reload at http://localhost:3000 |
| `npm test` | Run the test suite in watch mode |
| `npm run build` | Produce an optimized production build in `build/` |
| `npm run format` | Auto-format the source with Prettier |
| `npm run format:check` | Check formatting without writing changes |
| `npm run verify` | Full gate: format check → tests → build (run this before committing) |

## Project layout

```
src/
  App.js              # Routes: "/" deck builder, "/play" board
  pages/
    Deckbuild.js      # Upload images and assemble a deck
    Play.js           # The play board and all card interactions
```

See [CLAUDE.md](CLAUDE.md) for development conventions and [PROMPT.md](PROMPT.md) for the current
improvement backlog.

## Disclaimer

This is an unofficial, fan-made utility. It is not affiliated with, endorsed by, or sponsored by any
card game publisher. It includes no copyrighted card images or game content — all card artwork is
supplied by the user and used locally.
