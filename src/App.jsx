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

/* ── Icons ─────────────────────────────────────────── */
function IconImage() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}
function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  )
}
function IconSend() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}
function IconSparkle() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  )
}

/* ── Spinner ────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <path d="M12 2a10 10 0 0110 10" />
    </svg>
  )
}

/* ── Shimmer skeleton ───────────────────────────────── */
function Skeleton() {
  return (
    <div className="mt-5 space-y-3 fade-in">
      <div className="shimmer-line h-3.5 w-11/12" />
      <div className="shimmer-line h-3.5 w-10/12" />
      <div className="shimmer-line h-3.5 w-8/12" />
      <div className="shimmer-line h-3.5 w-11/12 mt-4" />
      <div className="shimmer-line h-3.5 w-9/12" />
      <div className="shimmer-line h-3.5 w-10/12" />
    </div>
  )
}

/* ── Field label ────────────────────────────────────── */
function Label({ children }) {
  return (
    <span
      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: 'var(--ink-muted)', letterSpacing: '0.1em' }}
    >
      {children}
    </span>
  )
}

/* ── Main App ───────────────────────────────────────── */
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
      setError('Could not reach the server. Please try again.')
      setContent('')
      setFinalAnswer('')
    } finally {
      setLoading(false)
    }
  }

  const resetAll = (keepSelectors = false) => {
    setQuestion('')
    removeImage()
    setContent('')
    setFinalAnswer('')
    setError('')
    setCopyMsg('')
    if (!keepSelectors) {
      setStudentClass('Class 8')
      setSubject('Math')
    }
  }

  const copyAnswer = async () => {
    if (!content) return
    const text = `Question: ${question}\n\n${content}\n\nFinal Answer: ${finalAnswer}`
    try {
      await navigator.clipboard.writeText(text)
      setCopyMsg('Copied!')
      setTimeout(() => setCopyMsg(''), 2000)
    } catch {
      setCopyMsg('Failed to copy.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }} className="px-4 py-8 md:py-12">
      <div className="mx-auto" style={{ maxWidth: '900px' }}>

        {/* ── Header ─────────────────────────────────────── */}
        <header className="mb-8 md:mb-10">
          {/* Top accent stripe */}
          <div
            className="mb-6 h-px w-full rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, var(--blue) 30%, var(--amber) 70%, transparent)' }}
          />

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1
                className="font-serif leading-none"
                style={{ fontSize: 'clamp(26px, 5vw, 38px)', color: 'var(--ink)', fontStyle: 'italic' }}
              >
                Student Doubt Solver
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
                Clear, step-by-step answers for Classes 6–12
              </p>
            </div>

            {/* Badge */}
            <div
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', fontSize: '12px', color: 'var(--ink-muted)' }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', flexShrink: 0 }} />
              AI Powered
            </div>
          </div>
        </header>

        {/* ── Main card ──────────────────────────────────── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)',
          }}
        >
          <div className="grid md:grid-cols-2 md:divide-x" style={{ '--tw-divide-opacity': 1 }}>

            {/* ── Left: Form ─────────────────────────────── */}
            <form onSubmit={onSubmit} className="p-6 space-y-5 md:p-7">

              {/* Class + Subject row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Class</Label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="field-select"
                  >
                    {classOptions.map((opt) => <option key={opt}>{opt}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Board / Medium</Label>
                  <select
                    className="field-select"
                    defaultValue="CBSE"
                  >
                    <option>CBSE</option>
                    <option>ICSE</option>
                    <option>State Board</option>
                  </select>
                </div>
              </div>

              {/* Subject chips */}
              <div>
                <Label>Subject</Label>
                <div className="flex flex-wrap gap-2">
                  {subjectOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSubject(opt)}
                      className={`subject-chip${subject === opt ? ' active' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question textarea */}
              <div>
                <Label>
                  Your Question
                  {image && (
                    <span className="ml-2 normal-case tracking-normal" style={{ color: 'var(--blue)', fontSize: '11px' }}>
                      — image attached
                    </span>
                  )}
                </Label>

                {/* Image chip */}
                {imagePreview && (
                  <div className="img-chip mb-2">
                    <img src={imagePreview} alt="Attached" className="img-chip-thumb" />
                    <span className="img-chip-name">{image?.name || 'image'}</span>
                    <button type="button" onClick={removeImage} className="img-chip-remove">✕</button>
                  </div>
                )}

                {/* Textarea with attach icon */}
                <div className="relative">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={
                      image
                        ? 'Add extra context, or leave empty…'
                        : 'e.g. A train travels 120 km in 2 hours. Find speed.'
                    }
                    rows={5}
                    className="field-textarea"
                  />
                  {/* Image attach button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach image"
                    className="absolute bottom-2.5 left-2.5 rounded-lg p-1.5 transition-colors"
                    style={{
                      color: image ? 'var(--blue)' : 'var(--ink-muted)',
                      background: image ? 'var(--blue-light)' : 'transparent',
                    }}
                  >
                    <IconImage />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e.target.files?.[0])}
                  />
                </div>
                <p className="mt-1 text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                  {image ? 'gpt-4o vision will read your image' : 'Type your doubt or attach a photo of the question'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={!canSubmit} className="btn-primary">
                  {loading ? <><Spinner />Solving…</> : <><IconSend />Get Answer</>}
                </button>
                <button type="button" onClick={() => resetAll(true)} className="btn-ghost">
                  Clear
                </button>
              </div>
            </form>

            {/* ── Right: Answer ───────────────────────────── */}
            <section className="flex flex-col p-6 md:p-7" style={{ background: 'var(--paper)', minHeight: '420px' }}>

              {/* Answer header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--ink-muted)' }}>
                  Answer
                </span>
                {content && (
                  <button
                    type="button"
                    onClick={copyAnswer}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors fade-in"
                    style={{
                      borderColor: 'var(--border)',
                      color: copyMsg ? 'var(--green)' : 'var(--ink-soft)',
                      background: 'var(--surface)',
                    }}
                  >
                    <IconCopy />
                    {copyMsg || 'Copy'}
                  </button>
                )}
              </div>

              {/* Thin divider */}
              <div className="mb-4 h-px" style={{ background: 'var(--border)' }} />

              {/* States */}
              {loading && <Skeleton />}

              {!loading && !content && !error && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 fade-in">
                  <div style={{ color: 'var(--border)' }}><IconSparkle /></div>
                  <p className="text-center text-sm" style={{ color: 'var(--ink-muted)', maxWidth: '200px', lineHeight: 1.6 }}>
                    Your answer will appear here once you submit a question.
                  </p>
                </div>
              )}

              {error && (
                <div
                  className="rounded-xl border px-4 py-3 text-sm fade-in"
                  style={{ borderColor: 'var(--red)', background: 'var(--red-light)', color: 'var(--red)' }}
                >
                  {error}
                </div>
              )}

              {!loading && content && (
                <div className="flex flex-col gap-4 answer-reveal">

                  {/* Markdown answer */}
                  <div className="answer-prose">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {content}
                    </ReactMarkdown>
                  </div>

                  {/* Final answer highlight */}
                  <div
                    className="rounded-xl border-l-4 px-4 py-3"
                    style={{
                      borderLeftColor: 'var(--amber)',
                      background: 'var(--amber-light)',
                    }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--amber)' }}>
                      Final Answer
                    </p>
                    <div className="answer-prose text-sm" style={{ color: 'var(--ink)' }}>
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {finalAnswer}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Ask another */}
                  <button type="button" onClick={() => resetAll(true)} className="btn-subtle">
                    Ask Another Doubt →
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <p className="mt-6 text-center text-[12px]" style={{ color: 'var(--ink-muted)' }}>
          Classes 6–12 · CBSE · ICSE · State Board &nbsp;·&nbsp; Add your OpenAI key to <code style={{ fontSize: '11px' }}>.env</code> for live answers
        </p>

      </div>
    </div>
  )
}
