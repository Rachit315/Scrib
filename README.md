<p align="center">
  <img src="docs/logo.svg" width="88" height="88" alt="Scrib logo">
</p>

<h1 align="center">Scrib</h1>

<p align="center">
  <b>Scribble a screen. Get real UI.</b><br>
  Draw boxes and squiggles. Scrib turns each one into a real component, and your whole team can draw at once.
</p>

<p align="center">
  <a href="https://github.com/Rachit315/Scrib/stargazers"><img src="https://img.shields.io/github/stars/Rachit315/Scrib?style=flat&logo=github&label=Star&color=1F1C17" alt="GitHub stars"></a>
  <img src="https://img.shields.io/badge/dependencies-0-1F1C17" alt="Zero dependencies">
  <img src="https://img.shields.io/badge/live-up%20to%2010%20people-E60024" alt="Live with up to 10 people">
</p>

<p align="center">
  <a href="#run-it">Run it</a> ·
  <a href="#deploy">Deploy</a> ·
  <a href="#draw-together">Live mode</a>
</p>

![Scrib: sketch a screen, get real UI](docs/banner.png)

## How it works

1. **Scribble.** A tall outline, a pill with writing, a box with an X.
2. **Tap the tag.** Scrib works out what you meant and shows it from every kit.
3. **Pick one.** It lands on the canvas as a real, editable component inside a real device frame.

![Scrib suggesting media components from seven UI kits for a sketched rectangle](docs/suggest.png)

| You draw | You get |
| --- | --- |
| Tall outline | iPhone, Pixel or custom frame |
| Box with writing | Button |
| Thin empty box | Text field |
| Box with an X | Image |
| Circle | Avatar |

**Seven kits:** iOS 27 · Material 3 · Simple Design System · Uber Base · Zoom · Claude · shadcn/ui

## Draw together

Press **Live** and share the link. Up to **10 people** in one room:

- Named cursors that become a pencil when someone is drawing, or a hand when they pan
- Ink that appears stroke by stroke as it's drawn
- Every move, resize and delete syncs instantly
- Undo only touches your own work

![Three people in a Scrib live session, with Maya's cursor drawing and Leo's pointing](docs/live.png)

## Light or dark

Follows your system, or pick one from the panel. Press <kbd>Shift</kbd> <kbd>D</kbd> to flip.

![Scrib in dark mode, suggesting components for a sketch](docs/dark.png)

## Also in the box

Figma-style frames (nesting, clip content) · snapping and alignment · Present mode · copy and paste with Figma · React and HTML export · autosave

## Run it

```bash
git clone https://github.com/Rachit315/Scrib.git
cd Scrib
npm start        # http://localhost:3000
```

No dependencies and no build step: just Node 18 or later.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Rachit315/Scrib)

`vercel.json` serves `public/` as a static site. Live sessions run on [Supabase Realtime](https://supabase.com/docs/guides/realtime) (broadcast and presence; no tables needed). The project URL and publishable key live in [`public/live-config.js`](public/live-config.js). Leave them empty and `npm start` relays sessions itself through `server.js`.

## Under the hood

| File | What it does |
| --- | --- |
| `public/app.js` | Canvas, sketch recognizer, components, live sync (vanilla JS) |
| `public/kits.css` | The seven UI kits |
| `server.js` | Zero-dependency static server and live relay |

<p align="center">
  <sub>Made with a pencil. Finished with real components.<br>
  If Scrib saved you a sketch or two, <a href="https://github.com/Rachit315/Scrib">give it a ★</a>.</sub>
</p>
