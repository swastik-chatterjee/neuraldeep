// server/api/generate.post.ts
export default defineEventHandler(async (event) => {
  const { topic } = await readBody(event);
  const config = useRuntimeConfig();

  // 1. Research phase (using standard fetch)
  const tavily = await $fetch("https://api.tavily.com/search", {
    method: "POST",
    body: { api_key: config.tavilyApiKey, query: topic, max_results: 5 },
  });

  // 2. Streamed generation
  event.node.res.setHeader("Content-Type", "text/event-stream");
  event.node.res.setHeader("Cache-Control", "no-cache");
  event.node.res.setHeader("Connection", "keep-alive");

  const stream = await $fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: {
        model: "llama-3.1-8b-instant",
        stream: true,
        messages: [
          {
            role: "user",
            content: `Write a deep-dive on: ${topic}. Sources: ${JSON.stringify(tavily.results)}`,
          },
        ],
      },
      responseType: "stream",
    },
  );

  // Pipe the stream to the response
  (stream as any).pipe(event.node.res);
});
