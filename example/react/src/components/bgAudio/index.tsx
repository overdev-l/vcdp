import React, { useEffect, useRef, useState, } from "react"
import { Button, } from "antd"
import JSONEditor from "jsoneditor"
import { BgAudioProps, } from "../../types"
export default function (props: BgAudioProps) {
    const jsonContainer = useRef<HTMLDivElement>(null)
    const [ target, setTarget, ] = useState<JSONEditor>()
    useEffect(() => {
        const t = new JSONEditor(jsonContainer.current as HTMLDivElement, {})
        t.set(props.data)
        setTarget(t)
    }, [])
    return (
        <div className="sceneContainer">
            <Button type="primary" onClick={() => props.update(target?.get())}>更新背景音乐</Button>
            <div className="jsonContainer" ref={jsonContainer}></div>
        </div>
    )
}
