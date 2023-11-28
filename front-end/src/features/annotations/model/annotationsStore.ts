import { ref } from 'vue'
import { defineStore } from "pinia"
import type { AnnotationItem, AnnotationList } from '@/features/annotations/model/types'

export const useAnnotationsStore = defineStore('annotationsStore', () => {
  const annotationList = ref<AnnotationList>([])

  function setAnnotations(id: number, data: AnnotationItem[]): void {
    annotationList.value[id] = data
  }
  function addAnnotation(id: number, anno: AnnotationItem): void {
    annotationList.value[id].push(anno)
  }
  function clearList(id: number): void {
    annotationList.value[id] = []
  }

  return {
    clearList,
    annotationList,
    setAnnotations,
    addAnnotation,
  }
})