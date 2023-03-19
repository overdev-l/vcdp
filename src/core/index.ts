import { CoreConfig, CompileConfig, } from "../types"
import Compile from "../compile"
import { Renderer, } from "../renderer"
import Konva from "konva"
class Core {
    _compile: Compile
    _render: Renderer
    _options: CoreConfig.Options
    constructor(options: CoreConfig.Options) {
        this._options = options
        this.init()
    }
    init() {
        this._compile = new Compile({
            ...this._options.movieData,
            firstCompileCallback: this.LoadComplete.bind(this),
        })
        this._render = new Renderer({
            container: typeof this._options.container === "string" ? document.querySelector(this._options.container) as HTMLDivElement : this._options.container,
            videoWidth: this._options.videoWidth,
            videoHeight: this._options.videoHeight,
            loadingImage: this._options.loadingImage || "",
            subtitleStyle: this._options.movieData.scenes[0].subtitle?.style || {},
            updateNextNode: this.updateNextNode.bind(this),
        })
    }
    LoadComplete() {
        if (!this._compile._fiber) {
            console.error("暂无场景数据")
            return
        }
        this._render.update(this._compile._playFiberNode)
        if (this._compile._currentFiberNode.head) {
            this._render.updateBackground(this._compile._backgroundAudios)
            this._render.updateVideoElement(this._compile._videoElement)
        }
        this._render._movie.stopLoading()

        this._render._movie._fps.start()
        if (!this._compile._currentFiberNode.head) {
            Promise.resolve().then(() => {
                this._render.play()
            })
        } else {
            this._render._movie.startPause()
        }
    }
    async updateNextNode() {
        const result = await this._compile.updateNextNode()
        if (result) {
            this.LoadComplete()
        } else {
            this._render._movie.stopLoading()
            this._render._movie.startReplay()
        }
    }
    public getElement(name: string) {
        return this._render._movie._videoElement.findElement(name)
    }
    public play() {
        const result = this._render._movie._animationLayer.findOne((element: Konva.Image) => element.name() === "done")
        if (result !== undefined) {
            console.warn("场景已播放完毕")
            return
        }
        this._render.play()
        this._render._movie.stopPause()
    }
    public pause() {
        this._render.pause()
        this._render._movie.startPause()
    }
    public update(options: CompileConfig.Options) {
        this._compile.init(options)
    }

}

export default Core
