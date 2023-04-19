import { AudioConfig, CompileConfig, Fiber, Render, } from "../types"
import { MovieRender, } from "./movie"
import TimeController from "../core/timeController"
export class Renderer {
    _options: Render.Options
    _movie: MovieRender
    _timeController: TimeController
    constructor(options: Render.Options) {
        this._options = options
        this._movie = new MovieRender({
            container: options.container,
            videoHeight: options.videoHeight,
            videoWidth: options.videoWidth,
            width: options.container.clientWidth,
            height: options.container.clientHeight,
            loadingImage: options.loadingImage,
            pauseImage: options.pauseImage,
            replayImage: options.replayImage,
            subtitleStyle: options.subtitleStyle,
        })
        this._timeController = new TimeController({
            scenes: options.scenes,
            pause: this.moviePause.bind(this),
            play: this.movieStart.bind(this),
            updateNext: options.updateNextNode.bind(this),
        })
    }
    public update(playFiberNode: Fiber.PlayFiberNode) {
        this._movie.updateVideo(playFiberNode.video)
        this._movie.updateSubtitleSource(playFiberNode.subtitle)
        if (playFiberNode.dub) {
            this._movie.updateDubbing([{
                ...playFiberNode.dub,
                loop: false,
                mute: playFiberNode.dub.mute || false,
            },])
        }
    }
    public updateBackground(bgAudio: AudioConfig.Result[]) {
        this._movie.updateBackgroundAudio(bgAudio)
    }
    public updateVideoElement(elements: CompileConfig.VideoElement[]) {
        this._movie.updateVideoElement(elements)
    }
    public updateDubbing(dubbing: AudioConfig.Result[]) {
        this._movie.updateDubbing(dubbing)
    }
    public updateSceneBackground(sceneBackground: CompileConfig.SceneBackground){
        this._movie.initSceneBackground(sceneBackground)
    }
    public play(){
        this._timeController.play()
    }
    public pause(){
        this._timeController.pause()
    }
    private movieStart() {
        this._movie._backgroundAudio.play()
        this._movie._dubAudio.play()
        this._movie._videoTarget.play()
    }
    private moviePause() {
        this._movie._backgroundAudio.pause()
        this._movie._dubAudio.pause()
        this._movie._videoTarget.pause()
    }
}
