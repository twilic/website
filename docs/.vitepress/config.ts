import { defineConfig, type PageData } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import llmstxt from "vitepress-plugin-llms";
import { minify } from "html-minifier-terser";

const SITE_TITLE = "Twilic";
const SITE_ORIGIN = "https://twilic.dev";
const DEFAULT_TITLE_TEMPLATE = ":title — Twilic";

function resolvePageTitle(pageData: PageData): string {
  const { frontmatter, title } = pageData;

  if (frontmatter.titleTemplate === false) {
    return String(frontmatter.title ?? title ?? SITE_TITLE);
  }

  const pageTitle = frontmatter.title ?? title;
  if (!pageTitle) {
    return SITE_TITLE;
  }

  const template = frontmatter.titleTemplate ?? DEFAULT_TITLE_TEMPLATE;
  if (typeof template === "string") {
    return template.replace(":title", pageTitle);
  }

  return `${pageTitle} — ${SITE_TITLE}`;
}

function resolvePageDescription(
  pageData: PageData,
  siteDescription: string,
): string {
  return String(pageData.frontmatter.description ?? siteDescription);
}

function socialMetaHead(
  pageData: PageData,
  siteDescription: string,
): [string, Record<string, string>][] {
  const title = resolvePageTitle(pageData);
  const description = resolvePageDescription(pageData, siteDescription);

  return [
    ["meta", { property: "og:title", content: title }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { name: "twitter:title", content: title }],
    ["meta", { name: "twitter:description", content: description }],
  ];
}

