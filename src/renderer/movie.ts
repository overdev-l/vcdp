import Konva from "konva"
import { IFrame, } from "konva/lib/types"
import { AudioConfig, CompileConfig, Fiber, Movie, } from "../types"
import { getCurrentTimeSubtitleText, } from "../utils"
import { defaultSceneBackground, } from "../utils/config"
import { AudioRender, } from "./audio"
import { debounce, DebouncedFunc, merge, } from "lodash-es"
import { Element, } from "./element"
import LoadingImage from "../assets/loading.svg"
import PauseImage from "../assets/pause.svg"
import ReplayImage from "../assets/replay.svg"
export class MovieRender {
    _options: Movie.Options
    _stage: Konva.Stage
    _mediaLayer: Konva.Layer
    _subtitleLayer: Konva.Layer
    _animationLayer: Konva.Layer
    _elementsLayer: Konva.Layer
    _sceneBackgroundLayer: Konva.Layer
    _fps: Konva.Animation
    _loadingAnimation: Konva.Animation
    _mediaAnimation: Konva.Animation
    _elementAnimation: Konva.Animation
    _canvasScale: number
    _videoTarget: HTMLVideoElement
    _imageCurrent: Konva.Image
    _loadingTarget: HTMLImageElement
    _loadingCurrent: Konva.Image
    _pauseTarget: HTMLImageElement
    _pauseCurrent: Konva.Image
    _replayTarget: HTMLImageElement
    _replayCurrent: Konva.Image
    _videoEvents: Movie.VideoEvents[]
    _subtitleLabel: Konva.Label
    _subtitleTab: Konva.Tag
    _subtitleText: Konva.Text
    _subtitleData: Fiber.Subtitle
    _videoData: Movie.VideoOptions
    _backgroundAudio: AudioRender
    _dubAudio: AudioRender
    _videoElement: Element
    _debounceSwitchScene: DebouncedFunc<() => void>
    _duration: number
    _sceneDuration: number
    _sceneBackgroundRect: Konva.Rect
    _startTime: number
    constructor(options: Movie.Options) {
        this._options = options
        this._canvasScale = 1
        this._videoTarget = document.createElement("video")
        this._loadingTarget = document.createElement("img")
        this._pauseTarget = document.createElement("img")
        this._replayTarget = document.createElement("img")
        this._videoEvents = [
            {
                eventName: "loadedmetadata",
                callbacks: [this.resetImage.bind(this),],
            },
            {
                eventName: "timeupdate",
                callbacks: [this.initSubtitle.bind(this),],
            },
            {
                eventName: "play",
                callbacks: [this.startMediaAnimation.bind(this),],
            },
            {
                eventName: "pause",
                callbacks: [this.stopMediaAnimation.bind(this),],
            },
            {
                eventName: "ended",
                callbacks: [this.stopMediaAnimation.bind(this),],
            },
        ]
        this._stage = new Konva.Stage({
            container: options.container,
            width: options.width,
            height: options.height,
        })
        this._sceneBackgroundLayer = new Konva.Layer({
            name: "sceneBackgroundLayer",
        })
        this._mediaLayer = new Konva.Layer({
            name: "mediaLayer",
        })
        this._subtitleLayer = new Konva.Layer({
            name: "subtitleLayer",
        })
        this._animationLayer = new Konva.Layer({
            name: "animationLayer",
        })
        this._elementsLayer = new Konva.Layer({
            name: "elementsLayer",
        })
        this._imageCurrent = new Konva.Image({
            image: this._videoTarget,
            x: 0,
            y: 0,
        })
        this._subtitleLabel = new Konva.Label({
            x: options.subtitleStyle.x || 0,
            y: options.subtitleStyle.y || 0,
        })
        this._sceneBackgroundRect = new Konva.Rect({
            width: options.videoWidth,
            height: options.videoHeight,
            x: 0,
            y: 0,
        })
        this._sceneBackgroundLayer.add(this._sceneBackgroundRect)
        this._subtitleTab = new Konva.Tag()
        this._subtitleText = new Konva.Text({
            verticalAlign: "middle",
            lineHeight: 1.2,
            ...options.subtitleStyle,
            padding: (options.subtitleStyle.padding || 10) + (options.subtitleStyle.strokeWidth || 0),
            x: 0,
            y: 0,
            wrap: "word",

        })
        this._loadingCurrent = new Konva.Image({
            name: "loading",
            image: this._loadingTarget,
        })
        this._pauseCurrent = new Konva.Image({
            name: "pause",
            image: this._pauseTarget,
        })
        this._replayCurrent = new Konva.Image({
            name: "done",
            image: this._replayTarget,
        })
        this._subtitleLabel.add(this._subtitleTab)
        this._subtitleLabel.add(this._subtitleText)
        this._subtitleLayer.add(this._subtitleLabel)
        this._stage.add(this._sceneBackgroundLayer)
        this._stage.add(this._mediaLayer)
        this._stage.add(this._subtitleLayer)
        this._stage.add(this._animationLayer)
        this._stage.add(this._elementsLayer)
        this._fps = new Konva.Animation(() => {
            //
        }, this._mediaLayer)

        this._loadingAnimation = new Konva.Animation(this.initLoadingAnimation.bind(this), this._animationLayer)
        this._mediaAnimation = new Konva.Animation(this.initMediaAnimation.bind(this), this._mediaLayer)
        this._debounceSwitchScene = debounce(this.switchScene.bind(this), 100, {
            leading: true,
            trailing: false,
        })
        this.initScale()
        this.initLayer()
        this.initVideoEvent()
        this.initLoading()
        this.initPause()
        this.initReplay()
    }
    initTimer() {
        if (Date.now() - this._startTime >= this._duration) {
            this._options.updateNextNode()
        } else {
            this.initSubtitle()
            requestAnimationFrame(this.initTimer.bind(this))
        }
    }
    initScale() {
        const { clientWidth, clientHeight, } = this._options.container
        const scaleX = clientWidth / this._options.videoWidth
        const scaleY = clientHeight / this._options.videoHeight
        this._canvasScale = Math.min(scaleX, scaleY)
    }
    initVideoScale(videoWidth: number, videoHeight: number) {
        const containerWidth = this._options.videoWidth
        const containerHeight = this._options.videoHeight
        const containerRatio = containerWidth / containerHeight
        const videoRatio = videoWidth / videoHeight
        let scale = 1
        if (containerRatio > videoRatio) {
            scale = containerHeight / videoHeight
        } else {
            scale = containerWidth / videoWidth
        }
        return scale
    }
    initLayer() {
        this._sceneBackgroundLayer.setPosition({
            x: this._stage.width() / 2 - this._options.videoWidth * this._canvasScale / 2,
            y: this._stage.height() / 2 - this._options.videoHeight * this._canvasScale / 2,
        }).scale({
            x: this._canvasScale,
            y: this._canvasScale,
        })
        this._mediaLayer.setPosition({
            x: this._stage.width() / 2 - this._options.videoWidth * this._canvasScale / 2,
            y: this._stage.height() / 2 - this._options.videoHeight * this._canvasScale / 2,
        }).scale({
            x: this._canvasScale,
            y: this._canvasScale,
        })
        this._subtitleLayer.setPosition({
            x: this._stage.width() / 2 - this._options.videoWidth * this._canvasScale / 2,
            y: this._stage.height() / 2 - this._options.videoHeight * this._canvasScale / 2,
        }).scale({
            x: this._canvasScale,
            y: this._canvasScale,
        })
        this._animationLayer.setPosition({
            x: this._stage.width() / 2 - this._options.videoWidth * this._canvasScale / 2,
            y: this._stage.height() / 2 - this._options.videoHeight * this._canvasScale / 2,
        }).scale({
            x: this._canvasScale,
            y: this._canvasScale,
        })
        this._elementsLayer.setPosition({
            x: this._stage.width() / 2 - this._options.videoWidth * this._canvasScale / 2,
            y: this._stage.height() / 2 - this._options.videoHeight * this._canvasScale / 2,
        }).scale({
            x: this._canvasScale,
            y: this._canvasScale,
        })
        this._mediaLayer.add(this._imageCurrent)
    }
    initVideoEvent() {
        for (let i = 0; i < this._videoEvents.length; i++) {
            this._videoTarget.addEventListener(
                this._videoEvents[i].eventName,
                this.videoEventCallback.bind(this, this._videoEvents[i].callbacks, this._videoEvents[i].eventName)
            )
        }
    }
    
