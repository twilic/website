# Twilic Website

Source for the [Twilic](https://github.com/twilic) documentation website, built with [VitePress](https://vitepress.dev).

## Requirements

- Node.js 24+
- pnpm 10.33+

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Opens a local dev server at `http://localhost:5173` with hot reload.

## Build

```bash
pnpm build
```

Outputs to `docs/.vitepress/dist/`.

## Preview

```bash
pnpm preview
```

Serves the production build locally for final review before deploy.

## Formatting and lint

```bash
pnpm format          # format all .md, .ts, .css, .json files
pnpm format:check    # check formatting without writing (used in CI)
pnpm lint            # markdownlint on docs/**/*.md
```

## Project layout

```text
website/
  docs/
    .vitepress/
      config.ts          # VitePress config (nav, sidebar, Mermaid)
      theme/
        index.ts          # theme entry (slots, global components)
        custom.css        # brand colors, CSS variable overrides
        HomeFeatures.vue  # home page feature cards (Lucide icons)
        HeroCode.vue      # hero code preview card
    guide/
      introduction.md
      why.md
      quick-start.md
      concepts.md
      cookbook.md
      comparison.md
      faq.md
    spec/
      overview.md
      profiles.md
      wire-tags.md
      format.md
      encoding.md
      transport.md
      v2.md
      v1.md
    sdks/
      index.md
      rust.md
      go.md
      python.md
      js.md
      java.md
      ruby.md
      zig.md
      php.md
      kotlin.md
      dart.md
      elixir.md
      cpp.md
      csharp.md
      swift.md
    benchmark.md
    public/
      favicon.svg
      wordmark.svg
  .github/
    ISSUE_TEMPLATE/      # bug report, feature request
    workflows/           # CI, commitlint, PR checks, invisible-chars
    pull_request_template.md
    dependabot.yml
```

## Contributing

See [CONTRIBUTING.md](https://github.com/twilic/twilic/blob/main/CONTRIBUTING.md) for general contribution guidelines.

For website-specific changes:

1. Run `pnpm dev` and verify the affected pages look correct.
2. Run `pnpm format:check` and `pnpm lint` before opening a PR.
3. Use the PR template — all required sections and checklist items must be filled.

## License

Content is released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).
