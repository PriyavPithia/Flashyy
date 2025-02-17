export type Profile = {
  id: string
  email: string
  created_at: string
}

export type Group = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export type Flashcard = {
  id: string
  group_id: string
  user_id: string
  question: string
  answer: string
  created_at: string
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          question: string
          answer: string
          group_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          group_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          group_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}