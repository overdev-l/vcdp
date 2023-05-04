import { CompileConfig, CoreConfig, } from "../types"
import Compile from "../compile"
import { Renderer, } from "../renderer"
import Konva from "konva"
import { FiberFactory, } from "../utils"
import { EventEmitter, } from "../eventEmitter"
import { events, } from "../utils/config"

class Core {
    _compile: Compile
    _render: Renderer
    _options: CoreConfig.Options
    _eventEmitter: EventEmitter
    constructor(options: CoreConfig.Options) {
        this._options = options
        this.init()
    }
    init() {
        this._eventEmitter = new EventEmitter(events)
        this._compile = new Compile({
            ...this._options.movieData,
            firstCompileCallback: this.LoadComplete.bind(this),
        })
        this._render = new Renderer({
            container: typeof this._options.container === "string" ? document.querySelector(this._options.container) as HTMLDivElement : this._options.container,
            videoWidth: this._options.videoWidth,
            videoHeight: this._options.videoHeight,
            loadingImage: this._options.loadingImage || "",
            pauseImage: this._options.pauseImage || "",
            replayImage: this._options.replayImage || "",
            subtitleStyle: this._options.movieData.scenes[0].subtitle?.style || {},
            updateNextNode: this.updateNextNode.bind(this),
            scenes: this._options.movieData.scenes,
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
            this._render.updateSceneBackground(this._compile._sceneBackground)
        }
        this._render._movie.stopLoading()
        this._render._movie._fps.start()
        if (!this._compile._currentFiberNode.head) {
            Promise.resolve().then(() => {
                this._render.play()
            })
        } else {
            this._render._movie.startPause()
            this._eventEmitter.emit("init")
        }
    }
    async updateNextNode() {
        const result = await this._compile.updateNextNode()
        if (result) {
            this.LoadComplete()
            this._eventEmitter.emit("switchScene")
        } else {
            this._render._movie.stopLoading()
            this._render._movie.startReplay()
            this._eventEmitter.emit("done")
        }
    }
    /**
     * 获取元素
     * */
    public getElement(name: string) {
        return this._render._movie._videoElement.findElement(name)
    }
    /**
    * 播放函数
    * @returns
    */
    public play() {
        const result = this._render._movie._animationLayer.findOne((element: Konva.Image) => element.name() === "done")
        if (result !== undefined) {
            console.warn("场景已播放完毕,请切换场景或者重新播放")
            return
        }
        this._render.play()
        this._render._movie.stopPause()
        this._eventEmitter.emit("play")
    }
    /**
    * 暂停
    * @returns
    */
    public pause() {
        this._render.pause()
        this._render._movie.startPause()
        this._eventEmitter.emit("pause")
    }
    /**
    * 更新场景
    * @returns
    */
    public update(options: CompileConfig.MovieData) {
        this._render._movie.dispose()
        this._render._movie.stopReplay()
        this._compile.init({
            ...options,
            firstCompileCallback: this.LoadComplete.bind(this),
        })
        this._eventEmitter.emit("update")
    }
    /**
     * 设置背景
     */
    public setSceneBackground(options: CompileConfig.SceneBackground) {
        this._render.updateSceneBackground(options)
    }
    /**
   * 获取/设置视频音量
   * @param volume 0-100
   * @returns
   */
    public videoVolume(volume?: number) {
        if (volume === undefined) {
            return this._render._movie._videoTarget.volume * 100
        } else {
            this._render._movie._videoTarget.volume = volume / 100
            this._compile.updateVideoVolume(volume)
            return this._render._movie._videoTarget.volume * 100
        }
    }
    /**
   * 获取/设置背景音乐音量
   * @param volume 0-100
   * @returns { number }
   */
    public backgroundVolume(volume?: number) {
        if (this._compile._backgroundAudios.length === 0) {
            console.warn("暂无背景音乐")
            return
        }
        if (volume === undefined) {
            return this._compile._backgroundAudios[0].volume
        } else {
            this._render._movie._backgroundAudio.updateVolume(volume)
            return this._compile._backgroundAudios[0].volume
        }
    }

    /**
   * 获取当前播放时间
   */
    public getCurrentTime(): number {
        let current: FiberFactory | undefined = this._compile._fiber
        let pastTime = 0
        while (current !== undefined) {
            if (current === this._compile._currentFiberNode) {
                // 查询到当前节点
                break
            }
            pastTime += current.currentData.video.endTime - current.currentData.video.startTime
            current = current.next
        }
        return pastTime + (this._render._movie._videoTarget.currentTime / 1000 - this._compile._currentFiberNode.currentData.video.startTime)
    }
    public replay() {
        this._render._movie.dispose()
        this._compile._currentFiberNode = this._compile._fiber as FiberFactory
        this._render.update(this._compile._playFiberNode)
        if (this._compile._currentFiberNode.head) {
            this._render.updateBackground(this._compile._backgroundAudios)
            this._render.updateVideoElement(this._compile._videoElement)
        }
        this.play()
        this._eventEmitter.emit("replay")
    }
    public on(event: string, callback: Function) {
        this._eventEmitter.on(event, callback)
    }
    public once(event: string, callback: Function) {
        this._eventEmitter.once(event, callback)
    }
    public off(event: string, callback: Function) {
        this._eventEmitter.off(event, callback)
    }
    public resize() {
        this._render.resize()
    }
}

export default Core
