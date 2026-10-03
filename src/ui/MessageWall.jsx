import { useCallback, useEffect, useRef, useState } from 'react'
import {
  NOTE_COLORS,
  createWallNote,
  deleteWallNote,
  listWallNotes,
  subscribeWallNotes,
  updateWallNotePosition,
} from '../lib/wallNotes'

const COLOR_LABEL = {
  yellow: '黄',
  pink: '粉',
  orange: '橙',
  blue: '蓝',
  green: '绿',
  mint: '清',
  lavender: '紫',
  peach: '桃',
}

export function MessageWall() {
  const boardRef = useRef(null)
  const dragRef = useRef(null)
  const [notes, setNotes] = useState([])
  const [draft, setDraft] = useState('')
  const [color, setColor] = useState('yellow')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    const { notes: next, error: err, offline } = await listWallNotes()
    setNotes(next)
    if (err) {
      setError(err)
      setStatus('error')
      return
    }
    setError(offline ? '当前为离线占位，请先在 Supabase 执行建表 SQL' : '')
    setStatus(offline ? 'offline' : 'ready')
  }, [])

  useEffect(() => {
    refresh()
    const unsubscribe = subscribeWallNotes(() => {
      refresh()
    })
    return unsubscribe
  }, [refresh])

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!draft.trim() || saving) return
    setSaving(true)
    const x = 12 + Math.random() * 55
    const y = 14 + Math.random() * 45
    const { note, error: err } = await createWallNote({
      text: draft,
      color,
      x,
      y,
    })
    setSaving(false)
    if (err && !note) {
      setError(err)
      return
    }
    if (note) {
      setNotes((prev) => [...prev.filter((item) => item.id !== note.id), note])
      setDraft('')
      setError(err || '')
    }
  }

  const onDeleteNote = async (event, note) => {
    event.preventDefault()
    event.stopPropagation()
    if (dragRef.current?.id === note.id) {
      dragRef.current = null
    }
    const previous = notes
    setNotes((prev) => prev.filter((item) => item.id !== note.id))
    const { error: err } = await deleteWallNote(note.id)
    if (err) {
      setNotes(previous)
      setError(err)
    }
  }

  const onPointerDownNote = (event, note) => {
    if (event.button !== 0) return
    if (event.target.closest('.wall-note-delete')) return
    event.preventDefault()
    const board = boardRef.current
    if (!board) return
    const rect = board.getBoundingClientRect()
    dragRef.current = {
      id: note.id,
      offsetX: ((event.clientX - rect.left) / rect.width) * 100 - note.x,
      offsetY: ((event.clientY - rect.top) / rect.height) * 100 - note.y,
      x: note.x,
      y: note.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMoveNote = (event) => {
    const drag = dragRef.current
    const board = boardRef.current
    if (!drag || !board) return
    const rect = board.getBoundingClientRect()
    const x = Math.min(90, Math.max(2, ((event.clientX - rect.left) / rect.width) * 100 - drag.offsetX))
    const y = Math.min(85, Math.max(2, ((event.clientY - rect.top) / rect.height) * 100 - drag.offsetY))
    drag.x = x
    drag.y = y
    setNotes((prev) => prev.map((item) => (item.id === drag.id ? { ...item, x, y } : item)))
  }

  const onPointerUpNote = async (event) => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // ignore
    }
    const { error: err } = await updateWallNotePosition(drag.id, drag.x, drag.y)
    if (err) setError(err)
  }

  return (
    <div className="message-wall">
      <p className="message-wall-hint">写下你的留言/建议吧~</p>

      <div ref={boardRef} className="message-wall-board" aria-label="留言墙">
        {status === 'loading' ? <p className="message-wall-status">加载中…</p> : null}
        {notes.map((note) => (
          <div
            key={note.id}
            className={`wall-note wall-note--${note.color}`}
            style={{ left: `${note.x}%`, top: `${note.y}%` }}
            onPointerDown={(event) => onPointerDownNote(event, note)}
            onPointerMove={onPointerMoveNote}
            onPointerUp={onPointerUpNote}
            aria-label={`便签：${note.text}`}
          >
            <button
              type="button"
              className="wall-note-delete"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => onDeleteNote(event, note)}
              aria-label="删除这条留言"
              title="删除"
            >
              ×
            </button>
            <p className="wall-note-text">{note.text}</p>
          </div>
        ))}
      </div>

      <form className="message-wall-form" onSubmit={onSubmit}>
        <textarea
          id="wall-note-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={120}
          rows={2}
          placeholder="hii~看到你的作品啦"
          aria-label="写一句留言"
        />
        <div className="message-wall-toolbar">
          <div className="message-wall-colors" role="group" aria-label="便签颜色">
            {NOTE_COLORS.map((item) => (
              <button
                key={item}
                type="button"
                className={`color-chip color-chip--${item}${color === item ? ' is-active' : ''}`}
                onClick={() => setColor(item)}
                aria-pressed={color === item}
                aria-label={COLOR_LABEL[item]}
                title={COLOR_LABEL[item]}
              >
                {COLOR_LABEL[item]}
              </button>
            ))}
          </div>
          <button className="retry-button" type="submit" disabled={saving || !draft.trim()}>
            {saving ? '贴上中…' : '贴到墙上'}
          </button>
        </div>
      </form>

      {error ? <p className="message-wall-error">{error}</p> : null}
    </div>
  )
}
