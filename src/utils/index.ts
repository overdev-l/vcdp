import { ListNode, NodeData } from "../types/compile";
import { parseSubtitle } from '../types'
export class ListNodeFactory {
  next: ListNode | null
  currentData: NodeData
  constructor(options: NodeData) {
    this.next = null
    this.currentData = options
  }
}


export function getCurrentTimeSubtitleText (videoCurrentTime: number, videoStartTime: number, subtitles: parseSubtitle[]) {
  const realTime = videoCurrentTime - videoStartTime
  return subtitles.find((subtitle) => subtitle.startSeconds< realTime && subtitle.endSeconds > realTime)
}