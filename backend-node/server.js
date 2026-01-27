import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increased limit for large text
app.use(express.static("public"));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/* ---------------- VECTOR MEMORY ---------------- */

let vectors = [];

function cosineSimilarity(a, b) {
    return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

async function storeText(text) {
    vectors = [];

    // Split text into chunks to handle token limits and improve retrieval
    const chunks = text.match(/(.|[\r\n]){1,800}/g) || [];

    console.log(`Processing ${chunks.length} chunks...`);

    for (const chunk of chunks) {
        try {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk
            });

            vectors.push({
                text: chunk,
                embedding: embedding.data[0].embedding
            });
        } catch (err) {
            console.error("Error creating embedding for chunk:", err);
        }
    }
    console.log("Storage complete.");
}

async function getContext(question) {
    try {
        const qEmbedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: question
        });

        return vectors
            .map(v => ({
                text: v.text,
                score: cosineSimilarity(v.embedding, qEmbedding.data[0].embedding)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(v => v.text)
            .join("\n");
    } catch (err) {
        console.error("Error fetching context:", err);
        return "";
    }
}

/* ---------------- API ROUTES ---------------- */

app.post("/upload-text", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        await storeText(text);
        res.json({ status: "Text stored in AI memory" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ error: "No question provided" });

        const context = await getContext(question);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Or gpt-3.5-turbo if 4o-mini is not available to the key
            messages: [
                {
                    role: "system",
                    content:
                        "You are an intelligent assistant. Answer ONLY using the provided context. If the answer is not present, say: I cannot find this information in the provided text."
                },
                {
                    role: "user",
                    content: `Context:\n${context}\n\nQuestion:\n${question}`
                }
            ]
        });

        res.json({
            answer: completion.choices[0].message.content
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error processing request" });
    }
});

app.listen(3000, () =>
    console.log("🚀 AI running at http://localhost:3000")
);
