import { useThemeColor } from '@/constants/Colors';
import i18n from '@/i18n';
import * as FileSystem from 'expo-file-system/legacy';
import { initLlama, LlamaContext } from 'llama.rn';
import { useEffect, useState } from 'react';
import { Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ChatInterface() {
  const colors = useThemeColor();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isModelReady, setIsModelReady] = useState(false);
  const [context, setContext] = useState<LlamaContext | null>(null);
  
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const modelDir = `${FileSystem.documentDirectory}models/`;
  const modelUri = `${modelDir}Llama-3.2-1B-Instruct-Q4_K_M.gguf`;
  const modelUrl = 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf';

  useEffect(() => {
    checkModelExists();
  }, []);

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
    if (!context) return;
    setLoading(true);
    setResponse('');
    // Llama 3 Instruct Format
    const prompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${input}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    try {
      await context.completion(
        {
          prompt: prompt,
          n_predict: 200,
          stop: ["<|eot_id|>", "<|end_of_text|>"],
        },
        (data: any) => {
          setResponse((prev) => prev + data.token);
        }
      );
    } catch (e) {
      console.error(e);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={80} // Offset for the tab bar
    >
      <View style={styles.innerContainer}>
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
              <Text style={styles.success}>{i18n.t('model_ready')}</Text>
              <ScrollView 
                style={[styles.responseBox, { backgroundColor: colors.card }]}
                contentContainerStyle={styles.responseContent}
              >
                <Text style={[styles.responseText, { color: colors.text }]}>{response || i18n.t('ai_response_placeholder')}</Text>
              </ScrollView>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                placeholder={i18n.t('input_placeholder')}
                placeholderTextColor={colors.secondaryText}
                value={input}
                onChangeText={setInput}
              />
              <Button 
                title={loading ? i18n.t('button_thinking') : i18n.t('button_send')} 
                onPress={generateText} 
                disabled={loading || !context || !input.trim()} 
              />
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
    paddingBottom: 100, // Space for tab bar
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
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
  responseBox: { 
    flex: 1, 
    borderRadius: 10, 
  },
  responseContent: {
    padding: 15,
  },
  responseText: { 
    fontSize: 16, 
    lineHeight: 24 
  },
  inputContainer: {
    marginTop: 10,
  },
  input: { 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    fontSize: 16 
  },
});
