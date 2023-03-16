import Konva from "konva"
import { IFrame, } from "konva/lib/types"
import { AudioConfig, CompileConfig, Fiber, Movie, } from "../types"
import { getCurrentTimeSubtitleText } from "../utils"
export class MovieRender {
    _options: Movie.Options
    _stage: Konva.Stage
    _mediaLayer: Konva.Layer
    _subtitleLayer: Konva.Layer
    _animationLayer: Konva.Layer
    _fps: Konva.Animation
    _loadingAnimation: Konva.Animation
    _canvasScale: number
    _videoTarget: HTMLVideoElement
    _imageCurrent: Konva.Image
    _loadingTarget: HTMLImageElement
    _loadingCurrent: Konva.Image
    _videoEvents: Movie.VideoEvents[]
    _subtitleLabel: Konva.Label
    _subtitleTab: Konva.Tag
    _subtitleText: Konva.Text
    _subtitleData: Fiber.Subtitle
    _videoData: Movie.VideoOptions
    constructor(options: Movie.Options) {
        this._options = options
        this._canvasScale = 1
        this._videoTarget = document.createElement("video")
        this._loadingTarget = document.createElement("img")
        this._videoEvents = [
            {
                eventName: "loadedmetadata",
                callbacks: [this.resetImage.bind(this),],
            },
            {
                eventName: "timeupdate",
                callbacks: [this.initSubtitle.bind(this)],
            },
        ]
        this._stage = new Konva.Stage({
            container: options.container,
            width: options.width,
            height: options.height,
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
        this._imageCurrent = new Konva.Image({
            image: this._videoTarget,
            x: 0,
            y: 0,
        })
        this._subtitleLabel = new Konva.Label({
            x: 0,
            y: 0,
        })
        this._subtitleTab = new Konva.Tag()
        this._subtitleText = new Konva.Text({
            verticalAlign: "middle",
            lineHeight: 1.2,
            padding: 10,
            ...options.subtitleStyle
        })
        this._loadingCurrent = new Konva.Image({
            name: "loading",
            image: this._loadingTarget,
        })
        this._subtitleLabel.add(this._subtitleTab)
        this._subtitleLabel.add(this._subtitleText)
        this._subtitleLayer.add(this._subtitleLabel)
        this._stage.add(this._mediaLayer)
        this._stage.add(this._subtitleLayer)
        this._stage.add(this._animationLayer)
        this._fps = new Konva.Animation(() => {
            // 
        }, this._mediaLayer)
        this._loadingAnimation = new Konva.Animation(this.initLoadingAnimation.bind(this), this._animationLayer)
        this.initScale()
        this.initLayer()
        this.initVideoEvent()
        this.initLoading()
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
        const videoBackground = new Konva.Rect({
            width: this._options.videoWidth,
            height: this._options.videoHeight,
            x: 0,
            y: 0,
            fill: "#000000",
        })
        this._mediaLayer.add(videoBackground)
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
    videoEventCallback(callbacks: (() => void)[], name: string) {
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
            y: this._options.videoHeight/ 2,
        })
    }
    initSubtitle() {
        const currentTime = this._videoTarget.currentTime
        const currentSubtitleData = getCurrentTimeSubtitleText(currentTime, this._videoData.startTime, this._subtitleData.source)
        if (!currentSubtitleData) return
        const { text } = currentSubtitleData
        this._subtitleText.text(text)
    }
    initLoading() {
        this._loadingTarget.src = this._options.loadingImage
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
    initLoadingAnimation(frame:IFrame | undefined) {
        const speed = 100
        if (frame !== undefined) {
            const angleDiff = frame.timeDiff * speed / 1000
            this._loadingCurrent.rotate(angleDiff)
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

    public updateDub(options: CompileConfig.Dub) {}

    public updateBackgroundAudio(options: AudioConfig.Result[]) {}

    public updateDubAudio(options: AudioConfig.Result[]) {}
}
