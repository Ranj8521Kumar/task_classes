const sampleSolve = ({ studentClass, subject, question, hasImage }) => ({
  steps: [
    `Understand the question for ${studentClass} ${subject}${hasImage ? ' from uploaded image' : ''}: ${question || 'Image-only query'}`,
    'Write down what is given and what needs to be found.',
    `Apply the correct ${subject} concept step by step in easy language.`,
    'Check each step and make sure units/grammar are correct.',
    'Write the final statement clearly.',
  ],
  finalAnswer: 'Using the above steps, the final answer is obtained clearly and correctly.',
})

function parseModelText(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  const finalIdx = lines.findIndex((line) => /^final answer\s*:/i.test(line))

  if (finalIdx === -1) {
    return {
      steps: lines.map((line) => line.replace(/^[-*\d.)\s]+/, '')),
      finalAnswer: 'Final answer is explained above.',
    }
  }

  return {
    steps: lines.slice(0, finalIdx).map((line) => line.replace(/^[-*\d.)\s]+/, '')),
    finalAnswer: lines[finalIdx].replace(/^final answer\s*:\s*/i, ''),
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { studentClass = 'Class 8', subject = 'Math', question = '', imageDataUrl = '' } = req.body || {}
  if (!question.trim() && !imageDataUrl) return res.status(400).json({ error: 'Question text or image is required' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(200).json(sampleSolve({ studentClass, subject, question, hasImage: !!imageDataUrl }))
  }

  try {
    const userContent = [
      {
        type: 'text',
        text: `You are a patient school teacher.
Class: ${studentClass}
Subject: ${subject}
Question: ${question || 'Use the uploaded question image'}

Instructions:
- Explain in very simple student-friendly language.
- Give 5 to 7 clear numbered steps.
- Do not only give direct answer.
- End with one line: Final Answer: <short final answer>.`,
      },
    ]

    if (imageDataUrl) {
      userContent.push({
        type: 'image_url',
        image_url: { url: imageDataUrl },
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: userContent }],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      return res.status(200).json(sampleSolve({ studentClass, subject, question, hasImage: !!imageDataUrl }))
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content || ''
    return res.status(200).json(parseModelText(content))
  } catch {
    return res.status(200).json(sampleSolve({ studentClass, subject, question, hasImage: !!imageDataUrl }))
  }
}
