<template>
    <div class="w-full h-full">
        <div class="w-full h-[50%] flex">
            <div class="w-[50%] h-full box-border flex-col gap-6 p-[1.25rem] overflow-y-scroll">
                <div class="h-full flex flex-col gap-6">
                    <div class="flex justify-between">
                        <Button label="Play" severity="help" icon="pi pi-play" raised rounded @click="play" />
                        <Button label="Pause" severity="help" icon="pi pi-pause" raised rounded @click="pause" />
                    </div>
                    <div class="flex justify-between">
                        <Button label="Update Scenes" severity="help" icon="pi pi-sync" raised rounded @click="pause" />
                    </div>
                    <div class="flex gap-6 h-[40px] items-center  justify-between">
                        <Badge :value="refs.videoVolume" class="flex1"></Badge>
                        <Slider v-model="refs.videoVolume" class="w-14rem w-[60%]" />
                        <Button label="Set Video Volume" icon="pi pi-cog" raised rounded class="w-[30%]"
                                @click="setVideoVolume" />
                    </div>
                    <div class="flex gap-6 h-[40px] items-center justify-between">
                        <Badge :value="refs.backgroundVolume" class="flex1"></Badge>
                        <Slider v-model="refs.backgroundVolume" class="w-14rem w-[60%]" />
                        <Button label="Set Background Volume" icon="pi pi-cog" raised rounded class="w-[30%]"
                                @click="setBackgroundVolume" />
                    </div>
                    <div class="flex gap-6 h-[40px] items-center  justify-between">
                        <Badge :value="refs.voiceVolume" class="flex1"></Badge>
                        <Slider v-model="refs.voiceVolume" class="w-14rem w-[60%]" />
                        <Button label="Set Voice Volume" icon="pi pi-cog" raised rounded class="w-[30%]"
                                @click="setVoiceVolume" />
                    </div>
                    <div class="flex gap-6 h-[40px] items-center  justify-between">
                        <div class="p-inputgroup">
                            <Button label="Remove Elements" severity="help" icon="pi pi-trash" raised
                                    @click="removeElements" />
                            <InputText placeholder="Element Name" class="p-inputtext-sm" v-model="refs.elementNames" />
                        </div>
                        <Button label="Add elements" severity="help" icon="pi pi-plus" raised rounded
                                @click="addElements" />
                    </div>
                    <div class="flex gap-6 h-[40px] items-center  justify-between">
                        <Button label="Set Background Music" severity="help" icon="pi pi-plus" raised rounded
                                @click="setBackgroundMusic" />
                    </div>
                </div>
            </div>
            <div class="w-[50%] h-full box-border" id="player"></div>
        </div>
        <div class="w-full h-[50%] flex">
            <div class="flex-1 h-full box-border">
                <TabView class="w-full h-full flex flex-col">
                    <TabPanel header="Scenes">
                        <div class="w-full h-full" ref="ScenesRef"></div>
                    </TabPanel>
                    <TabPanel header="Background Music">
                        <div class="w-full h-full" id="BackgroundMusic" ref="BackgroundMusicRef"></div>
                    </TabPanel>
                    <TabPanel header="Elements">
                        <div class="w-full h-full" id="Elements" ref="ElementsRef"></div>
                    </TabPanel>
                </TabView>
            </div>
            <div class="flex-1 h-full box-border p-[1.25rem]">
                <ProgressBar :value="refs.progress" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import Data01 from './01.json'
import Button from "primevue/button"
import InputText from 'primevue/inputtext';
import Slider from 'primevue/slider';
import Badge from 'primevue/badge';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ProgressBar from 'primevue/progressbar';
import { elementsData, backgroundImageData, movieVideoData1920_1080_9s, movieVideoData2160_3240_15s, backgroundMusicData } from './mock'
import JSONEditor from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.min.css'
import {CompileConfig, Core} from "@happyPlayer"
const refs = reactive<any>({
    render: null,
    videoVolume: 100,
    backgroundVolume: 100,
    voiceVolume: 100,
    progress: 50,
    ScenesEditor: undefined,
    BackgroundMusicEditor: undefined,
    ElementsEditor: undefined,
    elementNames: elementsData.map(item => item.name).join(','),
})
const ScenesRef = ref<HTMLElement>()
const BackgroundMusicRef = ref<HTMLElement>()
const ElementsRef = ref<HTMLElement>()


const initCore = () => {
    refs.render = new Core({
        container: "#player",
        movieData: Data01,
        videoHeight: 1920,
        videoWidth: 1080,
    })
}
const initEvent = () => {
    window.addEventListener("resize", () => {
        refs.render.resize()
    })
}
const initScenesJsonEditor = () => {
    refs.ScenesEditor = new JSONEditor(ScenesRef.value as HTMLElement, {
        mode: "form",
        language: "en"
    }, [movieVideoData1920_1080_9s, movieVideoData2160_3240_15s, movieVideoData1920_1080_9s, movieVideoData2160_3240_15s])
}
const initBackgroundMusicJsonEditor = () => {
    refs.BackgroundMusicEditor = new JSONEditor(BackgroundMusicRef.value as HTMLElement, {
        mode: "form",
        language: "en"
    }, backgroundMusicData)
}
const initElementsJsonEditor = () => {
    refs.ElementsEditor = new JSONEditor(ElementsRef.value as HTMLElement, {
        mode: "form",
        language: "en"
    }, elementsData)
}
const play = () => {
    refs.render.play()
}
const pause = () => {
    refs.render.pause()
}
const setVideoVolume = () => {
    refs.render.setVideoVolume(refs.videoVolume)
}
const setBackgroundVolume = () => {
    refs.render.setBackgroundMusicAudioVolume(refs.backgroundVolume)
}
const setVoiceVolume = () => {
    refs.render.setVoiceMusicAudioVolume(refs.voiceVolume)
}
const addElements = () => {
    refs.render.addElements(refs.ElementsEditor.get())
}
const removeElements = () => {
    const elementNames = refs.elementNames.split(",")
    refs.render.removeElements(elementNames)
}
const setBackgroundMusic = () => {
    refs.render.setBackgroundAudios(refs.BackgroundMusicEditor.get())
}
onMounted(initScenesJsonEditor)
onMounted(initBackgroundMusicJsonEditor)
onMounted(initElementsJsonEditor)
onMounted(initCore)
onMounted(initEvent)
</script>

<style>
.p-tabview-panels {
    flex: 1;
}

.p-tabview-panel {
    height: 100%;
}
</style>
