<script setup lang="ts">
import { Layers, Package, Zap, Table2, History, Code2 } from "@lucide/vue";

const features = [
  {
    icon: Layers,
    title: "Woven from repetition",
    details:
      "Named after Old English <em>twilic</em> — the root of <em>twill</em>. Repeated keys, shapes, and strings are woven together, not sent again and again.",
  },
  {
    icon: Package,
    title: "Schema-less or schema-aware",
    details:
      "Dynamic profile works like MessagePack with no schema required. Bound profile uses a shared schema to eliminate field names and type tags entirely.",
  },
  {
    icon: Zap,
    title: "Deferred optimization",
    details:
      "First transmission may be self-describing. Compact forms activate automatically as repetition is observed — no manual tuning needed.",
  },
  {
    icon: Table2,
    title: "Batch & columnar encoding",
    details:
      "Row-wise and columnar batch profiles with per-column codecs — delta, FOR, RLE, XOR float, dictionary — for decisive wins on tabular data.",
  },
  {
    icon: History,
    title: "Stateful session compression",
    details:
      "Optional stateful mode supports base snapshots, state patches, template batches, and trained dictionaries over long-lived streams.",
  },
  {
    icon: Code2,
    title: "Eighteen language SDKs",
    details:
      "Official implementations in Rust, Go, Python, JavaScript/TypeScript, Java, Scala, Ruby, R, Zig, PHP, Kotlin, Dart, Elixir, Lua, C, C++, C#, and Swift.",
  },
];
</script>

<template>
  <div class="VPFeatures">
    <div class="container">
      <div class="items">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="item grid-6"
        >
          <article class="VPFeature">
            <div class="box">
              <div class="icon">
                <component :is="feature.icon" :size="24" :stroke-width="1.75" />
              </div>
              <h2 class="title" v-html="feature.title" />
              <p class="details" v-html="feature.details" />
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.VPFeatures {
  position: relative;
  padding: 0 24px 96px;
}

@media (min-width: 640px) {
  .VPFeatures {
    padding: 0 48px 96px;
  }
}

@media (min-width: 960px) {
  .VPFeatures {
    padding: 0 64px 96px;
  }
}

.container {
  margin: 0 auto;
  max-width: 1152px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
}

.item {
  padding: 8px;
  width: 100%;
}

@media (min-width: 640px) {
  .item.grid-6 {
    width: calc(100% / 2);
  }
}

@media (min-width: 960px) {
  .item.grid-6 {
    width: calc(100% / 3);
  }
}

.VPFeature {
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  transition:
    border-color 0.25s,
    background-color 0.25s;
}

.box {
  display: flex;
  flex-direction: column;
  padding: 24px;
  height: 100%;
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 6px;
  background-color: var(--vp-c-default-soft);
  width: 48px;
  height: 48px;
  font-size: 24px;
  transition: background-color 0.25s;
}

.title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
  border-top: none;
  margin: 0;
  padding: 0;
  letter-spacing: normal;
}

.details {
  flex-grow: 1;
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  margin: 0;
}
</style>
