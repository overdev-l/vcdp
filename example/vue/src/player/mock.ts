
export const coverImageData = {
    type: 2,
    image: "https://image.liuyongzhi.cn/video/bg1.jpg",
    alpha: 100,
}

export const coverColorData = {
    type: 2,
    color: "#2399D7",
    alpha: 100,
}

export const backgroundColorData = {
    type: 1,
    source: "#93E9",
    alpha: 100,
}

export const backgroundImageData = {
    type: 2,
    source: "https://image.liuyongzhi.cn/video/pexels-3828%E2%80%8A%C3%97%E2%80%8A2552.jpg",
    alpha: 100,
}

export const elementsData = [
    {
        type: 1,
        text: "测试文字",
        name: "element1",
        style: {
            alpha: 90,
            color: "#2399D7",
            fontSize: 100,
            fontFamily: "微软雅黑",
            fontItalic: false,
            fontBold: true,
            align: "center",
            fontStoke: "#FFFB7D",
            fontStokeWidth: 10,
            backgroundColor: "#2BFF88",
            backgroundAlpha: 50,
            backgroundPadding: 20,
        },
        position: {
            x: 0,
            y: 0,
            z: 90,
        },
    },
    {
        type: 2,
        image: "https://image.liuyongzhi.cn/video/ai-draw.tokyo_en_.png",
        name: "element2",
        style: {
            alpha: 100,
        },
        position: {
            x: 1080,
            y: 900,
            z: 80,
            w: 200,
            h: 256,
        },
    },
]
export const voiceMusicData_51000ms = {
    audio: "https://image.liuyongzhi.cn/video/description.mp3",
    loop: false,
    startTime: 0,
    endTime: 51000,
    volume: 100,
    mute: false,
}

export const movieImageData = {
    type: 2,
    url: "https://image.liuyongzhi.cn/video/pexels-3456%E2%80%8A%C3%97%E2%80%8A5184.jpg",
}

export const movieVideoData1920_1080_9s = {
    type: 1,
    url: "https://image.liuyongzhi.cn/video/pexels-1920%E2%80%8A%C3%97%E2%80%8A1080-9s.mp4",
    volume: 100,
    loop: true,
    startTime: 5000,
    endTime: 9000,
    voice: voiceMusicData_51000ms,
    duration: 51000,
}
export const movieVideoData2160_3240_15s = {
    type: 1,
    url: "https://image.liuyongzhi.cn/video/pexels-2160%E2%80%8A%C3%97%E2%80%8A3240-15s.mp4",
    volume: 100,
    loop: true,
    startTime: 5000,
    endTime: 10000,
}


export const backgroundMusicData = [
    {
        audio: "https://image.liuyongzhi.cn/video/backgroundMusic_122000ms.mp3",
        loop: true,
        startTime: 0,
        endTime: 122000,
        volume: 100,
        mute: false,
    },
]
