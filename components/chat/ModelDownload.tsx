import { useThemeColor } from '@/constants/Colors';
import i18n from '@/i18n';
import { formatBytes, formatTime } from '@/utils/format';
import { LinearGradient } from 'expo-linear-gradient';
import { getLocales } from 'expo-localization';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ModelDownloadProps {
  downloadProgress: number;
  downloadedBytes: number;
  totalBytes: number;
  estimatedTimeRemaining: number | null;
  onDownload: () => void;
}

export const ModelDownload = ({ 
  downloadProgress, 
  downloadedBytes,
  totalBytes,
  estimatedTimeRemaining,
  onDownload 
}: ModelDownloadProps) => {
  const colors = useThemeColor();
  const isDownloading = downloadProgress > 0 && downloadProgress < 1;
  const locale = getLocales()[0].languageCode || 'en';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <SymbolView 
          name="brain.head.profile" 
          size={80} 
          tintColor={colors.tint}
        />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {i18n.t('model_required_title')}
      </Text>
      
      <Text style={[styles.modelName, { color: colors.secondaryText }]}>
        {i18n.t('model_name')}
      </Text>

      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <View style={styles.infoRow}>
          <SymbolView name="lock.shield.fill" size={20} tintColor="#34C759" />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {i18n.t('model_privacy')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <SymbolView name="bolt.fill" size={20} tintColor="#FF9500" />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {i18n.t('model_fast')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <SymbolView name="arrow.down.circle.fill" size={20} tintColor={colors.tint} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {i18n.t('model_size')}
          </Text>
        </View>
      </View>

      {isDownloading && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.card }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${downloadProgress * 100}%`,
                  backgroundColor: colors.tint 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.secondaryText }]}>
            {formatBytes(downloadedBytes)} MB / {formatBytes(totalBytes)} MB
          </Text>
          <Text style={[styles.percentText, { color: colors.text }]}>
            {(downloadProgress * 100).toFixed(1)}%
          </Text>
          {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
            <Text style={[styles.timeText, { color: colors.secondaryText }]}>
              {formatTime(estimatedTimeRemaining, locale)} {i18n.t('time_remaining')}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.downloadButton,
          isDownloading && styles.downloadButtonDisabled
        ]}
        onPress={onDownload}
        disabled={isDownloading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isDownloading ? ['#999', '#666'] : [colors.tint, colors.tint + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          <SymbolView 
            name={isDownloading ? "arrow.down.circle" : "arrow.down.circle.fill"} 
            size={24} 
            tintColor="#fff"
          />
          <Text style={styles.buttonText}>
            {isDownloading ? i18n.t('downloading_button') : i18n.t('download_model')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {!isDownloading && <Text style={[styles.disclaimer, { color: colors.secondaryText }]}>
        {i18n.t('download_disclaimer')}
      </Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modelName: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    marginTop: 4,
  },
  percentText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  timeText: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  downloadButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
