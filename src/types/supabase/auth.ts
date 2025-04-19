
import { Database } from "./database";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  position: string | null;
  preferred_currency: string | null;
  preferred_language: string | null;
  theme: string | null;
  country: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: Database["public"]["Enums"]["app_role"];
  created_at: string | null;
}
