import { supabase } from '../client';
import type { 
  CreateListRequest,
  ListDetails,
  ListItemDetails,
  AddRaceToListRequest,
  ReorderListItemsRequest,
  ListCommentWithUser,
  ListItem,
  ListComment,
  UpdateListRequest
} from '@/lib/types/list';

// List Management
export async function createList(request: CreateListRequest): Promise<string> {
  const { data, error } = await supabase
    .rpc('create_list', {
      p_title: request.title,
      p_description: request.description,
      p_is_public: request.is_public
    });

  if (error) throw error;
  return data;
}

export async function getListDetails(listId: string): Promise<ListDetails[]> {
  console.log('Fetching list details for ID:', listId);
  
  if (!listId) {
    console.error('Invalid list ID provided');
    throw new Error('Invalid list ID');
  }

  try {
    const { data, error } = await supabase
      .rpc('get_list_details', { p_list_id: listId });

    if (error) {
      console.error('Database error fetching list details:', error);
      throw error;
    }

    if (!data) {
      console.log('No list found with ID:', listId);
      return [];
    }

    console.log('List details response:', data);
    return data;
  } catch (err) {
    console.error('Error in getListDetails:', err);
    throw err;
  }
}

export async function getPopularLists(limit = 10, offset = 0): Promise<ListDetails[]> {
  const { data, error } = await supabase
    .rpc('get_popular_lists', {
      p_limit: limit,
      p_offset: offset
    });

  if (error) throw error;
  return data;
}

// List Items Management
export async function addRaceToList(request: AddRaceToListRequest): Promise<string> {
  const { data, error } = await supabase
    .rpc('add_race_to_list', {
      p_list_id: request.list_id,
      p_race_id: request.race_id,
      p_note: request.note
    });

  if (error) throw error;
  return data;
}

export async function reorderListItems(items: ListItem[]): Promise<void> {
  if (!items.length) return;

  const request: ReorderListItemsRequest = {
    list_id: items[0].list_id,
    item_orders: items.map(item => ({
      id: item.id,
      display_order: item.display_order
    }))
  };

  const { error } = await supabase
    .rpc('reorder_list_items', request);

  if (error) throw error;
}

export async function getListItems(listId: string): Promise<ListItem[]> {
  console.log('Fetching list items for ID:', listId);
  const { data, error } = await supabase
    .rpc('get_list_items', { p_list_id: listId });

  if (error) {
    console.error('Error fetching list items:', error);
    throw error;
  }
  console.log('List items response:', data);
  return data || [];
}

// Social Interactions
export async function toggleListLike(listId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('toggle_list_like', { list_id: listId });

  if (error) throw error;
  return data;
}

export async function getListComments(listId: string): Promise<ListComment[]> {
  const { data, error } = await supabase
    .rpc('get_list_comments', { p_list_id: listId });

  if (error) throw error;
  return data || [];
}

export async function addListComment(listId: string, content: string): Promise<ListComment> {
  const { data, error } = await supabase
    .rpc('add_list_comment', { 
      p_list_id: listId,
      p_content: content 
    });

  if (error) throw error;
  return data;
}

export async function deleteListComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .rpc('delete_list_comment', { p_comment_id: commentId });

  if (error) throw error;
}

// Subscriptions
export function subscribeToListChanges(listId: string, callback: () => void) {
  return supabase
    .channel(`list:${listId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'list_items',
        filter: `list_id=eq.${listId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'list_likes',
        filter: `list_id=eq.${listId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'list_comments',
        filter: `list_id=eq.${listId}`
      },
      callback
    )
    .subscribe();
}

export async function deleteList(listId: string): Promise<void> {
  const { error } = await supabase
    .rpc('delete_list', { p_list_id: listId });

  if (error) throw error;
}

export async function updateListItemNote(itemId: string, note: string): Promise<void> {
  const { error } = await supabase
    .from('list_items')
    .update({ note })
    .eq('id', itemId);

  if (error) throw error;
}

export async function getUserLists(): Promise<ListDetails[]> {
  const { data, error } = await supabase
    .rpc('get_user_lists');

  if (error) throw error;
  return data;
}

export async function updateList(listId: string, update: CreateListRequest): Promise<void> {
  const { error } = await supabase
    .rpc('update_list', { 
      p_list_id: listId,
      p_title: update.title,
      p_description: update.description || null,
      p_is_public: update.is_public
    });

  if (error) throw error;
}

export async function removeListItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .rpc('remove_list_item', { p_item_id: itemId });

  if (error) throw error;
} 