    initBackground(bgAudio: AudioConfig.Result[]) {
        this._backgroundAudio = new AudioRender(bgAudio)
    }
    initDub(dubAudio: AudioConfig.Result[]) {
        this._dubAudio = new AudioRender(dubAudio)
    }
    initVideoElements(options: CompileConfig.VideoElement[]) {
        if (this._videoElement) {
            this._videoElement.dispose()
        }
        this._videoElement = new Element(options, this._elementsLayer, this._options.videoHeight, this._options.videoWidth, this._canvasScale)
    }
    initSceneBackground(options?: CompileConfig.SceneBackground) {
        const sceneOptions: CompileConfig.SceneBackground = {
            type: 1,
            source: "",
            alpha: 1,
        }
        if (!options) {
            sceneOptions.source = defaultSceneBackground
        }else {
            merge(sceneOptions, options)
        }
        this.initMoveBackground(sceneOptions)
    }
    initMoveBackground(options: CompileConfig.SceneBackground) {
        if (options.type === 1) {
            this._sceneBackgroundRect.fill(options.source)
            this._sceneBackgroundRect.alpha(options.alpha)
        } else if(options.type === 2) {
            const image = new Image()
            image.src = options.source
            image.onload = () => {
                this._sceneBackgroundRect.fillPatternImage(image)
                this._sceneBackgroundRect.alpha(options.alpha)
                this._sceneBackgroundRect.fillPatternX(this._sceneBackgroundRect.width() / 2)
                this._sceneBackgroundRect.fillPatternY(this._sceneBackgroundRect.height() / 2)
                this._sceneBackgroundRect.fillPatternRepeat("no-repeat")
                this._sceneBackgroundRect.fillPatternOffset({
                    x: image.width / 2,
                    y: image.height / 2,
                })
                const scale = this.initVideoScale(image.width, image.height)
                this._sceneBackgroundRect.fillPatternScale({
                    x: scale,
                    y: scale,
                })
            }
        }
    }
    videoEventCallback(callbacks: (() => void)[],) {
        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i]()
        }
    }
    resetImage() {
        const videoScale = this.initVideoScale(this._videoTarget.videoWidth, this._videoTarget.videoHeight)
        this._imageCurrent.width(this._videoTarget.videoWidth * videoScale)
        this._imageCurrent.height(this._videoTarget.videoHeight * videoScale)
        this._imageCurrent.offset({
            x: this._imageCurrent.width() / 2,
            y: this._imageCurrent.height() / 2,
        })
        this._imageCurrent.setPosition({
            x: this._options.videoWidth / 2,
            y: this._options.videoHeight / 2,
        })
    }
    initSubtitle() {
        const currentTime = this._videoTarget.currentTime
        const currentSubtitleData = getCurrentTimeSubtitleText(currentTime, this._videoData.startTime, this._subtitleData.source)
        if (!currentSubtitleData) return
        const { text, } = currentSubtitleData
        this._subtitleText.text(text)
        this.initSubtitlePosition()
    }
    startMediaAnimation() {
        this._mediaAnimation.start()
    }
    stopMediaAnimation() {
        this._mediaAnimation.stop()
    }
    initSubtitlePosition() {
        this._subtitleLabel?.offset({
            x: this._subtitleText.width() / 2,
            y: this._subtitleText.height() / 2,
        })
        this._subtitleLabel.scale({
            x: this._canvasScale,
            y: this._canvasScale,
        })
        const textWidth = this._subtitleText.width()
        const textHeight = this._subtitleText.height()
        const maxWidth = this._options.videoWidth
        const maxHeight = this._options.videoHeight
        const styleX = this._subtitleData.style.x || 0
        const styleY = this._subtitleData.style.y || 0
        this._subtitleLabel?.setPosition({
            x: Math.max(textWidth / 2, Math.min(styleX, maxWidth - textWidth / 2)),
            y: Math.max(textHeight / 2, Math.min(styleY, maxHeight - textHeight / 2)),
        })
        if (textWidth > maxWidth) {
            this._subtitleText.width(maxWidth)
        }
    }
    validateNextNode() {
        const currentTime = this._videoTarget.currentTime * 1000
        if (currentTime >= this._videoData.endTime) {
            // 是否要循环播放当前素材
        }
    }
    switchScene() {
        this._backgroundAudio.pause()
        this._videoTarget.pause()
        this._options.updateNextNode()
    }
    initLoading() {
        this._loadingTarget.src = this._options.loadingImage || LoadingImage
        this._loadingTarget.onload = () => {
            this._loadingCurrent.width(100)
            this._loadingCurrent.height(100)
            this._loadingCurrent.setPosition({
                x: this._options.videoWidth / 2,
                y: this._options.videoHeight / 2,
            })
            this._loadingCurrent.offset({
                x: this._loadingCurrent.width() / 2,
                y: this._loadingCurrent.height() / 2,
            })
            this.startLoading()
        }
    }
    initPause() {
        this._pauseTarget.src = this._options.pauseImage || PauseImage
        this._pauseTarget.onload = () => {
            this._pauseCurrent.width(100)
            this._pauseCurrent.height(100)
            this._pauseCurrent.setPosition({
                x: this._options.videoWidth / 2,
                y: this._options.videoHeight / 2,
            })
            this._pauseCurrent.offset({
                x: this._loadingCurrent.width() / 2,
                y: this._loadingCurrent.height() / 2,
            })
        }
    }
    initReplay() {
        this._replayTarget.src = this._options.replayImage || ReplayImage
        this._replayTarget.onload = () => {
            this._replayCurrent.width(100)
            this._replayCurrent.height(100)
            this._replayCurrent.setPosition({
                x: this._options.videoWidth / 2,
                y: this._options.videoHeight / 2,
            })
            this._replayCurrent.offset({
                x: this._loadingCurrent.width() / 2,
                y: this._loadingCurrent.height() / 2,
            })
        }
    }
    initLoadingAnimation(frame: IFrame | undefined) {
        const speed = 100
        if (frame !== undefined) {
            const angleDiff = frame.timeDiff * speed / 1000
            this._loadingCurrent.rotate(angleDiff)
        }
    }
    initMediaAnimation(frame: IFrame | undefined) {
        if (frame !== undefined) {
            // console.log(frame, "mediaAnimation")
        }
    }
    public stopLoading() {
        this._loadingAnimation.stop()
        this._loadingCurrent.remove()
    }
    public startLoading() {
        this._animationLayer.add(this._loadingCurrent)
        this._loadingAnimation.start()
    }
    public stopPause() {
        this._loadingAnimation.stop()
        this._pauseCurrent.remove()
    }
    public startPause() {
        this._animationLayer.add(this._pauseCurrent)
        this._loadingAnimation.start()
    }
    public stopReplay() {
        this._loadingAnimation.stop()
        this._replayCurrent.remove()
    }
    public startReplay() {
        this._animationLayer.add(this._replayCurrent)
        this._loadingAnimation.start()
    }
    public updateVideo(options: Movie.VideoOptions) {
        this._videoData = options
        this._videoTarget.src = options.source
        this._videoTarget.muted = options.mute
        this._videoTarget.volume = options.volume / 100
        this._videoTarget.currentTime = options.startTime / 1000
    }
    public updateSubtitleSource(options: Fiber.Subtitle) {
        this._subtitleData = options
    }


    public updateBackgroundAudio(options: AudioConfig.Result[]) {
        this.initBackground(options)
    }
    public updateVideoElement(options: CompileConfig.VideoElement[]) {
        this.initVideoElements(options)
    }
    public updateDubbing(options: AudioConfig.Result[]) {
        this.initDub(options)
    }
    public dispose() {
        this._animationLayer.clear()
        this._mediaLayer.clear()
        this._subtitleLayer.clear()
        this._backgroundAudio.dispose()
        this._elementsLayer.clear()
    }

}
