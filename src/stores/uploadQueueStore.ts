import { create } from 'zustand';
import { UploadItemType } from '@/components/upload-queue/UploadItem';

interface UploadQueueState {
  items: UploadItemType[];
  addItem: (item: UploadItemType) => void;
  updateItem: (file: File, updates: Partial<UploadItemType>) => void;
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