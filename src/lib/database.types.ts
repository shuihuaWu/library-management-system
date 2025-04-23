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
      authors: {
        Row: {
          id: number
          name: string
          biography: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          biography?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          biography?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          id: number
          title: string
          author_id: number
          category_id: number
          isbn: string | null
          publisher: string | null
          publication_date: string | null
          description: string | null
          cover_image_url: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          author_id: number
          category_id: number
          isbn?: string | null
          publisher?: string | null
          publication_date?: string | null
          description?: string | null
          cover_image_url?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          author_id?: number
          category_id?: number
          isbn?: string | null
          publisher?: string | null
          publication_date?: string | null
          description?: string | null
          cover_image_url?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_author_id_fkey"
            columns: ["author_id"]
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      borrow_records: {
        Row: {
          id: number
          book_id: number
          user_id: string
          borrow_date: string
          due_date: string
          return_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          book_id: number
          user_id: string
          borrow_date: string
          due_date: string
          return_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          book_id?: number
          user_id?: string
          borrow_date?: string
          due_date?: string
          return_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "borrow_records_book_id_fkey"
            columns: ["book_id"]
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_records_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 