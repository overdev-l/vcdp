import { CompileConfig, } from "./compile"
export namespace timeControllerOptions {
    export interface Options {
        scenes: Array<CompileConfig.Scene>
        pause: () => void
        play: () => void
        stop: () => void
    }
}
