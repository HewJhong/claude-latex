// The state this mod keeps for the session. `version` goes up each time a
// LaTeX compile finishes, which redraws every message that read it.
export type CompileVersion = number
// Whether the one-time welcome band shows above the prompt.
export type IntroVisible = boolean
// Goes up each time a setting changes, so messages and the pane redraw.
export type SettingsTick = number

declare module 'claude-code' {
  interface PluginState {
    latex: { version: CompileVersion; intro: IntroVisible; settingsTick: SettingsTick }
  }
}
