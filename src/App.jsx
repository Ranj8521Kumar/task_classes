import { useMemo, useState } from 'react'

const classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const subjectOptions = ['Math', 'Science', 'English', 'Social Science', 'Hindi', 'Computer']

const parseAnswerToSteps = (steps) => {
  if (Array.isArray(steps) && steps.length) return steps
  return ['Sorry, I could not generate a clear answer. Please try again.']
}

async function getAnswerFromBackend({ studentClass, subject, question }) {
  const res = await fetch('/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentClass, subject, question }),
  })

  if (!res.ok) {
    throw new Error('Request failed')
  }

  const data = await res.json()
  return {
    steps: parseAnswerToSteps(data.steps),
    finalAnswer: data.finalAnswer || 'Final answer not available.',
  }
}

export default function App() {
  const [studentClass, setStudentClass] = useState('Class 8')
  const [subject, setSubject] = useState('Math')
  const [question, setQuestion] = useState('')
  const [steps, setSteps] = useState([])
  const [finalAnswer, setFinalAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copyMsg, setCopyMsg] = useState('')

  const canSubmit = useMemo(() => question.trim().length > 5 && !loading, [question, loading])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError('')
    setCopyMsg('')

    try {
      const result = await getAnswerFromBackend({ studentClass, subject, question: question.trim() })
      setSteps(result.steps)
      setFinalAnswer(result.finalAnswer)
    } catch {
      setError('Could not generate answer right now. Please try again.')
      setSteps([])
      setFinalAnswer('')
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setQuestion('')
    setSteps([])
    setFinalAnswer('')
    setError('')
    setCopyMsg('')
  }

  const askAnotherDoubt = () => {
    setQuestion('')
    setSteps([])
    setFinalAnswer('')
    setError('')
    setCopyMsg('')
  }

  const copyAnswer = async () => {
    if (!steps.length) return

    const text = `Question: ${question}\n\nSteps:\n${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nFinal Answer: ${finalAnswer}`

    try {
      await navigator.clipboard.writeText(text)
      setCopyMsg('Answer copied!')
    } catch {
      setCopyMsg('Copy failed on this device/browser.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="rounded-t-2xl border-b border-slate-200 bg-blue-600 px-4 py-4 text-white sm:px-6">
          <h1 className="text-xl font-bold sm:text-2xl">Student Doubt Solver</h1>
          <p className="mt-1 text-xs text-blue-100 sm:text-sm">Classes 6-12 • Simple Step-by-Step Answers</p>
        </header>

        <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 md:grid-cols-2">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Select Class</label>
              <select value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none">
                {classOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Select Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none">
                {subjectOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Paste Your Question</label>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Example: A train travels 120 km in 2 hours. Find speed." className="h-36 w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none sm:h-40" />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button disabled={!canSubmit} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto">
                {loading ? 'Solving...' : 'Get Answer'}
              </button>
              <button type="button" onClick={clearAll} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto">
                Clear
              </button>
            </div>
          </form>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-800 sm:text-lg">Answer Area</h2>
              {!!steps.length && (
                <button type="button" onClick={copyAnswer} className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-white sm:text-sm">
                  Copy Answer
                </button>
              )}
            </div>

            {loading && (
              <div className="mt-4 animate-pulse space-y-2.5">
                <div className="h-4 w-11/12 rounded bg-slate-200" />
                <div className="h-4 w-10/12 rounded bg-slate-200" />
                <div className="h-4 w-9/12 rounded bg-slate-200" />
              </div>
            )}

            {!loading && steps.length === 0 && <p className="mt-3 text-sm text-slate-600">Your step-by-step answer will appear here after you submit a question.</p>}

            {!loading && steps.length > 0 && (
              <>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-800">
                  {steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <div className="mt-4 rounded-lg bg-green-50 p-3 text-green-900">
                  <p className="text-sm font-semibold">Final Answer</p>
                  <p className="text-sm">{finalAnswer}</p>
                </div>
                <button type="button" onClick={askAnotherDoubt} className="mt-4 w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
                  Ask Another Doubt
                </button>
              </>
            )}

            {copyMsg && <p className="mt-3 text-xs text-emerald-700">{copyMsg}</p>}
            {error && <p className="mt-3 text-xs text-amber-700">{error}</p>}
          </section>
        </div>
      </div>
    </main>
  )
}
