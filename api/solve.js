const sampleSolve = ({ studentClass, subject, question }) => ({
  steps: [
    `Understand the question for ${studentClass} ${subject}: ${question}`,
    'Write down what is given and what needs to be found.',
    `Apply the correct ${subject} concept step by step in easy language.`,
    'Check each step and make sure units/grammar are correct.',
    'Write the final statement clearly.',
  ],
  finalAnswer: 'Using the above steps, the final answer is obtained clearly and correctly.',
})

function parseModelText(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const finalIdx = lines.findIndex((line) => /^final answer\s*:/i.test(line))

  if (finalIdx === -1) {
    return {
      steps: lines.map((line) => line.replace(/^[-*\d.)\s]+/, '')),
      finalAnswer: 'Final answer is explained above.',
    }
  }

  const steps = lines.slice(0, finalIdx).map((line) => line.replace(/^[-*\d.)\s]+/, ''))
  const finalAnswer = lines[finalIdx].replace(/^final answer\s*:\s*/i, '')
  return { steps, finalAnswer }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { studentClass = 'Class 8', subject = 'Math', question = '' } = req.body || {}

  if (!question.trim()) {
    return res.status(400).json({ error: 'Question is required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(200).json(sampleSolve({ studentClass, subject, question }))
  }

  try {
    const prompt = `You are a patient school teacher.
Class: ${studentClass}
Subject: ${subject}
Question: ${question}

Instructions:
- Explain in very simple student-friendly language.
- Give 5 to 7 clear numbered steps.
- Do not only give direct answer.
- End with one line: Final Answer: <short final answer>.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      return res.status(200).json(sampleSolve({ studentClass, subject, question }))
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content || ''
    const parsed = parseModelText(content)
    return res.status(200).json(parsed)
  } catch {
    return res.status(200).json(sampleSolve({ studentClass, subject, question }))
  }
}
