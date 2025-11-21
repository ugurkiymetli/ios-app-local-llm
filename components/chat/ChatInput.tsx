import { useThemeColor } from '@/constants/Colors';
import i18n from '@/i18n';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export const ChatInput = ({ value, onChangeText, onSend, disabled }: ChatInputProps) => {
  const colors = useThemeColor();

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: colors.inputBackground, 
            color: colors.text,
            borderColor: colors.separator,
            borderWidth: StyleSheet.hairlineWidth,
          }
        ]}
        placeholder={i18n.t('input_placeholder')}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={1000}
      />
      <TouchableOpacity 
        onPress={onSend}
        disabled={disabled}
        style={[styles.sendButton, { opacity: disabled ? 0.5 : 1 }]}
      >
        <SymbolView 
          name="arrow.up.circle.fill" 
          size={32} 
          tintColor={colors.tint} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: { 
    flex: 1,
    padding: 12, 
    paddingTop: 12,
    borderRadius: 20, 
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginBottom: 4,
  },
});
