import i18n from '@/i18n';
import * as FileSystem from 'expo-file-system/legacy';
import { initLlama, LlamaContext } from 'llama.rn';
import { useEffect, useRef, useState } from 'react';

export const useLlama = () => {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const downloadStartTimeRef = useRef<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [context, setContext] = useState<LlamaContext | null>(null);
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
      if (!context) {
        initializeLlama(modelUri);
      }
    } else {
      setIsModelReady(false);
      setContext(null);
    }
  };

  const downloadModel = async () => {
    try {
      downloadStartTimeRef.current = Date.now();
      await FileSystem.makeDirectoryAsync(modelDir, { intermediates: true });
      const downloadResumable = FileSystem.createDownloadResumable(
        modelUrl,
        modelUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
          setDownloadedBytes(downloadProgress.totalBytesWritten);
          setTotalBytes(downloadProgress.totalBytesExpectedToWrite);
          
          if (downloadStartTimeRef.current) {
            const elapsedTime = (Date.now() - downloadStartTimeRef.current) / 1000;
            const downloadSpeed = downloadProgress.totalBytesWritten / elapsedTime;
            const remainingBytes = downloadProgress.totalBytesExpectedToWrite - downloadProgress.totalBytesWritten;
            const timeRemaining = remainingBytes / downloadSpeed;
            setEstimatedTimeRemaining(timeRemaining);
          }
        }
      );
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        setIsModelReady(true);
        if (!context) {
          initializeLlama(result.uri);
        }
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

  const generateText = async (
    prompt: string,
    onToken: (token: string) => void
  ) => {
    if (!context) return;
    
    setLoading(true);
    const llamaPrompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    try {
      await context.completion(
        {
          prompt: llamaPrompt,
          n_predict: 1000,
          stop: ["<|eot_id|>", "<|end_of_text|>"],
        },
        (data: any) => {
          onToken(data.token);
        }
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    isModelReady,
    downloadProgress,
    downloadedBytes,
    totalBytes,
    estimatedTimeRemaining,
    context,
    loading,
    downloadModel,
    generateText,
    recheckModel: checkModelExists,
  };
};
