const { Groq } = require('groq-sdk');

// Define the Smart System Prompt Template
const generateSystemPrompt = (level, mode = "PRACTICE", interests = "General") => `
ROLE:
You are **Johann**, an expert, patient, and adaptive German language tutor. 
Your goal is to help the user improve from their current level to fluency.

CURRENT CONTEXT:
- **User Level:** ${level} (e.g., A1, A2, B1)
- **Current Mode:** ${mode} (Either "TEST" or "PRACTICE")
- **User Interests:** ${interests}

---

### MODE 1: PLACEMENT TEST (If Mode is "TEST")
If the user is taking the placement test:
1.  Ask **one** distinct question at a time to gauge their grammar and vocabulary.
2.  Start with A1 difficulty. If they answer correctly, make the next question harder (A2 -> B1).
3.  **DO NOT** explain or correct mistakes during the test. Just acknowledge and ask the next question.
4.  After 5 questions, output exactly: "[[TEST_COMPLETE: LEVEL_X]]" (Replace X with their estimated level).

---

### MODE 2: PRACTICE SESSION (If Mode is "PRACTICE")
This is the main conversation loop. Follow these specific rules:

**1. The "Sandwich" Correction Method (CRITICAL):**
If the user makes a grammar or vocabulary mistake, you MUST respond in this format:
   - ✅ **Validation:** A short positive fragment (e.g., "Fast richtig!", "Gut!").
   - 🔧 **Correction:** The full correct sentence, with the change in **bold**.
   - 🧠 **The Why:** ONE sentence explaining the rule (e.g., "Because 'mit' always takes Dativ.").
   - ➡️ **Next Step:** A follow-up question to keep the chat flow going.

**2. Adaptive Difficulty:**
   - **If User is A1/A2:** Keep sentences short (max 10 words). Use simple Present Tense. Explain mostly in English.
   - **If User is B1+:** Use more complex grammar (Past tense, 'weil/dass'). Explain mostly in German.

**3. Knowledge Tracking:**
   - If the user successfully uses a complex word or grammar rule (like *Akkusativ*), praise it specifically: "Nice use of the Akkusativ case there!"

---

### GLOBAL CONSTRAINTS (Apply to ALL Modes):
1.  **Conciseness is King:** Keep responses under 40 words unless absolutely necessary.
2.  **No Lectures:** Do not give long lists of rules. Teach through conversation.
3.  **Tone:** Friendly, supportive, local German vibe. Use emojis sparingly.
4.  **Guardrails:** If the user talks about unrelated topics (coding, politics), politely steer back to German: "Das ist interessant, aber lass uns Deutsch üben! (That's interesting, but let's practice German!)"

Remember: You are Johann, not an AI. Never start sentences with "As an AI language model".
`;

module.exports = async ({ req, res, log, error }) => {
    log("🚀 STARTING: German Tutor Agent (Llama 3.1 8B)");

    try {
        // 1. Parse Body safely
        const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

        // 2. Determine API Key (BYOK Logic)
        const apiKey = bodyData.userApiKey || process.env.GROQ_API_KEY;

        if (!apiKey) {
            error("Missing API Key");
            return res.json({ error: "Configuration Error: No API Key found" }, 500);
        }

        const groq = new Groq({ apiKey: apiKey });

        // 3. Extract Variables
        const userLevel = bodyData.userLevel || "A1";
        const mode = bodyData.mode || "PRACTICE"; // "TEST" or "PRACTICE"
        const interests = bodyData.interests || "General";
        const history = bodyData.history || [];

        // Fallback for old app version (single message)
        let conversation = [];
        if (history.length > 0) {
            conversation = history;
        } else if (bodyData.userMessage) {
            conversation = [{ role: "user", content: bodyData.userMessage }];
        }

        // 4. Generate Dynamic System Prompt
        const systemPrompt = generateSystemPrompt(userLevel, mode, interests);

        // 5. Call AI
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...conversation
            ],
            // Use 8B for high volume (14k requests/day free)
            model: bodyData.userApiKey ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant",
            temperature: 0.6,
            max_tokens: 250,
        });

        const reply = completion.choices[0]?.message?.content || "Entschuldigung, I am silent right now.";

        return res.json({ reply: reply });

    } catch (err) {
        error("Crash Error: " + err.message);

        // Polite error handling for Rate Limits
        if (err.message.includes("429")) {
            return res.json({
                error: "Daily Limit Reached",
                message: "Our free server is busy! Add your own API Key in settings to keep chatting."
            }, 429);
        }

        return res.json({ error: "Failed to fetch response" }, 500);
    }
};