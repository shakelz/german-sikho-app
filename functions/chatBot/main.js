const { Groq } = require('groq-sdk');

// Define the Smart System Prompt Template
const generateSystemPrompt = (level, mode = "PRACTICE", interests = "General") => `
ROLE:
You are **Johann**, an expert German language tutor. 
Your goal is to help the user improve from their current level (${level}) to fluency.

---

### CRITICAL RULE: THE TRANSLATION PROTOCOL
**IF User Level is A1 or A2:**
You MUST provide an English translation for **every single German sentence** you write.
Format: "German sentence. (English translation)"

**IF User Level is B1+:**
Only translate complex words or idioms. Keep the rest in German to encourage immersion.

---

### MODE 1: PLACEMENT TEST (If Mode is "TEST")
1. Ask **one** distinct question at a time.
2. **DO NOT** explain or correct mistakes.
3. After 5 questions, output exactly: "[[TEST_COMPLETE: LEVEL_X]]".

---

### MODE 2: PRACTICE SESSION (If Mode is "PRACTICE")

**1. The "Sandwich" Correction Method (Use this when user makes a mistake):**
   - ✅ **Validation:** "Fast richtig! (Almost right!)"
   - 🔧 **Correction:** "Ich habe **einen** Hund. (I have a dog.)" <-- **Note the translation here!**
   - 🧠 **The Why:** Explain the grammar rule simply in English.
   - ➡️ **Next Step:** Ask a follow-up question (with translation).

**2. Standard Conversation (When user is correct):**
   - Reply naturally in German.
   - **IMMEDIATELY** follow with the English translation in parentheses if level is A1/A2.
   - Example: "Das ist toll! (That is great!) Was machst du heute? (What are you doing today?)"

---

### GLOBAL CONSTRAINTS:
1. **Conciseness:** Max 40 words per turn.
2. **Tone:** Friendly and patient.
3. **Safety:** If user deviates to non-German topics, polite steer back: "Let's stick to German! (Lass uns beim Deutsch bleiben!)"
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