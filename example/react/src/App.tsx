import React, {useEffect, useRef, useState,} from "react"
import "./index.less"
import "jsoneditor/dist/jsoneditor.min.css"
import "antd/dist/reset.css"
import data from "./mock/01.json"
import { CompileConfig, Core,} from "@happyPlayer"
import Scene from "./components/scene/scene"
import BgAudio from "./components/bgAudio"
import SceneBg from "./components/sceneBackground"
import BroadcastControl from "./components/controls"
import Element from "./components/element"
import TabMenus from "./components/tabs"
const App = () => {
    const Divider = useRef<HTMLDivElement>(null)
    const TopContainer = useRef<HTMLDivElement>(null)
    const TopLeft = useRef<HTMLDivElement>(null)
    const BottomContainer = useRef<HTMLDivElement>(null)
    const Player = useRef<HTMLDivElement>(null)
    const [v, setV,] = useState<Core>()
  

    useEffect(() => {
        if (!Player.current) return
        const V = new Core({
            container: "#Player",
            movieData: data as CompileConfig.MovieData,
            videoHeight: 1920,
            videoWidth: 1080,
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
    const updateElement = (data: CompileConfig.VideoElement[]) => {
        console.log(data)
    }
    const handleMouseDown = () => {
        document.addEventListener("mousemove", handleMouseMoveY)
        document.addEventListener("mouseup", handleMouseUpY)
    }
    const handleMouseMoveY = (event: { clientY: React.SetStateAction<number> }) => {
        TopContainer.current!.style!.height = event.clientY + "px"
    }
    
    const handleMouseUpY = () => {
        document.removeEventListener("mousemove", handleMouseMoveY)
        document.removeEventListener("mouseup", handleMouseUpY)
    }

    const handleMouseCenter = () => {
        document.addEventListener("mousemove", handleMouseMoveX)
        document.addEventListener("mouseup", handleMouseUpX)
    }
    
    const handleMouseMoveX = (event: { clientX: string | number }) => {
        if(event.clientX < "630" || event.clientX > "957") return
        TopLeft.current!.style!.flex = "none"
        TopLeft.current!.style!.width = event.clientX + "px"
        console.log(TopLeft.current!.style!.width)
    }
    
    const handleMouseUpX = () => {
        document.removeEventListener("mousemove", handleMouseMoveX)
        document.removeEventListener("mouseup", handleMouseUpX)
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
                <div className="topLeft"   ref={TopLeft}>
                    <TabMenus
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
                        Element={Element}
                        ElementData={data.elements as CompileConfig.VideoElement[]}
                        updateElement={updateElement}
                        play={play}
                        pause={pause}
                        replay={replay}
                    />
                </div>
                <div className="topDivider" onMouseDown={handleMouseCenter}></div>
                <div className="topRight">
                    <div className="player" ref={Player} id="Player"></div>
                </div>
            </div>
            <div className="divider" onMouseDown={handleMouseDown} ref={Divider}/>
            <div className="button layoutContainer" ref={BottomContainer}></div>
        </div>
    )
}

export default App
