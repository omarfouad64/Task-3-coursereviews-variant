import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// This page is routed at /reviews/new (create) and /reviews/:id (edit),
// both wrapped in <ProtectedRoute> so only logged-in users reach it.

const defaults = { courseCode: '', rating: 5, comment: '' }

export default function ReviewForm() {
  const nav = useNavigate()
  const { id } = useParams()           // present only in edit mode
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // TODO 3 — edit mode: fetch the existing review and pre-fill the form.
  // Runs whenever `id` changes. Skips entirely when creating a new review.
  useEffect(() => {
    if (!id) return
    api.get(`/reviews/${id}`)
      .then(res => {
        const { courseCode, rating, comment } = res.data.review
        setForm({ courseCode, rating, comment: comment ?? '' })
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not load review'))
  }, [id])

  // TODO 1 — keep `form` in sync with every input.
  // The `rating` field comes back as a string from the DOM, so we cast it to
  // a number with the unary + operator; all other fields stay as strings.
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? +value : value
    }))
  }

  // TODO 2 & 3 — submit handler.
  // POST when creating, PATCH when editing. The server derives `reviewedBy`
  // from the JWT, so we must NOT include it in the body.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const body = {
      courseCode: form.courseCode,
      rating: form.rating,
      comment: form.comment,
    }
    try {
      if (id) {
        await api.patch(`/reviews/${id}`, body)
      } else {
        await api.post('/reviews', body)
      }
      nav('/reviews')
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Write'} Review</h1>
      <form onSubmit={onSubmit} className="space-y-3">

        {/* TODO 1 — Course Code */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="courseCode">
            Course Code
          </label>
          <input
            id="courseCode"
            name="courseCode"
            className="input"
            placeholder="e.g. CS101"
            value={form.courseCode}
            onChange={onChange}
            required
          />
        </div>

        {/* TODO 1 — Rating (stored as a number, not a string) */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="rating">
            Rating
          </label>
          <select
            id="rating"
            name="rating"
            className="input"
            value={form.rating}
            onChange={onChange}
            required
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* TODO 1 — Comment (optional) */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="comment">
            Comment <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            className="input"
            rows={4}
            placeholder="Share your thoughts…"
            value={form.comment}
            onChange={onChange}
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