export default withMermaid(
  defineConfig({
    title: SITE_TITLE,
    titleTemplate: DEFAULT_TITLE_TEMPLATE,
    description:
      "Twilic is a compact binary serialization format for structured data — smaller than MessagePack, schema-less or schema-aware, with SDKs for Rust, Go, Python, JavaScript, and more.",
    lang: "en-US",
    cleanUrls: true,

    head: [
      [
        "link",
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
          sizes: "180x180",
        },
      ],
      [
        "link",
        {
          rel: "icon",
          href: "/favicon-32.png",
          type: "image/png",
          sizes: "32x32",
        },
      ],
      ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
      ["meta", { name: "theme-color", content: "#FA5D19" }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:site_name", content: "Twilic" }],
      ["meta", { property: "og:image", content: `${SITE_ORIGIN}/og.png` }],
      ["meta", { property: "og:image:type", content: "image/png" }],
      ["meta", { property: "og:image:width", content: "1200" }],
      ["meta", { property: "og:image:height", content: "1200" }],
      ["meta", { property: "og:image:alt", content: "Twilic" }],
      ["meta", { name: "twitter:card", content: "summary" }],
      ["meta", { name: "twitter:image", content: `${SITE_ORIGIN}/og.png` }],
    ],

    transformPageData(pageData) {
      pageData.frontmatter.head ??= [];
      pageData.frontmatter.head.push(
        ...socialMetaHead(
          pageData,
          "Twilic is a compact binary serialization format for structured data — smaller than MessagePack, schema-less or schema-aware, with SDKs for Rust, Go, Python, JavaScript, and more.",
        ),
      );
    },

    themeConfig: {
      siteTitle: "Twilic",

      nav: [
        { text: "Guide", link: "/guide/introduction" },
        {
          text: "Reference",
          items: [
            { text: "API Reference", link: "/reference/" },
            { text: "Integrations", link: "/integrations/" },
            { text: "Twilic AI", link: "/ai/" },
            { text: "SDKs", link: "/sdks/" },
          ],
        },
        {
          text: "Specification",
          items: [
            { text: "Overview", link: "/spec/overview" },
            { text: "v3 (current)", link: "/spec/v3" },
            { text: "v2 (legacy)", link: "/spec/v2" },
            { text: "v1 (legacy)", link: "/spec/v1" },
          ],
        },
        {
          text: "Tools",
          items: [
            { text: "Overview", link: "/tools/" },
            { text: "CLI", link: "/guide/cli" },
            { text: "Twilic AI", link: "/ai/" },
            { text: "Playground", link: "/guide/playground" },
            { text: "Benchmark", link: "/benchmark" },
          ],
        },
      ],

      sidebar: {
        "/guide/": [
          {
            text: "Getting Started",
            items: [
              { text: "Introduction", link: "/guide/introduction" },
              { text: "Why Twilic?", link: "/guide/why" },
              { text: "Quick Start", link: "/guide/quick-start" },
              { text: "Web Integrations", link: "/guide/web-integrations" },
              { text: "Twilic AI", link: "/ai/" },
            ],
          },
          {
            text: "Business Use Cases",
            items: [
              { text: "Overview", link: "/guide/business-use-cases" },
              { text: "Articles", link: "/guide/articles/" },
            ],
          },
          {
            text: "Deep Dive",
            collapsed: true,
            items: [
              { text: "Core Concepts", link: "/guide/concepts" },
              { text: "Encoding Profiles", link: "/guide/encoding-profiles" },
              { text: "Batch & Columnar", link: "/guide/batch-and-columnar" },
              { text: "Stateful Streams", link: "/guide/stateful-streams" },
              { text: "Stateful Decoding", link: "/guide/stateful-decoding" },
              {
                text: "Trained Dictionaries",
                link: "/guide/trained-dictionaries",
              },
              { text: "Encoder Selection", link: "/guide/encoder-selection" },
              { text: "Edge & Workers", link: "/guide/edge-and-workers" },
              { text: "Schema-Bound Encoding", link: "/guide/schema-bound" },
              { text: "Transport & Framing", link: "/guide/transport-framing" },
              { text: "Performance", link: "/guide/performance" },
              { text: "Security", link: "/guide/security" },
              { text: "Interop", link: "/guide/interop" },
              { text: "Conformance", link: "/guide/conformance" },
              { text: "v1 → v2 Migration", link: "/guide/migration-v1-to-v2" },
              { text: "Cookbook", link: "/guide/cookbook" },
              { text: "Examples", link: "/guide/examples" },
              { text: "Comparison", link: "/guide/comparison" },
              { text: "Troubleshooting", link: "/guide/troubleshooting" },
              { text: "Glossary", link: "/guide/glossary" },
              { text: "FAQ", link: "/guide/faq" },
              { text: "Contributing", link: "/guide/contributing" },
            ],
          },
        ],
        "/reference/": [
          {
            text: "API Reference",
            items: [
              { text: "Overview", link: "/reference/" },
              {
                text: "JavaScript / TypeScript",
                items: [
                  { text: "@twilic/core", link: "/reference/javascript-core" },
                  {
                    text: "@twilic/core/advanced",
                    link: "/reference/javascript-advanced",
                  },
                ],
              },
              {
                text: "Shared Types",
                items: [
                  {
                    text: "Value & Schema",
                    link: "/reference/value-and-schema",
                  },
                  {
                    text: "Session Encoder",
                    link: "/reference/session-encoder",
                  },
                  {
                    text: "Errors & Limits",
                    link: "/reference/errors-and-limits",
                  },
                ],
              },
              {
                text: "Native SDKs",
                items: [
                  { text: "Rust", link: "/reference/rust" },
                  { text: "Python", link: "/reference/python" },
                  { text: "Go", link: "/reference/go" },
                  { text: "Java", link: "/reference/java" },
                  { text: "C", link: "/reference/c" },
                ],
              },
            ],
          },
        ],
        "/integrations/": [
          {
            text: "Integrations",
            items: [
              { text: "Overview", link: "/integrations/" },
              {
                text: "Server",
                items: [
                  { text: "Hono", link: "/integrations/hono" },
                  { text: "Express", link: "/integrations/express" },
                  { text: "Fastify", link: "/integrations/fastify" },
                ],
              },
              {
                text: "Client",
                items: [
                  { text: "Fetch", link: "/integrations/fetch" },
                  { text: "Axios", link: "/integrations/axios" },
                ],
              },
            ],
          },
        ],
        "/ai/": [
          {
            text: "Twilic AI",
            items: [
              { text: "Overview", link: "/ai/" },
              { text: "@twilic/ai", link: "/ai/core" },
              { text: "@twilic/ai-openai", link: "/ai/openai" },
              { text: "@twilic/ai-sdk", link: "/ai/ai-sdk" },
              { text: "@twilic/ai-agents", link: "/ai/agents" },
              { text: ".twai format", link: "/ai/format" },
              { text: "CLI ai commands", link: "/guide/cli#ai" },
            ],
          },
        ],
        "/guide/articles/": [
          {
            text: "Articles",
            items: [
              { text: "Overview", link: "/guide/articles/" },
              {
                text: "Infrastructure",
                items: [
                  {
                    text: "Cut Cache & Redis Costs",
                    link: "/guide/articles/cut-infrastructure-costs-with-safer-caching",
                  },
                  {
                    text: "Build the Business Case",
                    link: "/guide/articles/building-the-adoption-business-case",
                  },
                ],
              },
              {
                text: "Architecture",
                items: [
                  {
                    text: "Telemetry at Scale",
                    link: "/guide/articles/telemetry-and-event-pipelines-at-scale",
                  },
                  {
                    text: "Internal APIs",
                    link: "/guide/articles/internal-apis-without-protobuf-overhead",
                  },
                  {
                    text: "Real-Time Streaming",
                    link: "/guide/articles/real-time-dashboards-and-streaming",
                  },
                ],
              },
              {
                text: "Migration",
                items: [
                  {
                    text: "From MessagePack",
                    link: "/guide/articles/migrating-from-messagepack",
                  },
                  {
                    text: "From Protobuf",
                    link: "/guide/articles/migrating-from-protobuf",
                  },
                ],
              },
            ],
          },
        ],
        "/tools/": [
          {
            text: "Tools",
            items: [
              { text: "Overview", link: "/tools/" },
              { text: "Twilic CLI", link: "/guide/cli" },
              { text: "Twilic AI", link: "/ai/" },
              { text: "Playground", link: "/guide/playground" },
              { text: "Examples", link: "/guide/examples" },
              { text: "Benchmark", link: "/benchmark" },
              { text: "Benchmark Fixtures", link: "/benchmark/fixtures" },
            ],
          },
        ],
        "/benchmark/": [
          {
            text: "Benchmark",
            items: [
              { text: "Overview", link: "/benchmark" },
              { text: "Fixtures", link: "/benchmark/fixtures" },
            ],
          },
        ],
        "/spec/": [
          {
            text: "Specification",
            items: [
              { text: "Overview", link: "/spec/overview" },
              { text: "Profiles", link: "/spec/profiles" },
              { text: "Wire Tags", link: "/spec/wire-tags" },
            ],
          },
          {
            text: "Format Reference",
            items: [
              { text: "Format Guide", link: "/spec/format" },
              { text: "Encoding Guide", link: "/spec/encoding" },
              { text: "Transport Guide", link: "/spec/transport" },
            ],
          },
          {
            text: "Versions",
            items: [
              { text: "v3 Reference Profile", link: "/spec/v3" },
              { text: "v2 (Legacy)", link: "/spec/v2" },
              { text: "v1 (Legacy)", link: "/spec/v1" },
            ],
          },
        ],
        "/sdks/": [
          {
            text: "SDKs",
            items: [
              { text: "Overview", link: "/sdks/" },
              { text: "API Reference", link: "/reference/" },
              { text: "Rust", link: "/sdks/rust" },
              { text: "Go", link: "/sdks/go" },
              { text: "Python", link: "/sdks/python" },
              { text: "JavaScript / TypeScript", link: "/sdks/js" },
              { text: "Java", link: "/sdks/java" },
              { text: "Scala", link: "/sdks/scala" },
              { text: "Ruby", link: "/sdks/ruby" },
              { text: "R", link: "/sdks/r" },
              { text: "Zig", link: "/sdks/zig" },
              { text: "PHP", link: "/sdks/php" },
              { text: "Kotlin", link: "/sdks/kotlin" },
              { text: "Dart", link: "/sdks/dart" },
              { text: "Elixir", link: "/sdks/elixir" },
              { text: "Lua", link: "/sdks/lua" },
              { text: "C", link: "/sdks/c" },
              { text: "C++", link: "/sdks/cpp" },
              { text: "C#", link: "/sdks/csharp" },
              { text: "Swift", link: "/sdks/swift" },
            ],
          },
        ],
      },

      socialLinks: [{ icon: "github", link: "https://github.com/twilic" }],

      footer: {
        message: "Released under the CC-BY-4.0 License.",
        copyright: "Copyright © Twilic contributors",
      },

      search: {
        provider: "local",
      },

      editLink: {
        pattern: "https://github.com/twilic/website/edit/main/docs/:path",
        text: "Edit this page on GitHub",
      },
    },

    mermaid: {},

    vite: {
      optimizeDeps: {
        include: ["mermaid"],
      },
      plugins: [llmstxt()],
    },

    async transformHtml(code) {
      const preprocessed = code.replace(
        /<pre\b([^>]*)>([\s\S]*?)<\/pre>/g,
        (_, attrs, content) =>
          `<pre${attrs}>${content.replace(/\n/g, "<br>")}</pre>`,
      );
      return await minify(preprocessed, {
        collapseWhitespace: true,
        removeComments: false,
        minifyCSS: true,
        minifyJS: true,
      });
    },
  }),
);
