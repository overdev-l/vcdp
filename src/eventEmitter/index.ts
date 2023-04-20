export class EventEmitter {
    _events: string[] = []
    _eventsMap: Map<string, Function[]> = new Map()
    constructor(events: string[]) {
        this._events = events
        this.init()
    }
    init() {
        this._events.forEach((eventName) => {
            this._eventsMap.set(eventName, [])
        })
    }
    on(eventName: string, callback: Function) {
        if (!this._eventsMap.has(eventName)) {
            console.error(`事件${eventName}不存在`)
            return
        }
        const callbacks = this._eventsMap.get(eventName)
        callbacks!.push(callback)
    }
    off(eventName: string, callback: Function) {
        if (!this._eventsMap.has(eventName)) {
            console.error(`事件${eventName}不存在`)
            return
        }
        const callbacks = this._eventsMap.get(eventName)
        const index = callbacks!.indexOf(callback)
        if (index > -1) {
            callbacks!.splice(index, 1)
        }
    }
    emit<T>(eventName: string, args: T) {
        if (!this._eventsMap.has(eventName)) {
            console.error(`事件${eventName}不存在`)
            return
        }
        const callbacks = this._eventsMap.get(eventName)
        callbacks!.forEach((callback) => {
            callback(args)
        })
    }
    once(eventName: string, callback: Function) {
        const onceCallback = (...args: any[]) => {
            callback(...args)
            this.off(eventName, onceCallback)
        }
        this.on(eventName, onceCallback)
    }
}
