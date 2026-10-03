import { supabase, isSupabaseConfigured } from './supabase'
import { presetMessages } from '../content/messages'

const TABLE = 'wall_notes'
const NOTE_COLORS = ['yellow', 'pink', 'orange', 'blue', 'green', 'mint', 'lavender', 'peach']

function mapNote(row) {
  return {
    id: row.id,
    text: row.text,
    color: row.color,
    x: Number(row.x),
    y: Number(row.y),
    createdAt: row.created_at,
  }
}

export async function listWallNotes() {
  if (!isSupabaseConfigured || !supabase) {
    return { notes: presetMessages, error: null, offline: true }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, text, color, x, y, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    return { notes: presetMessages, error: error.message, offline: true }
  }

  return { notes: (data ?? []).map(mapNote), error: null, offline: false }
}

export async function createWallNote({ text, color = 'yellow', x = 24, y = 28 }) {
  const payload = {
    text: text.trim().slice(0, 120),
    color: NOTE_COLORS.includes(color) ? color : 'yellow',
    x: Math.min(90, Math.max(2, Number(x))),
    y: Math.min(85, Math.max(2, Number(y))),
  }

  if (!payload.text) {
    return { note: null, error: '留言不能为空' }
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      note: {
        id: `local-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
      },
      error: '未配置 Supabase，仅本地临时显示',
      offline: true,
    }
  }

  const { data, error } = await supabase.from(TABLE).insert(payload).select().single()
  if (error) return { note: null, error: error.message }
  return { note: mapNote(data), error: null }
}

export async function updateWallNotePosition(id, x, y) {
  const next = {
    x: Math.min(90, Math.max(2, Number(x))),
    y: Math.min(85, Math.max(2, Number(y))),
  }

  if (!isSupabaseConfigured || !supabase) {
    return { error: null, offline: true }
  }

  const { error } = await supabase.from(TABLE).update(next).eq('id', id)
  return { error: error?.message ?? null }
}

export async function deleteWallNote(id) {
  if (!id) return { error: '便签无效' }

  if (!isSupabaseConfigured || !supabase) {
    return { error: null, offline: true }
  }

  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  return { error: error?.message ?? null }
}

export function subscribeWallNotes(onChange) {
  if (!isSupabaseConfigured || !supabase) return () => {}

  const channel = supabase
    .channel('wall_notes_shared')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      () => {
        onChange()
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export { NOTE_COLORS }
