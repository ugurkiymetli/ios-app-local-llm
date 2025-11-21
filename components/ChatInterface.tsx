import { useThemeColor } from '@/constants/Colors';
import { MessageData, useChat } from '@/hooks/useChat';
import { useLlama } from '@/hooks/useLlama';
import i18n from '@/i18n';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { ChatInput } from './chat/ChatInput';
import { MessageBubble } from './chat/MessageBubble';
import { ModelDownload } from './chat/ModelDownload';

export default function ChatInterface() {
  const colors = useThemeColor();
  const [input, setInput] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { 
    messages, 
    saveMessage, 
    updateMessage, 
    addMessageToUI, 
    updateMessageInUI 
  } = useChat();

  const { 
    isModelReady, 
    downloadProgress, 
    context, 
    loading, 
    downloadModel, 
    generateText 
  } = useLlama();

  useEffect(() => {
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

  const handleSend = async () => {
    if (!context || !input.trim()) return;
    
    const userContent = input;
    setInput('');

    const userMessageId = await saveMessage('user', userContent);
    if (!userMessageId) return;

    addMessageToUI({ id: userMessageId, role: 'user', content: userContent });

    const assistantMessageId = await saveMessage('assistant', '');
    if (!assistantMessageId) return;

    addMessageToUI({ id: assistantMessageId, role: 'assistant', content: '' });

    let fullResponse = '';
    await generateText(userContent, (token: string) => {
      fullResponse += token;
      updateMessageInUI(assistantMessageId, fullResponse);
    });

    await updateMessage(assistantMessageId, fullResponse);
  };

  const renderMessage = ({ item }: { item: MessageData }) => (
    <MessageBubble role={item.role} content={item.content} />
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.innerContainer, { paddingBottom: keyboardVisible ? 10 : 100 }]}>
        <Text style={[styles.header, { color: colors.text }]}>
          {i18n.t('header_title')}
        </Text>

        {!isModelReady ? (
          <ModelDownload 
            downloadProgress={downloadProgress} 
            onDownload={downloadModel} 
          />
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
            
            <ChatInput
              value={input}
              onChangeText={setInput}
              onSend={handleSend}
              disabled={loading || !context || !input.trim()}
            />
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
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
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
});
