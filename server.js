const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is not set.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request, "messages" field is required and must be an array.' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: 'Malformed response from OpenAI API' });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Make sure you have set OPENAI_API_KEY environment variable.`);
});

