export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; slug: string; description: string | null; sort_order: number; active: boolean; created_at: string };
        Insert: { id?: string; name: string; slug: string; description?: string | null; sort_order?: number; active?: boolean; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      courses: {
        Row: { id: string; title: string; slug: string; excerpt: string; description: string | null; category_id: string | null; trainer_id: string | null; cover_url: string | null; format: string; status: string; featured: boolean; created_at: string; updated_at: string };
        Insert: { id?: string; title: string; slug: string; excerpt: string; description?: string | null; category_id?: string | null; trainer_id?: string | null; cover_url?: string | null; format?: string; status?: string; featured?: boolean; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [];
      };
      course_sessions: {
        Row: { id: string; course_id: string; city: string; venue: string | null; start_date: string; end_date: string | null; duration_label: string; price: number | null; capacity: number | null; registration_open: boolean; featured: boolean; created_at: string };
        Insert: { id?: string; course_id: string; city: string; venue?: string | null; start_date: string; end_date?: string | null; duration_label: string; price?: number | null; capacity?: number | null; registration_open?: boolean; featured?: boolean; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["course_sessions"]["Insert"]>;
        Relationships: [];
      };
      registrations: {
        Row: { id: string; full_name: string; phone: string; email: string | null; wilaya: string; course_id: string | null; session_id: string | null; preferred_contact_method: string; status: string; created_at: string; updated_at: string };
        Insert: { id?: string; full_name: string; phone: string; email?: string | null; wilaya: string; course_id?: string | null; session_id?: string | null; preferred_contact_method?: string; status?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["registrations"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
