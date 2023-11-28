export interface AnnotationItem {
  id?: number
  time: number
  icon: string
  comment: string
  author?: number
  record?: number
}
export interface AnnotationList extends Record<number, AnnotationItem[]> {}