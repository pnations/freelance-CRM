# Contributing

Thanks for your interest in contributing! This project aims to be a simple, production-ready dashboard built with React, Vite, and Supabase.

## Getting Started

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Start the dev server: `npm run dev`.

## Development Guidelines

- Keep changes focused and modular; avoid large, unrelated PRs.
- Follow existing code style and file structure.
- Prefer descriptive names over abbreviations.
- Write small, clear commits with meaningful messages (e.g., `feat: add payment filter by method`).

## Testing & Build

- Ensure the app runs locally: `npm run dev`.
- Verify production build succeeds: `npm run build`.
- Avoid introducing secrets; `.env` must never be committed.

## Pull Requests

- Include a clear description of the change and screenshots when UI changes are involved.
- Reference any related issues.
- Ensure CI passes (if enabled) and address review feedback promptly.

## Reporting Issues

- Use a clear title and steps to reproduce.
- Include environment details (OS, browser, Node version).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
