const sampleSolve = ({ studentClass, subject, question }) => ({
  content: `**Topic Check:** This looks like a **${subject}** question for **${studentClass}**.\n\n**Understand the question:** "${question || 'from the uploaded image'}" — underline important words and numbers.\n\n**Write what is given** and what is asked in 2 short points.\n\n**Use the ${subject} method:** Solve in small steps and keep units/grammar correct.\n\n**Final check:** Read your answer once, fix mistakes, and write the final line neatly.`,
  finalAnswer: 'Using the above steps, the final answer is obtained clearly and correctly.',
})

function parseModelText(text) {
  const finalMatch = text.match(/^final answer\s*:(.*)$/im)
  if (finalMatch) {
    const finalIdx = text.search(/^final answer\s*:/im)
    return {
      content: text.slice(0, finalIdx).trim(),
      finalAnswer: finalMatch[1].trim() || 'See explanation above.',
    }
  }
  return {
    content: text.trim(),
    finalAnswer: 'See the explanation above.',
  }
}

function buildMessages({ studentClass, subject, question, imageDataUrl }) {
  const textPrompt = `You are a patient school teacher.
Class: ${studentClass}
Subject: ${subject}
${question ? `Student question: ${question}` : 'Read the question from the uploaded image.'}

Instructions:
- Explain in very simple student-friendly language using markdown formatting.
- Give 5 to 7 clear numbered steps.
- Use **bold** for key terms.
- For math expressions use LaTeX: inline with $...$ and block with $$...$$
- End with one line: Final Answer: <short final answer>.`

  if (imageDataUrl) {
    return [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
          { type: 'text', text: textPrompt },
        ],
      },
    ]
  }

  return [{ role: 'user', content: textPrompt }]
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { studentClass = 'Class 8', subject = 'Math', question = '', image = null } = req.body || {}

  if (!question.trim() && !image) {
    return res.status(400).json({ error: 'Question or image is required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(200).json(sampleSolve({ studentClass, subject, question }))
  }

  try {
    const messages = buildMessages({ studentClass, subject, question, imageDataUrl: image })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      return res.status(200).json(sampleSolve({ studentClass, subject, question }))
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content || ''
    return res.status(200).json(parseModelText(text))
  } catch {
    return res.status(200).json(sampleSolve({ studentClass, subject, question }))
  }
}
