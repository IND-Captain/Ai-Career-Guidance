import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

// Serve current directory
app.use(express.static(__dirname));

// Serve main.html at root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

// Initialize OpenRouter API client
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
});

app.post("/chat", async (req, res) => {
  try {
    const { history = [], language } = req.body;

    // --- OpenRouter API Call Logic ---
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Provide a comprehensive and detailed answer. Your final response must be in ${language || 'English'}. If the user speaks in Telugu or another language, please reply in that language.`
        },
        ...history
      ],
      max_tokens: 1500,
    });

    const responseText = completion.choices[0].message.content?.trim();

    res.json({
      action: "answer",
      text: responseText
    });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: "Failed to connect to AI provider.", details: error.message });
  }
});

app.listen(5050, () => {
  console.log("✅ Server running on port 5050");
  console.log(`http://localhost:5050/`);
});