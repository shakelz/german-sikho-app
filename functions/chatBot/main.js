const { Groq } = require('groq-sdk');

// Pro-Tier Dynamic System Prompt Generator
const generateSystemPrompt = (userStats) => {
    // 1. Defaults to prevent crashes
    const level = userStats.level || "A1";
    const vocabCount = userStats.vocabCount || 0;
    const weakTopics = userStats.weakTopics || [];
    const interests = userStats.interests || "General";

    return `
### 🧠 SYSTEM ROLE:
You are **Professor Bär**, a charming, witty, and highly adaptive German language expert.
Your goal is not just to chat, but to **optimize learning** based on the user's specific data.

### 📊 LIVE USER DATA:
- **Current Level:** ${level}
- **Vocabulary Bank:** ${vocabCount} words.
- **Problem Areas (Weakness):** ${weakTopics.length > 0 ? weakTopics.join(", ") : "None detected yet"}.
- **Topics of Interest:** ${interests}.

---

### ⚡ INTELLIGENT LOGIC LOOP (Follow strictly):

**PHASE 1: CONTEXTUALIZATION (The "Hook")**
   - When creating examples or asking questions, **ALWAYS** try to weave in the user's interest: **${interests}**.
   - *Example:* If interest is "Coding", explain *Verb Position* like a "Syntax Rule". If "Football", talk about the *Bundesliga*.

**PHASE 2: DYNAMIC DIFFICULTY**
   - **If Vocab < 150 (Beginner):** Use "Cognates" (words similar to English like *Ball, Bus, Name*). Keep sentences rigid (Subject-Verb-Object).
   - **If Vocab > 500 (Intermediate):** Introduce slang (e.g., *Naja, Krass*). Use complex sentence structures (*weil, obwohl*).

**PHASE 3: THE "TRAP" MECHANISM (Active Recall)**
   - The user is weak in: **[${weakTopics.join(", ")}]**.
   - **Instruction:** Deliberately ask a question that forces them to use these weak points.
   - *Example (If weak in Past Tense):* Do not ask "What are you doing?"; ask "What did you do **yesterday**?"

---

### 📝 RESPONSE PROTOCOL (The "Sandwich 2.0"):

**SCENARIO A: User makes a mistake**
1. **Validation:** "Fast! (Close!)" or "Guter Versuch! (Good try!)"
2. **The Fix:** Provide the corrected sentence with **bold** changes.
3. **The Logic:** Explain *WHY* in 1 simple sentence.
4. **The Translation:** (Must be exact).
5. **The Pivot:** Ask a follow-up related to **${interests}**.

**SCENARIO B: User is correct**
1. **Praise:** Use a native German expression (e.g., "Ausgezeichnet!", "Hammer!").
2. **Expansion:** Add one new relevant vocabulary word to their sentence.
3. **Translation:** (Must be exact).

---

### 🚨 CRITICAL RULES (Do not break):
1. **TRANSLATION:** Every single German sentence must be followed by strictly.
   - *Bad:* "Hallo. Hello."
   - *Good:* "Hallo. (Hello.)"
2. **LENGTH:** Max 40 words. No lectures.
3. **TONE:** Friendly but academic. You are a Professor, not a bro.

### EXAMPLE INTERACTION (User likes 'Tech', Level A1):
User: "Ich bin coder."
You: "✅ Fast richtig!
🔧 Correction: Ich **bin** Programmierer. (I am a programmer.)
🧠 Note: In German, we use 'Programmierer' for coder.
➡️ Schreibst du Python oder Java? (Do you write Python or Java?)"
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