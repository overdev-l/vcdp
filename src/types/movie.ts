import { CompileConfig, } from "../types"
export namespace Movie {
  export interface Options {
    container: HTMLDivElement
    width: number
    height: number
    videoWidth: number
    videoHeight: number
    loadingImage: string
    pauseImage: string
    replayImage: string
    subtitleStyle: CompileConfig.TextStyle
  }
  export interface VideoEvents {
    eventName: string
    callbacks: (() => void)[]
  }
  export interface VideoOptions {
    source: string
    startTime: number
    endTime: number
    volume: number
    mute: boolean
  }
}
