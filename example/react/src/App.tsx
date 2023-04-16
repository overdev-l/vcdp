import React, {useEffect, useRef, useState,} from "react"
import "./index.less"
import "jsoneditor/dist/jsoneditor.min.css"
import "antd/dist/reset.css"
import data from "./mock/01.json"
import { CompileConfig, Core,} from "@happyPlayer"
import Tab from "./tabMenus"
import Scene from "./components/scene"
import BgAudio from "./components/bgAudio"
import SceneBg from "./components/sceneBackground"
import BroadcastControl from "./components/broadcastControl"
const App = () => {
    const Divider = useRef<HTMLDivElement>(null)
    const TopContainer = useRef<HTMLDivElement>(null)
    const BottomContainer = useRef<HTMLDivElement>(null)
    const Player = useRef<HTMLDivElement>(null)
    const [v, setV,] = useState<Core>()
    useEffect(() => {
        const V = new Core({
            container: Player.current as HTMLDivElement,
            movieData: data as CompileConfig.MovieData,
            videoHeight: 1080,
            videoWidth: 1920,
        })
        setV(V)
    }, [])

    const update = (data: CompileConfig.MovieData) => {
        v?.update(data)
    }
    const updateScene = (scene: CompileConfig.Scene[]) => {
        update({
            scenes: scene,
            backgroundAudios: data.backgroundAudios,
            sceneBackground: data.sceneBackground,
            elements: data.elements as CompileConfig.VideoElement[],
        })
    }
    const updateSceneBgAudio = (backgroundAudios: CompileConfig.BackgroundAudio[]) => {
        update({
            scenes: data.scenes,
            backgroundAudios: backgroundAudios,
            sceneBackground: data.sceneBackground,
            elements: data.elements as CompileConfig.VideoElement[],
        })
    }
    const updateSceneBg = (data: CompileConfig.SceneBackground) => {
        v?.setSceneBackground(data)
    }
    const play = () => {
        v?.play()
    }
    const pause = () => {
        v?.pause()
    }
    const replay = () => {
        v?.replay()
    }
    return (
        <div className="container">
            <div className="top layoutContainer" ref={TopContainer}>
                <div className="topLeft">
                    <Tab
                        Scene={Scene}
                        SceneData={data.scenes}
                        updateScene={updateScene}
                        BgAudio={BgAudio}
                        BgAudioData={data.backgroundAudios}
                        updateSceneBgAudio={updateSceneBgAudio}
                        SceneBg={SceneBg}
                        SceneBgData={data.sceneBackground}
                        updateSceneBackground={updateSceneBg}
                        Broadcast={BroadcastControl}
                        play={play}
                        pause={pause}
                        replay={replay}
                    />
                </div>
                <div className="topDivider"></div>
                <div className="topRight">
                    <div className="player" ref={Player}></div>
                </div>
            </div>
            <div className="divider" ref={Divider}/>
            <div className="button layoutContainer" ref={BottomContainer}></div>
        </div>
    )
}

export default App
