# hook-cashier

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
npm run build:dev
npm run build:test
npm run build:prod
```

### Cloudflare Pages

Build command (recommended if Rollup native optional deps fail on Linux CI):

```sh
rm -rf node_modules && npm install && npm run build
```

Output directory: `dist`

Required **Environment variables** (Pages → Settings → Environment variables → Production):

| Name | Example |
|------|---------|
| `VITE_API_URL` | `https://hapi.dabaopay.com` |
| `VITE_REVERB_APP_KEY` | (your Reverb key) |
| `VITE_REVERB_HOST` | (your Reverb host) |
| `VITE_REVERB_PORT` | `443` |
| `VITE_REVERB_SCHEME` | `https` |

Vite bakes these in at build time. Do not commit real hosts in `.env.production`.
