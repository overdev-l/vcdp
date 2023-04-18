import { CompileConfig, } from "./compile"

export namespace Render {
    export interface Options {
        container: HTMLDivElement
        videoWidth: number
        videoHeight: number
        loadingImage: string
        pauseImage: string
        replayImage: string
        subtitleStyle: CompileConfig.TextStyle,
        scenes: CompileConfig.Scene[],
        updateNextNode: () => void
    }
}
