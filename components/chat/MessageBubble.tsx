import { useThemeColor } from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  const colors = useThemeColor();
  const isUser = role === 'user';

  return (
    <View style={[
      styles.messageBubble, 
      isUser ? styles.userBubble : styles.assistantBubble,
      isUser && { backgroundColor: colors.tint }
    ]}>
      {isUser ? (
        <Text 
          style={[
            styles.messageText, 
            { color: '#fff' }
          ]}
        >
          {content}
        </Text>
      ) : (
        <Markdown
          style={{
            body: { color: colors.text, fontSize: 16, lineHeight: 24 },
            strong: { fontWeight: 'bold' },
            em: { fontStyle: 'italic' },
            bullet_list: { marginVertical: 8 },
            ordered_list: { marginVertical: 8 },
            list_item: { marginVertical: 4 },
            code_inline: { 
              backgroundColor: colors.card, 
              paddingHorizontal: 4, 
              borderRadius: 4,
              fontFamily: 'monospace',
            },
            fence: { 
              backgroundColor: colors.card, 
              padding: 10, 
              borderRadius: 8,
              fontFamily: 'monospace',
            },
          }}
        >
          {content}
        </Markdown>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
