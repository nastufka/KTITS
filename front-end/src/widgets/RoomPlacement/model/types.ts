export interface Attachment {
  id?: number
  author?: number
  file?: string
  marker_attachment?: MarkerAttachment[],
  blob?: any
}

export interface MarkerAttachment {
  id: number
  attachment: number
  top: number
  left: number
  name?: string
}