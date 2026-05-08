import { useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

const classOptions = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const subjectOptions = ['Math', 'Science', 'English', 'Social Science', 'Hindi', 'Computer']

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function getAnswerFromBackend({ studentClass, subject, question, image }) {
  const res = await fetch('/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentClass, subject, question, image }),
  })
  if (!res.ok) throw new Error('Request failed')
  const data = await res.json()
  return {
    content: data.content || '',
    finalAnswer: data.finalAnswer || 'Final answer not available.',
  }
}

function ImageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

export default function App() {
  const [studentClass, setStudentClass] = useState('Class 8')
  const [subject, setSubject] = useState('Math')
  const [question, setQuestion] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [content, setContent] = useState('')
  const [finalAnswer, setFinalAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copyMsg, setCopyMsg] = useState('')
  const fileInputRef = useRef(null)

  const canSubmit = useMemo(
    () => (question.trim().length > 5 || !!image) && !loading,
    [question, image, loading]
  )

  const handleImageSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    setCopyMsg('')
    try {
      const imageBase64 = image ? await fileToBase64(image) : null
      const result = await getAnswerFromBackend({
        studentClass,
        subject,
        question: question.trim(),
        image: imageBase64,
      })
      setContent(result.content)
      setFinalAnswer(result.finalAnswer)
    } catch {
      setError('Could not generate answer right now. Please try again.')
      setContent('')
      setFinalAnswer('')
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setQuestion('')
    removeImage()
    setContent('')
    setFinalAnswer('')
    setError('')
    setCopyMsg('')
  }

  const askAnotherDoubt = () => {
    setQuestion('')
    removeImage()
    setContent('')
    setFinalAnswer('')
    setError('')
    setCopyMsg('')
  }

  const copyAnswer = async () => {
    if (!content) return
    const text = `Question: ${question}\n\n${content}\n\nFinal Answer: ${finalAnswer}`
    try {
      await navigator.clipboard.writeText(text)
      setCopyMsg('Answer copied!')
    } catch {
      setCopyMsg('Copy failed on this device/browser.')
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
                {classOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Select Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
              >
                {subjectOptions.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>

            {/* Question input with image attach button */}
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Your Question</label>

              {/* Image thumbnail chip — shown above textarea when image is attached */}
              {imagePreview && (
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1 pr-2">
                  <img
                    src={imagePreview}
                    alt="Attached"
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <span className="max-w-[120px] truncate text-xs text-slate-600">{image?.name}</span>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-slate-600 hover:bg-red-400 hover:text-white text-[10px] font-bold leading-none"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Textarea + image icon button row */}
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={image ? 'Add context or leave empty…' : 'Example: A train travels 120 km in 2 hours. Find speed.'}
                  className="h-32 w-full rounded-xl border border-slate-300 p-3 pb-10 focus:border-blue-500 focus:outline-none resize-none"
                />
                {/* Image attach icon — bottom-left inside textarea */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image"
                  className={`absolute bottom-2.5 left-2.5 rounded-lg p-1.5 transition-colors
                    ${image ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-500 hover:bg-slate-100'}`}
                >
                  <ImageIcon />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files?.[0])}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {image ? 'Image attached — text is optional' : 'Type your question or attach an image'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                disabled={!canSubmit}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? 'Solving...' : 'Get Answer'}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-800">Answer Area</h2>
              {!!content && (
                <button
                  type="button"
                  onClick={copyAnswer}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white"
                >
                  Copy Answer
                </button>
              )}
            </div>

            {loading && (
              <div className="mt-4 animate-pulse space-y-3">
                <div className="h-4 w-11/12 rounded bg-slate-200" />
                <div className="h-4 w-10/12 rounded bg-slate-200" />
                <div className="h-4 w-9/12 rounded bg-slate-200" />
              </div>
            )}

            {!loading && !content && (
              <p className="mt-3 text-sm text-slate-600">
                Your step-by-step answer will appear here after you submit a question.
              </p>
            )}

            {!loading && content && (
              <>
                <div className="prose prose-sm mt-4 max-w-none text-slate-800 prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-slate-900 prose-ol:pl-5 prose-ul:pl-5 prose-li:my-1">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {content}
                  </ReactMarkdown>
                </div>
                <div className="mt-4 rounded-xl bg-green-50 p-3 text-green-900">
                  <p className="text-sm font-semibold">Final Answer</p>
                  <div className="prose prose-sm max-w-none text-green-900">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {finalAnswer}
                    </ReactMarkdown>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={askAnotherDoubt}
                  className="mt-4 w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  Ask Another Doubt
                </button>
              </>
            )}

            {copyMsg && <p className="mt-3 text-xs text-emerald-700">{copyMsg}</p>}
            {error && <p className="mt-3 text-sm text-amber-700">{error}</p>}
          </section>
        </div>
      </div>
    </main>
  )
}
