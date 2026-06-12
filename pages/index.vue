<template>
    <div class="app-wrapper">
        <main class="content-container">
            <header class="header">
                <h1>NeuralDeep</h1>
                <p>Intelligence-driven research synthesis</p>
            </header>

            <section class="glass-card search-box">
                <form @submit.prevent="runJob" class="form-container">
                    <input
                        v-model="topic"
                        placeholder="What should we research today?"
                        :disabled="loading"
                        class="search-input"
                    />
                    <button
                        type="submit"
                        :disabled="loading || !topic"
                        class="glass-button"
                    >
                        {{ loading ? "Analyzing" : "Generate Insight" }}
                    </button>
                </form>
            </section>

            <div v-if="loading" class="status-pill">
                <div class="pulse"></div>
                <span>Synthesizing data from web sources...</span>
            </div>

            <transition name="fade">
                <section
                    v-if="newsletter || error"
                    class="glass-card result-output"
                >
                    <div v-if="error" class="error-msg">{{ error }}</div>
                    <div
                        v-else
                        class="markdown-body"
                        v-html="formattedOutput"
                    ></div>

                    <div v-if="sources.length > 0" class="source-footer">
                        <h4>References</h4>
                        <div class="source-grid">
                            <a
                                v-for="(s, i) in sources"
                                :key="i"
                                :href="s.url"
                                target="_blank"
                            >
                                {{ s.title }}
                            </a>
                        </div>
                    </div>
                </section>
            </transition>
        </main>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";

const topic = ref("");
const newsletter = ref("");
const sources = ref([]);
const loading = ref(false);
const error = ref(null);

const formattedOutput = computed(() => {
    if (!newsletter.value) return "";
    return newsletter.value
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
        .replace(/\n/gim, "<br>");
});

async function runJob() {
    if (!topic.value) return;

    loading.value = true;
    error.value = null;
    newsletter.value = "";

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            body: JSON.stringify({ topic: topic.value }),
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
            throw new Error("Generation failed. Please try again.");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            newsletter.value += decoder.decode(value);
        }
    } catch (err) {
        error.value = err.message;
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.app-wrapper {
    min-height: 100vh;
    background: #0b0f19;
    color: #e2e8f0;
    display: flex;
    justify-content: center;
    padding: 80px 20px;
    font-family: "Inter", sans-serif;
}

.content-container {
    width: 100%;
    max-width: 800px;
}

.header {
    text-align: center;
    margin-bottom: 40px;
}
.header h1 {
    font-size: 3rem;
    background: linear-gradient(to right, #38bdf8, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 20px;
}

.form-container {
    display: flex;
    gap: 15px;
}
.search-input {
    flex: 1;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 12px;
    color: white;
    outline: none;
}

.glass-button {
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.3);
    padding: 0 25px;
    border-radius: 12px;
    color: #38bdf8;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}
.glass-button:hover {
    background: rgba(56, 189, 248, 0.2);
    transform: translateY(-2px);
}

.status-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    color: #94a3b8;
    font-size: 0.9rem;
}
.pulse {
    width: 8px;
    height: 8px;
    background: #38bdf8;
    border-radius: 50%;
    animation: blink 1s infinite;
}

.result-output {
    line-height: 1.8;
    animation: fadeIn 0.5s ease;
}

.source-footer {
    margin-top: 40px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
}
.source-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
}
.source-grid a {
    color: #64748b;
    text-decoration: none;
    font-size: 0.85rem;
}

@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.3;
    }
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
