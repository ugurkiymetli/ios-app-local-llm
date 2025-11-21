import { useThemeColor } from '@/constants/Colors';
import i18n from '@/i18n';
import { Button, StyleSheet, Text, View } from 'react-native';

interface ModelDownloadProps {
  downloadProgress: number;
  onDownload: () => void;
}

export const ModelDownload = ({ downloadProgress, onDownload }: ModelDownloadProps) => {
  const colors = useThemeColor();

  return (
    <View style={styles.centerContent}>
      <Text style={[styles.text, { color: colors.text }]}>
        {i18n.t('model_missing')}
      </Text>
      <Button title={i18n.t('download_model')} onPress={onDownload} />
      {downloadProgress > 0 && (
        <Text style={[styles.text, { color: colors.text }]}>
          {i18n.t('downloading')}: {(downloadProgress * 100).toFixed(1)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
