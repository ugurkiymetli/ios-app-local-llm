import { useThemeColor } from '@/constants/Colors';
import i18n from '@/i18n';
import { StyleSheet, Text, View } from 'react-native';

export default function TempScreen() {
   const colors = useThemeColor();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text,{ color: colors.text }]}>{i18n.t('temp_tab_text')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

