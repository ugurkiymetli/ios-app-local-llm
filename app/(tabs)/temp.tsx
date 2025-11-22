import { useThemeColor } from '@/constants/Colors';
import { database } from '@/database';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

export default function AppInfoScreen() {
  const colors = useThemeColor();
  const [modelInfo, setModelInfo] = useState<{
    exists: boolean;
    size?: string;
    modifiedTime?: string;
  }>({ exists: false });
  const [dbStats, setDbStats] = useState<{
    chats: number;
    messages: number;
  }>({ chats: 0, messages: 0 });
  const [messages, setMessages] = useState<any[]>([]);

  const modelUri = `${FileSystem.documentDirectory}models/Llama-3.2-1B-Instruct-Q4_K_M.gguf`;

  useFocusEffect(
    useCallback(() => {
      loadModelInfo();
      loadDbStats();
      loadMessages();
    }, [])
  );

  const loadModelInfo = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(modelUri);
      if (fileInfo.exists && 'size' in fileInfo && 'modificationTime' in fileInfo) {
        const sizeInMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
        const date = new Date(fileInfo.modificationTime * 1000);
        setModelInfo({
          exists: true,
          size: `${sizeInMB} MB`,
          modifiedTime: date.toLocaleString(),
        });
      } else {
        setModelInfo({ exists: false });
      }
    } catch (error) {
      console.error('Failed to load model info:', error);
    }
  };

  const loadDbStats = async () => {
    try {
      const chatsCount = await database.get('chats').query().fetchCount();
      const messagesCount = await database.get('messages').query().fetchCount();
      setDbStats({ chats: chatsCount, messages: messagesCount });
    } catch (error) {
      console.error('Failed to load DB stats:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const allMessages = await database.get('messages').query().fetch();
      const messagesData = await Promise.all(
        allMessages.map(async (msg: any) => {
          try {
            const chat = await msg.chat.fetch();
            return {
              id: msg.id,
              chatId: chat.id,
              chatTitle: chat.title,
              role: msg.role,
              content: msg.content,
              createdAt: new Date(msg.createdAt).toLocaleString(),
            };
          } catch (error) {
            return {
              id: msg.id,
              chatId: 'orphaned',
              chatTitle: 'Deleted Chat',
              role: msg.role,
              content: msg.content,
              createdAt: new Date(msg.createdAt).toLocaleString(),
            };
          }
        })
      );
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleDeleteModel = () => {
    Alert.alert(
      'Delete Model',
      'Are you sure you want to delete the downloaded model? You will need to download it again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(modelUri, { idempotent: true });
              setModelInfo({ exists: false });
              Alert.alert('Success', 'Model deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete model');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleWipeDatabase = () => {
    Alert.alert(
      'Wipe Database',
      'Are you sure you want to delete all chats and messages? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                const allChats = await database.get('chats').query().fetch();
                const allMessages = await database.get('messages').query().fetch();
                
                await Promise.all([
                  ...allChats.map(chat => chat.destroyPermanently()),
                  ...allMessages.map(msg => msg.destroyPermanently()),
                ]);
              });
              
              setDbStats({ chats: 0, messages: 0 });
              Alert.alert('Success', 'Database wiped successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to wipe database');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.header, { color: colors.text }]}>App Info</Text>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Model Information</Text>
        {modelInfo.exists ? (
          <>
            <InfoRow label="Model Name" value="Llama-3.2-1B-Instruct-Q4_K_M" colors={colors} />
            <InfoRow label="Size" value={modelInfo.size || 'Unknown'} colors={colors} />
            <InfoRow label="Downloaded" value={modelInfo.modifiedTime || 'Unknown'} colors={colors} />
            <TouchableOpacity 
              style={[styles.dangerButton, { borderColor: '#FF3B30' }]}
              onPress={handleDeleteModel}
            >
              <Text style={styles.dangerButtonText}>Delete Model</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[styles.infoText, { color: colors.secondaryText }]}>
            No model downloaded
          </Text>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Database Statistics</Text>
        <InfoRow label="Chats" value={dbStats.chats.toString()} colors={colors} />
        <InfoRow label="Messages" value={dbStats.messages.toString()} colors={colors} />
        <TouchableOpacity 
          style={[styles.dangerButton, { borderColor: '#FF3B30' }]}
          onPress={handleWipeDatabase}
        >
          <Text style={styles.dangerButtonText}>Wipe Database</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Messages Data</Text>
        {messages.length > 0 ? (
          <ScrollView style={styles.jsonContainer} nestedScrollEnabled>
            <Markdown
              style={{
                body: { color: colors.text },
                code_inline: { 
                  backgroundColor: colors.background,
                  color: colors.tint,
                  fontSize: 12,
                },
                fence: {
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 12,
                },
                code_block: {
                  color: colors.text,
                  fontSize: 11,
                  fontFamily: 'Courier',
                },
              }}
            >
              {`\`\`\`json\n${JSON.stringify(messages, null, 2)}\n\`\`\``}
            </Markdown>
          </ScrollView>
        ) : (
          <Text style={[styles.infoText, { color: colors.secondaryText }]}>
            No messages in database
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const InfoRow = ({ label, value, colors }: { label: string; value: string; colors: any }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  dangerButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  jsonContainer: {
    maxHeight: 500,
  },
});
