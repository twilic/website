import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import llmstxt from "vitepress-plugin-llms";
import { minify } from "html-minifier-terser";

export default withMermaid(
  defineConfig({
    title: "Twilic",
    titleTemplate: ":title | Twilic",
    description:
      "Twilic is a compact binary serialization format for structured data — smaller than MessagePack, schema-less or schema-aware, with SDKs for Rust, Go, Python, JavaScript, and more.",
    lang: "en-US",
    cleanUrls: true,

    head: [
      ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
      ["meta", { name: "theme-color", content: "#36A9F8" }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:site_name", content: "Twilic" }],
      [
        "meta",
        {
          property: "og:title",
          content: "Twilic — Compact Binary Format for Structured Data",
        },
      ],
      [
        "meta",
        {
          property: "og:description",
          content:
            "MessagePack-like usability with decisively smaller payloads on repeated structure, keys, strings, and homogeneous arrays.",
        },
      ],
      ["meta", { name: "twitter:card", content: "summary" }],
      [
        "meta",
        {
          name: "twitter:title",
          content: "Twilic — Compact Binary Format for Structured Data",
        },
      ],
      [
        "meta",
        {
          name: "twitter:description",
          content:
            "MessagePack-like usability with decisively smaller payloads on repeated structure, keys, strings, and homogeneous arrays.",
        },
      ],
    ],

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
            text: "Deep Dive",
            items: [
              { text: "Core Concepts", link: "/guide/concepts" },
              { text: "Cookbook", link: "/guide/cookbook" },
              { text: "Comparison", link: "/guide/comparison" },
              { text: "FAQ", link: "/guide/faq" },
              { text: "Contributing", link: "/guide/contributing" },
            ],
          },
        ],
        "/tools/": [
          {
            text: "Tools",
            items: [
              { text: "Overview", link: "/tools/" },
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
