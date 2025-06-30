import type { Database } from './database';
import type { Race } from './race';

export type ListUpdate = Database['public']['Tables']['lists']['Update'];
export type ListCommentUpdate = Database['public']['Tables']['list_comments']['Update'];

export interface CreateListRequest {
  title: string;
  description?: string | null;
  is_public: boolean;
}

export interface ListItem {
  id: string;
  list_id: string;
  race_id: string;
  note: string | null;
  created_at: string;
  display_order: number;
  race: Race;
}

export interface ListItemDetails extends ListItem {
  circuit_name: string;
}

export interface ListDetails {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  owner_id: string;
  owner_username: string;
  owner_avatar_url: string | null;
  like_count: number;
  is_liked: boolean;
  is_following: boolean;
}

export interface ReorderListItemsRequest {
  list_id: string;
  item_orders: Array<{
    id: string;
    display_order: number;
  }>;
}

export interface AddRaceToListRequest {
  list_id: string;
  race_id: number;
  note?: string;
}

export interface AddRaceToListResponse {
  id: string;
  race_name: string;
  race_date: string;
}

export interface ListComment {
  id: string;
  list_id: string;
  user_id: string;
  user_username: string;
  content: string;
  created_at: string;
}

export interface ListCommentWithUser {
  id: string;
  list_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_username: string;
  user_avatar_url: string;
}

export interface UpdateListRequest {
  title: string;
  description: string | null;
  is_public: boolean;
}

export type Lists = Database['public']['Tables']['lists']['Row'];
export type ListItems = Database['public']['Tables']['list_items']['Row'];
export type ListComments = Database['public']['Tables']['list_comments']['Row']; 