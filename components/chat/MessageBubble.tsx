import { useThemeColor } from '@/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';

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
      <Text style={[
        styles.messageText, 
        { color: isUser ? '#fff' : colors.text }
      ]}>
        {content}
      </Text>
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
