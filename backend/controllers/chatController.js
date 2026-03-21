const axios = require('axios');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `You are a helpful delivery assistant for DropZone, a drone delivery service based in Patna, Bihar, India.
            You help users with:
            - Tracking their orders
            - Understanding delivery status
            - Answering questions about drone deliveries
            - Estimated delivery times
            - General delivery queries
            Keep answers short, friendly and helpful. Never make up specific order details.`
          },
          {
            role: 'user',
            content: message
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.status(200).json({ reply });

  } catch (error) {
    console.error('Groq API error:', error.response?.data || error.message);
    res.status(500).json({ message: 'AI assistant is unavailable right now' });
  }
};