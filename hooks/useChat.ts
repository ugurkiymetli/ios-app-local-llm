import { database } from '@/database';
import Chat from '@/database/models/Chat';
import Message from '@/database/models/Message';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export interface MessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const useChat = () => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      const chatsCollection = database.get<Chat>('chats');
      const existingChats = await chatsCollection.query().fetch();
      
      let chat: Chat;
      if (existingChats.length === 0) {
        chat = await database.write(async () => {
          return await chatsCollection.create((newChat) => {
            newChat.name = 'Default Chat';
          });
        });
      } else {
        chat = existingChats[0];
      }
      
      setCurrentChatId(chat.id);
      await loadMessages(chat.id);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const messagesCollection = database.get<Message>('messages');
      const dbMessages = await messagesCollection
        .query(Q.where('chat_id', chatId), Q.sortBy('created_at', Q.asc))
        .fetch();
      
      const formattedMessages: MessageData[] = dbMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!currentChatId) return null;
    
    try {
      const messagesCollection = database.get<Message>('messages');
      const newMessage = await database.write(async () => {
        return await messagesCollection.create((message) => {
          message.chatId = currentChatId;
          message.role = role;
          message.content = content;
        });
      });
      return newMessage.id;
    } catch (error) {
      console.error('Failed to save message:', error);
      return null;
    }
  };

  const updateMessage = async (messageId: string, content: string) => {
    try {
      const messagesCollection = database.get<Message>('messages');
      const message = await messagesCollection.find(messageId);
      await database.write(async () => {
        await message.update((msg) => {
          msg.content = content;
        });
      });
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const addMessageToUI = (message: MessageData) => {
    setMessages(prev => [...prev, message]);
  };

  const updateMessageInUI = (messageId: string, content: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, content } : msg
      )
    );
  };

  return {
    currentChatId,
    messages,
    saveMessage,
    updateMessage,
    addMessageToUI,
    updateMessageInUI,
  };
};
