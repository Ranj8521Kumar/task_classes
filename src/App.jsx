import { useMemo, useState } from 'react'

const classOptions = [
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
]

const subjectOptions = ['Math', 'Science', 'English', 'Social Science', 'Hindi', 'Computer']

const fallbackAnswer = ({ studentClass, subject, question }) => {
  return [
    `Topic Check: This looks like a ${subject} question for ${studentClass}.`,
    `Understand the question: “${question}” — underline important words and numbers.`,
    'Write what is given and what is asked in 2 short points.',
    `Use the ${subject} method: solve in small steps and keep units/grammar correct.`,
    'Final check: read your answer once, fix mistakes, and then write the final line neatly.',
  ]
}

const parseAnswerToSteps = (text) => {
  const lines = text
    .split('\n')
    .map((line) => line.replace(/^\s*[-*\d.)]+\s*/, '').trim())
    .filter(Boolean)

  return lines.length ? lines : ['Sorry, I could not generate a clear answer. Please try again.']
}

async function getAIAnswer({ studentClass, subject, question }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return fallbackAnswer({ studentClass, subject, question })
  }

  const prompt = `You are a friendly school tutor for ${studentClass}.
Subject: ${subject}
Student doubt: ${question}

Give an easy answer in 5-7 short numbered steps, simple English, age-appropriate, no hard words.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    }),
  })

  if (!res.ok) {
    return fallbackAnswer({ studentClass, subject, question })
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content || ''
  return parseAnswerToSteps(text)
}

export default function App() {
  const [studentClass, setStudentClass] = useState('Class 8')
  const [subject, setSubject] = useState('Math')
  const [question, setQuestion] = useState('')
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => question.trim().length > 5 && !loading, [question, loading])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError('')

    try {
      const result = await getAIAnswer({ studentClass, subject, question: question.trim() })
      setSteps(result)
    } catch {
      setError('Could not generate answer right now. Showing a sample approach.')
      setSteps(fallbackAnswer({ studentClass, subject, question: question.trim() }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-white to-indigo-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <header className="rounded-t-3xl bg-blue-600 px-6 py-5 text-white md:px-8">
          <h1 className="text-2xl font-bold md:text-3xl">Student Doubt Solver</h1>
          <p className="mt-1 text-sm text-blue-100">Classes 6-12 • Simple Step-by-Step Answers</p>
        </header>

        <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Select Class</label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
              >
                {classOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Select Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
              >
                {subjectOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Paste Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Example: A train travels 120 km in 2 hours. Find speed."
                className="h-40 w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              disabled={!canSubmit}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Solving your doubt...' : 'Get Easy Answer'}
            </button>

            <p className="text-xs text-slate-500">
              Tip: Add chapter name and exact numbers for better answers.
            </p>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-bold text-slate-800">Answer Area</h2>

            {loading && (
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-4 w-11/12 rounded bg-slate-200" />
                <div className="h-4 w-10/12 rounded bg-slate-200" />
                <div className="h-4 w-9/12 rounded bg-slate-200" />
              </div>
            )}

            {!loading && steps.length === 0 && (
              <p className="mt-3 text-sm text-slate-600">
                Your step-by-step answer will appear here after you submit a question.
              </p>
            )}

            {!loading && steps.length > 0 && (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-800">
                {steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}

            {error && <p className="mt-3 text-sm text-amber-700">{error}</p>}
          </section>
        </div>
      </div>
    </main>
  )
}
