<script setup lang="ts"></script>

<template>
  <div class="hero-code">
    <pre
      class="pre"
    ><code><span class="t-kw">import</span> <span class="t-punc">{ </span><span class="t-fn">encode</span><span class="t-punc">, </span><span class="t-fn">decode</span><span class="t-punc"> }</span> <span class="t-kw">from</span> <span class="t-str">'@twilic/core'</span><br><br><span class="t-cm">// same-shape objects → keys sent once</span><br><span class="t-kw">const</span> <span class="t-text">records</span> <span class="t-punc">=</span> <span class="t-punc">[</span><br>  <span class="t-punc">{</span> id<span class="t-punc">:</span> <span class="t-num">1001n</span><span class="t-punc">,</span> name<span class="t-punc">:</span> <span class="t-str">'alice'</span><span class="t-punc">,</span> score<span class="t-punc">:</span> <span class="t-num">98.6</span> <span class="t-punc">},</span><br>  <span class="t-punc">{</span> id<span class="t-punc">:</span> <span class="t-num">1002n</span><span class="t-punc">,</span> name<span class="t-punc">:</span> <span class="t-str">'bob'</span><span class="t-punc">,</span>   score<span class="t-punc">:</span> <span class="t-num">74.1</span> <span class="t-punc">},</span><br>  <span class="t-punc">{</span> id<span class="t-punc">:</span> <span class="t-num">1003n</span><span class="t-punc">,</span> name<span class="t-punc">:</span> <span class="t-str">'carol'</span><span class="t-punc">,</span> score<span class="t-punc">:</span> <span class="t-num">88.0</span> <span class="t-punc">},</span><br><span class="t-punc">]</span><br><br><span class="t-kw">const</span> <span class="t-text">bytes</span>   <span class="t-punc">=</span> <span class="t-fn">encode</span><span class="t-punc">(</span><span class="t-text">records</span><span class="t-punc">)</span><br><span class="t-cm">// keys written once · values only per row</span><br><br><span class="t-kw">const</span> <span class="t-text">decoded</span> <span class="t-punc">=</span> <span class="t-fn">decode</span><span class="t-punc">(</span><span class="t-text">bytes</span><span class="t-punc">)</span></code></pre>
  </div>
</template>

<style scoped>
.hero-code {
  position: relative;
  width: min-content;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--vp-code-block-bg);
  user-select: none;
}

.lang {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 2;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  user-select: none;
}

.pre {
  margin: 0;
  padding: 20px 24px;
  background: transparent;
  overflow: hidden;
}

code {
  display: block;
  padding: 0;
  overflow: hidden;
  line-height: var(--vp-code-line-height);
  font-size: var(--vp-code-font-size);
  font-family: var(--vp-font-family-mono);
  color: var(--hc-text);
  white-space: pre;
  background: transparent;
}

.t-kw {
  color: var(--hc-kw);
}
.t-str {
  color: var(--hc-str);
}
.t-num {
  color: var(--hc-num);
}
.t-fn {
  color: var(--hc-fn);
}
.t-cm {
  color: var(--hc-cm);
  font-style: italic;
}
.t-text {
  color: var(--hc-text);
}
.t-punc {
  color: var(--hc-punc);
}
</style>
