
import { useThemeColor } from '@/constants/Colors';
import { database } from '@/database';
import Chat from '@/database/models/Chat';
import Message from '@/database/models/Message';
import i18n from '@/i18n';
import { Q } from '@nozbe/watermelondb';
import * as FileSystem from 'expo-file-system/legacy';
import { SymbolView } from 'expo-symbols';
import { initLlama, LlamaContext } from 'llama.rn';
import { useEffect, useRef, useState } from 'react';
import { Button, FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface MessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const colors = useThemeColor();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isModelReady, setIsModelReady] = useState(false);
  const [context, setContext] = useState<LlamaContext | null>(null);
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const modelDir = `${FileSystem.documentDirectory}models/`;
  const modelUri = `${modelDir}Llama-3.2-1B-Instruct-Q4_K_M.gguf`;
  const modelUrl = 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf';

  useEffect(() => {
    checkModelExists();
    initializeChat();
    
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const initializeChat = async () => {
    try {
      const chatsCollection = database.get<Chat>('chats');
      const existingChats = await chatsCollection.query().fetch();
      
      let chat: Chat;
      if (existingChats.length === 0) {
        // Create default chat
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

  const checkModelExists = async () => {
    const fileInfo = await FileSystem.getInfoAsync(modelUri);
    if (fileInfo.exists) {
      setIsModelReady(true);
      initializeLlama(modelUri);
    }
  };

  const downloadModel = async () => {
    try {
      await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
      const downloadResumable = FileSystem.createDownloadResumable(
        modelUrl,
        modelUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        setIsModelReady(true);
        initializeLlama(result.uri);
      }
    } catch (e: any) {
      console.error(e);
      alert(`${i18n.t('download_failed')}: ${e.message}`);
    }
  };

  const initializeLlama = async (uri: string) => {
    try {
      const cleanPath = uri.replace('file://', '');
      const ctx = await initLlama({
        model: cleanPath,
        use_mlock: true, 
        n_ctx: 2048,     
        n_gpu_layers: 99 
      });
      setContext(ctx);
    } catch (err) {
      console.error("Llama init failed:", err);
    }
  };

  const generateText = async () => {
    if (!context || !input.trim()) return;
    
    const userContent = input;
    setInput('');
    setLoading(true);

    // Save user message to DB
    const userMessageId = await saveMessage('user', userContent);
    if (!userMessageId) return;

    // Add user message to UI
    const userMessage: MessageData = { id: userMessageId, role: 'user', content: userContent };
    setMessages(prev => [...prev, userMessage]);

    // Create empty assistant message in DB
    const assistantMessageId = await saveMessage('assistant', '');
    if (!assistantMessageId) return;

    // Add empty assistant message to UI
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

    // Llama 3 Instruct Format
    const prompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${userContent}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    let fullResponse = '';
    try {
      await context.completion(
        {
          prompt: prompt,
          n_predict: 200,
          stop: ["<|eot_id|>", "<|end_of_text|>"],
        },
        (data: any) => {
          fullResponse += data.token;
          // Update UI
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        }
      );
      // Update DB with final response
      await updateMessage(assistantMessageId, fullResponse);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: MessageData }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[
        styles.messageBubble, 
        isUser ? styles.userBubble : styles.assistantBubble,
        isUser && { backgroundColor: colors.tint } // Use theme tint for user bubble
      ]}>
        <Text style={[
          styles.messageText, 
          { color: isUser ? '#fff' : colors.text }
        ]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.innerContainer, { paddingBottom: keyboardVisible ? 10 : 100 }]}>
        <Text style={[styles.header, { color: colors.text }]}>{i18n.t('header_title')}</Text>

        {!isModelReady ? (
          <View style={styles.centerContent}>
            <Text style={[styles.text, { color: colors.text }]}>{i18n.t('model_missing')}</Text>
            <Button title={i18n.t('download_model')} onPress={downloadModel} />
            {downloadProgress > 0 && (
              <Text style={[styles.text, { color: colors.text }]}>{i18n.t('downloading')}: {(downloadProgress * 100).toFixed(1)}%</Text>
            )}
          </View>
        ) : (
          <>
            <View style={styles.chatContainer}>
              {messages.length === 0 && (
                <Text style={styles.success}>{i18n.t('model_ready')}</Text>
              )}
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                keyboardDismissMode="on-drag"
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: colors.inputBackground, 
                    color: colors.text,
                    borderColor: colors.separator,
                    borderWidth: StyleSheet.hairlineWidth,
                  }
                ]}
                placeholder={i18n.t('input_placeholder')}
                placeholderTextColor={colors.secondaryText}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity 
                onPress={generateText}
                disabled={loading || !context || !input.trim()}
                style={[styles.sendButton, { opacity: (loading || !context || !input.trim()) ? 0.5 : 1 }]}
              >
                <SymbolView 
                  name="arrow.up.circle.fill" 
                  size={32} 
                  tintColor={colors.tint} 
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  innerContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    // paddingBottom is handled dynamically
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { 
    fontSize: 16, 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  success: { 
    color: 'green', 
    textAlign: 'center', 
    marginBottom: 10, 
    fontWeight: 'bold' 
  },
  chatContainer: { 
    flex: 1,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    width: '100%',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    // marginTop removed to equalize gaps
  },
  input: { 
    flex: 1,
    padding: 12, 
    paddingTop: 12, // Ensure text starts at top for multiline
    borderRadius: 20, 
    fontSize: 16,
    maxHeight: 100, // Limit to approx 3-4 lines
  },
  sendButton: {
    marginBottom: 4, // Align with input text baseline
  },
});
