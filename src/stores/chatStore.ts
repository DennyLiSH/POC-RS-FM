import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;

  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,

      addMessage: (role, content) => {
        const newMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role,
          content,
          timestamp: Date.now(),
        };
        set({ messages: [...get().messages, newMessage] });
      },

      clearMessages: () => set({ messages: [] }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'test-fm-chat',
    }
  )
);
