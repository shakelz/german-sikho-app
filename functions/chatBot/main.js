const { Groq } = require('groq-sdk');

module.exports = async ({ req, res, log, error }) => {
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
        // 3. Parse Message
        let userMessage = "Hello"; // Default for safety

        if (req.body) {
            // Handle if body is already an object or a string
            const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            if (bodyData.userMessage) {
                userMessage = bodyData.userMessage;
            }
        }

        // 4. Call AI
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful German language tutor. Keep answers short." },
                { role: "user", content: userMessage },
            ],
            model: "llama-3.3-70b-versatile",
        });

        const reply = completion.choices[0]?.message?.content || "No reply";

        // 5. Send Response
        return res.json({ reply: reply });

    } catch (err) {
        error("Crash Error: " + err.message);
        return res.json({ error: "Failed to fetch response" }, 500);
    }
};