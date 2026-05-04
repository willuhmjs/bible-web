# Bible

A self-hosted Bible reader with modern styling inspired by bible.com. Built with SvelteKit.

All translations are stored locally on the server — no external API calls at runtime. Users can choose which translations to download from 35+ available options across 10 languages.

## Features

- Clean, distraction-free reading experience with serif typography
- 35+ Bible translations (public domain / freely licensed)
- Full-text search across any installed translation
- Verse selection and copy with formatted output
- Parallel translation comparison (side-by-side)
- Reader settings — font size, font family, line spacing
- Book/chapter picker with Old/New Testament tabs
- Keyboard navigation (arrow keys for chapters, Escape to close)
- Dark mode
- Responsive design (mobile + desktop)
- Translations grouped by language (English, French, German, Spanish, etc.)

## Quick Start

```bash
docker run -d \
  -p 3000:3000 \
  -v bible-data:/app/data \
  ghcr.io/willuhmjs/bible-web:latest
```

Open [http://localhost:3000](http://localhost:3000), go to **Translations**, and download at least one translation to start reading.

## Docker Compose

```yaml
services:
  bible:
    image: ghcr.io/willuhmjs/bible-web:latest
    ports:
      - "3000:3000"
    volumes:
      - bible-data:/app/data
    restart: unless-stopped

volumes:
  bible-data:
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `NODE_ENV` | `production` | Node environment |

## Development

```bash
git clone https://github.com/willuhmjs/bible-web.git
cd bible-web
pnpm install
pnpm dev
```

Or with Docker:

```bash
docker compose up
```

## Tech Stack

- [SvelteKit 5](https://svelte.dev) with Svelte 5 runes
- [Node.js](https://nodejs.org) with adapter-node
- Plain CSS with custom properties
- TypeScript

## Data Sources

Bible translation data is bundled in the `bibles/` directory of this repository and downloaded by users on-demand from GitHub. All included translations are public domain or freely licensed.

## License

MIT
