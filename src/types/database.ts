export type UserRole = 'lecturer' | 'student'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Course {
  id: string
  lecturer_id: string
  name: string
  description: string | null
  invite_code: string
  created_at: string
  updated_at: string
}

export interface CourseEnrollment {
  id: string
  course_id: string
  student_id: string
  enrolled_at: string
}

export interface Document {
  id: string
  course_id: string
  name: string
  file_type: string
  file_size: number
  storage_path: string
  uploaded_at: string
}

export interface DocumentChunk {
  id: string
  document_id: string
  course_id: string
  content: string
  chunk_index: number
  embedding: number[]
  created_at: string
}

export interface Conversation {
  id: string
  course_id: string
  student_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

