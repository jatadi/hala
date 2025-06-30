'use client';

import { useState } from 'react';
import type { CreateListRequest } from '@/lib/types/list';

interface ListFormProps {
  initialValues?: {
    title: string;
    description: string | null;
    is_public: boolean;
  };
  onSubmit: (data: { title: string; description: string | null; is_public: boolean }) => Promise<void>;
  onCancel?: () => void;
}

export function ListForm({ 
  onSubmit, 
  initialValues = { title: '', description: '', is_public: true },
  onCancel
}: ListFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialValues);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        description: formData.description || null
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Input */}
      <div>
        <label 
          htmlFor="title" 
          className="block text-sm font-medium text-white"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="My Favorite F1 Races"
          required
          minLength={3}
          maxLength={100}
          className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white shadow-sm focus:border-hala-orange focus:ring-2 focus:ring-hala-orange sm:text-sm"
        />
      </div>

      {/* Description Textarea */}
      <div>
        <label 
          htmlFor="description" 
          className="block text-sm font-medium text-white"
        >
          Description
        </label>
        <textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="A collection of the most exciting races..."
          rows={4}
          className="mt-1 block w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white shadow-sm focus:border-hala-orange focus:ring-2 focus:ring-hala-orange sm:text-sm"
        />
      </div>

      {/* Privacy Toggle */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-hala-orange focus:ring-offset-2
            ${formData.is_public ? 'bg-hala-orange' : 'bg-white/10'}
          `}
        >
          <span className="sr-only">Toggle list privacy</span>
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
              ${formData.is_public ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
        <span className="ml-3 text-sm text-white">
          {formData.is_public ? 'Public' : 'Private'} List
        </span>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting || !formData.title.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-hala-orange hover:bg-hala-orange/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hala-orange disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            'Create List'
          )}
        </button>
      </div>
    </form>
  );
} 