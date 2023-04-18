import { timeControllerOptions, } from "../types/time"
class timeController {
    private _options: timeControllerOptions.Options
    private _currentTime: number
    private _currentDuration: number
    private _totalDuration: number
    private _totalTime: number
    private _startTime: number
    private _status: "play" | "pause" | "stop"
    private _currentIndex: number
    constructor(options: timeControllerOptions.Options) {
        this._options = options
        this._totalDuration = options.scenes.reduce((pre, nex) => pre + nex.duration, 0)
        this._totalTime = 0
        this._currentTime = 0
        this._startTime = 0
        this._currentIndex = 0
        this._currentDuration = options.scenes[this._currentIndex].duration
    }

    private timer() {
        const t = Date.now()
        if (this._status === "play") {
            this._currentTime = t - this._startTime
            if (this._currentTime < this._currentDuration) {
                requestAnimationFrame(this.timer.bind(this))
            } else {
                this.updateNext()
            }
            
        }
    }
    private updateNext() {
        this.initTime()
        this._options.play()
    }
    private initTime() {
        this._totalTime += this._currentDuration
        this._currentDuration = this._options.scenes[this._currentIndex].duration
    }
    public play() {
        this._status = "play"
        this._startTime = Date.now()
        this.timer()
        this._options.play()
    }
    public pause() {
        this._status = "pause"
        this._currentDuration -= this._currentTime
        console.log(this._currentTime + this._totalDuration, "totalDuration")
        this._options.pause()
    }
    public stop() {
        this._status = "stop"
    }
}

export default timeController
