import { create } from 'zustand';
import { UploadItem } from '@/components/UploadQueue';

interface UploadQueueState {
  items: UploadItem[];
  addItem: (item: UploadItem) => void;
  updateItem: (file: File, updates: Partial<UploadItem>) => void;
  removeItem: (file: File) => void;
  clearCompleted: () => void;
}

export const useUploadQueueStore = create<UploadQueueState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (file, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.file === file ? { ...item, ...updates } : item
      ),
    })),
  removeItem: (file) =>
    set((state) => ({
      items: state.items.filter((item) => item.file !== file),
    })),
  clearCompleted: () =>
    set((state) => ({
      items: state.items.filter((item) => item.status !== 'completed'),
    })),
}));