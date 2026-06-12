export default defineNuxtConfig({
  runtimeConfig: {
    // These keys are only available server-side
    tavilyApiKey: process.env.TAVILY_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY
  }
})
