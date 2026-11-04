import type { ColorScheme } from './math'

// The mod's settings. The manifest's `userConfig` options are the base, and
// the host only turns them into /config rows for some plugin loads, so the
// pane cannot rely on `$.config.set`. The pane keeps what the user changed in
// the store, as a map of overrides, and the two are merged here.

export const BUBBLE_MODES = ['off', 'under', 'rendered'] as const
export type BubbleMode = (typeof BUBBLE_MODES)[number]

const COLOR_SCHEMES: readonly ColorScheme[] = ['auto', 'light', 'dark']

export type Settings = {
  mathFont: string
  colorScheme: ColorScheme
  tikz: boolean
  userBubble: BubbleMode
  tellModel: boolean
  copyButton: boolean
}

// What each field holds when the manifest's `userConfig` says nothing.
export const DEFAULTS: Settings = {
  mathFont: 'mathjax',
  colorScheme: 'auto',
  tikz: true,
  userBubble: 'off',
  tellModel: true,
  copyButton: false,
}

// The store key the pane writes its overrides under.
export const STORE_KEY = 'settings'

// What the pane changed: only the fields the user touched.
export type Overrides = Partial<Settings>

// The manifest options as settings, an unknown value falling back to the default.
export function fromOptions(options: Readonly<Record<string, unknown>>): Settings {
  const scheme = COLOR_SCHEMES.find(s => s === options.colorScheme)
  const bubble = BUBBLE_MODES.find(m => m === options.userBubble)
  return {
    mathFont: String(options.mathFont ?? DEFAULTS.mathFont),
    colorScheme: scheme ?? DEFAULTS.colorScheme,
    tikz: options.tikz !== false,
    userBubble: bubble ?? DEFAULTS.userBubble,
    tellModel: options.tellModel !== false,
    copyButton: options.copyButton === true,
  }
}

// What the store held, field by field, dropping anything of the wrong type or
// outside a field's choices. The store outlives versions of the mod, so an old
// or hand-edited value must never reach a hook.
export function readOverrides(stored: unknown): Overrides {
  if (typeof stored !== 'object' || stored === null) return {}
  const raw = stored as Record<string, unknown>
  const out: Overrides = {}
  if (typeof raw.mathFont === 'string') out.mathFont = raw.mathFont
  const scheme = COLOR_SCHEMES.find(s => s === raw.colorScheme)
  if (scheme) out.colorScheme = scheme
  if (typeof raw.tikz === 'boolean') out.tikz = raw.tikz
  const bubble = BUBBLE_MODES.find(m => m === raw.userBubble)
  if (bubble) out.userBubble = bubble
  if (typeof raw.tellModel === 'boolean') out.tellModel = raw.tellModel
  if (typeof raw.copyButton === 'boolean') out.copyButton = raw.copyButton
  return out
}

// Which value wins for each field: the manifest option (`base`, set with
// `claude plugin configure`) or what the pane saved (`overrides`).
// The pane wins for any field it has saved, because it is the one place the
// user changes settings from inside the app. A field the pane never touched
// still follows `claude plugin configure`. The cost: once the pane has saved a
// field, a later `claude plugin configure` change to that field is ignored,
// and the pane is how to change it back.
export function mergeSettings(base: Settings, overrides: Overrides): Settings {
  return { ...base, ...overrides }
}
