const { Groq } = require('groq-sdk');

module.exports = async ({ req, res, log, error }) => {
    log("🚀 STARTING NEW CODE: Llama 3.3 Version"); // <--- Add this line
    // 1. Check API Key
    if (!process.env.GROQ_API_KEY) {
        error("Missing API Key");
        return res.json({ error: "Server Error: API Key missing" }, 500);
    }

    // 2. Init Groq
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    });

    try {
        // 3. Parse Body
        let conversation = [];

        if (req.body) {
            const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

            // Check if we received a history array
            if (bodyData.history && Array.isArray(bodyData.history)) {
                conversation = bodyData.history;
            } else if (bodyData.userMessage) {
                // Fallback for old app version (single message)
                conversation = [{ role: "user", content: bodyData.userMessage }];
            }
        }

        // 4. Call AI (Prepend System Prompt + History)
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful German language tutor. Keep answers short." },
                ...conversation // <--- SPREAD THE HISTORY HERE
            ],
            model: "llama-3.3-70b-versatile",
        });

        const reply = completion.choices[0]?.message?.content || "No reply";

        return res.json({ reply: reply });

    } catch (err) {
        error("Crash Error: " + err.message);
        return res.json({ error: "Failed to fetch response" }, 500);
    }
};