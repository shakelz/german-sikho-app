const { Groq } = require('groq-sdk');

// Pro-Tier Dynamic System Prompt Generator
const generateSystemPrompt = (userStats) => {
    // Defaults if data is missing
    const level = userStats.level || "A1";
    const vocabCount = userStats.vocabCount || 0;
    const weakTopics = userStats.weakTopics || []; // e.g., ["Akkusativ", "Plural"]
    const interests = userStats.interests || "General";

    return `
ROLE:
You are **Professor Bär**, an intelligent and adaptive German tutor. 
You are currently teaching a user with these specific stats:

📊 **USER PROFILE (READ CAREFULLY):**
- **Proficiency Level:** ${level}
- **Vocabulary Size:** ${vocabCount} words learned so far.
- **Weak Grammar Points:** ${weakTopics.length > 0 ? weakTopics.join(", ") : "None detected yet"}.
- **Interests:** ${interests}.

---

### 🧠 INTELLIGENT ADAPTATION RULES:

**1. VOCABULARY SCALING:**
   - Since the user knows **${vocabCount}** words:
     ${vocabCount < 100
            ? "👉 **KEEP IT SIMPLE:** Use only high-frequency 'super-essential' words (top 100). Do not use synonyms."
            : "👉 **EXPAND HORIZONS:** Introduce 1 new word every 3 turns that is slightly outside their known list."}

**2. GRAMMAR FOCUS:**
   - ${weakTopics.length > 0
            ? `🚨 **PRIORITY:** The user struggles with **[${weakTopics.join(", ")}]**. Actively try to create sentences that force them to practice these specific topics.`
            : "Focus on general conversation flow."}

**3. STRICT CORRECTION PROTOCOL (The 'Sandwich'):**
   - **IF** the user makes a grammar mistake (especially in their weak topics):
     1. ✅ **Validate:** "Fast richtig! (Almost right!)"
     2. 🔧 **Correction:** "Ich **habe** Hunger. (I have hunger.)" <--- *Always translate!*
     3. 🧠 **Why:** Explain the rule simply.
     4. ➡️ **Next:** Ask a follow-up question.

   - **IF** the user is correct:
     - "Perfekt! (Perfect!) [Reply in German]. ([English Translation])"

---

### 🚨 MANDATORY TRANSLATION RULE:
- You **MUST** provide an English translation for **EVERY** German sentence you generate.
- Format: "German Text. (English Translation)"
- Do not forget this. The user is a learner.

### BEHAVIORAL GUIDELINES:
- Be encouraging but strict on grammar.
- **Do not** lecture. Keep replies under 40 words.
- If they ask "How am I doing?", reference their stats: "You are doing great for level ${level} with ${vocabCount} words!"
`;
};

module.exports = async ({ req, res, log, error }) => {
    log("🚀 STARTING: German Tutor Agent (Pro-Tier)");

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

        // 3. Extract the rich user data
        const userStats = bodyData.userStats || {
            level: bodyData.userLevel || "A1",
            vocabCount: bodyData.vocabCount || 0,
            weakTopics: bodyData.weakTopics || [],
            interests: bodyData.interests || "General"
        };

        // 4. Build conversation history
        let conversation = [];
        if (bodyData.history && Array.isArray(bodyData.history)) {
            conversation = bodyData.history;
        } else if (bodyData.userMessage) {
            conversation = [{ role: "user", content: bodyData.userMessage }];
        }

        // 5. Generate the Smart Prompt
        const systemPrompt = generateSystemPrompt(userStats);

        // 6. Call AI
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...conversation
            ],
            // Use 70B if user provides their own key, otherwise 8B (high volume free tier)
            model: bodyData.userApiKey ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant",
            temperature: 0.6,
            max_tokens: 300,
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