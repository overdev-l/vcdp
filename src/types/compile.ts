import Konva from "konva"
export namespace CompileConfig {
  export interface Options extends MovieData {
    firstCompileCallback: () => void
  }
  interface MovieData {
    backgroundAudios: BackgroundAudio[]
    scenes: Scene[]
    elements: Element[]
  }
  interface BackgroundAudio {
    source: string
    startTime: number
    endTime: number
    volume: number
    mute?: boolean
    loop?: boolean
  }
  interface Scene {
    duration: number
    video: Video
    subtitle?: Subtitle
    dub?: Dub
  }
  interface Subtitle {
    source: string
    style: TextStyle
  }
  interface Video {
    source: string
    startTime: number
    endTime: number
    volume: number
    mute?: boolean
  }

  type Dub = Omit<BackgroundAudio, "startTime" | "endTime" | "loop"> 
  type TextStyle = Konva.TextConfig & {
    [prop: string] : string | number
  }
}
