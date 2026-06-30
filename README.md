# PaperVault

Experimental local-first web app for storing digital data on printable monochrome pages.

## Development

```bash
npm install
npm run dev
npm run build
```

Cloudflare Pages settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Current alpha

- A4 page generation
- Multiple-page splitting
- CRC32 page checks
- Simple repetition coding
- Image-based recovery
- Lawson print-density calibration sheet

## Planned

- Perspective correction
- Reed-Solomon error correction
- Fountain codes
- PDF generation
- SHA-256 verification

## License

Apache License 2.0
