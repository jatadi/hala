'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { ListForm } from './ListForm';
import type { ListDetails, CreateListRequest } from '@/lib/types/list';
import { getUserLists, addRaceToList, createList } from '@/lib/supabase/queries/lists';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  raceId: number;
  raceName: string;
}

export function AddToListModal({ isOpen, onClose, raceId, raceName }: AddToListModalProps) {
  const [lists, setLists] = useState<ListDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLists() {
      try {
        setIsLoading(true);
        const userLists = await getUserLists();
        setLists(userLists);
      } catch (error) {
        setError('Failed to load your lists');
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      fetchLists();
    }
  }, [isOpen]);

  const handleAddToList = async (listId: string) => {
    try {
      setIsAdding(true);
      await addRaceToList({ list_id: listId, race_id: raceId });
      setSuccessMessage(`Added ${raceName} to your list`);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 2000);
    } catch (error) {
      setError('Failed to add race to list');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateList = async (data: CreateListRequest) => {
    try {
      const listId = await createList(data);
      await handleAddToList(listId);
      setShowNewListForm(false);
    } catch (error) {
      setError('Failed to create list');
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title="Add to List"
      >
        <div className="p-6">
          {error ? (
            <div className="text-red-500 mb-4">{error}</div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : showNewListForm ? (
            <ListForm 
              onSubmit={handleCreateList}
              submitLabel="Create List & Add Race"
            />
          ) : (
            <div className="space-y-4">
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  disabled={isAdding}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{list.title}</h3>
                      {list.description && (
                        <p className="text-sm text-gray-400 line-clamp-1">{list.description}</p>
                      )}
                    </div>
                    {!list.is_public && (
                      <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>
                </button>
              ))}

              <button
                onClick={() => setShowNewListForm(true)}
                className="w-full p-4 border-2 border-dashed border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  <span>Create New List</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </Modal>

      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </>
  );
} 