const { Groq } = require('groq-sdk');

// This code runs on the Appwrite Server, not the phone
module.exports = async ({ req, res, log, error }) => {
    // Log incoming request for debugging
    log('Received request: ' + JSON.stringify(req.body));

    // 1. Initialize Groq with the hidden API Key
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    try {
        // 2. Parse the User's Message from the app
        if (!req.body) {
            return res.json({ error: "No message provided" });
        }

        // Handle both JSON string (standard) and object (SDK helper)
        let payload;
        try {
            payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        } catch (parseError) {
            log('Parse error: ' + parseError.message);
            return res.json({ error: "Invalid JSON payload" });
        }

        const { userMessage } = payload;

        if (!userMessage) {
            return res.json({ error: "No userMessage field in payload" });
        }

        log('User message: ' + userMessage);

        // 3. Define the "Teacher Persona"
        const systemPrompt = `
You are 'GermanSikho Bot', a friendly and helpful German language tutor.
- Your goal is to help the user learn German grammar and vocabulary.
- Correct their mistakes gently.
- If they ask in Hindi/English, explain in that language (Hinglish is okay).
- Keep answers short, encouraging, and easy to understand (A1/A2 level).
`;

        // 4. Call the AI
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
            model: "llama3-8b-8192", // Free, fast model
            temperature: 0.7,
        });

        const botReply = completion.choices[0]?.message?.content || "Entschuldigung, I didn't catch that.";

        log('Bot reply: ' + botReply.substring(0, 100));

        // 5. Send the reply back to the app
        return res.json({ reply: botReply });

    } catch (err) {
        error("AI Error: " + err.message);
        return res.json({ error: "Failed to fetch response: " + err.message });
    }
};