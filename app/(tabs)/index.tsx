import ChatInterface from '@/components/ChatInterface';
import { StyleSheet, View } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <ChatInterface />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
