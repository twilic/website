import { defineConfig, type PageData } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import llmstxt from "vitepress-plugin-llms";
import { minify } from "html-minifier-terser";

const SITE_TITLE = "Twilic";
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
      ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
      ["meta", { name: "theme-color", content: "#36A9F8" }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:site_name", content: "Twilic" }],
      ["meta", { name: "twitter:card", content: "summary" }],
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
        { text: "Specification", link: "/spec/overview" },
        { text: "SDKs", link: "/sdks/" },
        { text: "Tools", link: "/tools/" },
        { text: "Benchmark", link: "/benchmark" },
        {
          text: "v2",
          items: [
            { text: "v2 (current)", link: "/spec/overview" },
            { text: "v1 (legacy)", link: "/spec/v1" },
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
            items: [
              { text: "Core Concepts", link: "/guide/concepts" },
              { text: "Cookbook", link: "/guide/cookbook" },
              { text: "Examples", link: "/guide/examples" },
              { text: "Comparison", link: "/guide/comparison" },
              { text: "FAQ", link: "/guide/faq" },
              { text: "Contributing", link: "/guide/contributing" },
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
              { text: "Examples", link: "/guide/examples" },
              { text: "Twilic CLI", link: "/guide/cli" },
              { text: "Playground", link: "/guide/playground" },
              { text: "Benchmark", link: "/benchmark" },
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
              { text: "v2 Reference Profile", link: "/spec/v2" },
              { text: "v1 (Legacy)", link: "/spec/v1" },
            ],
          },
        ],
        "/sdks/": [
          {
            text: "SDKs",
            items: [
              { text: "Overview", link: "/sdks/" },
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
