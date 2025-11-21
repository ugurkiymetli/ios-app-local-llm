import { useThemeColor } from '@/constants/Colors';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableHighlight, View } from 'react-native';

interface ListItemProps {
  title: string;
  icon: SymbolViewProps['name'];
  iconColor?: string;
  rightElement?: 'chevron' | 'switch' | string;
  isLast?: boolean;
  onPress?: () => void;
  value?: boolean; // For switch
  onValueChange?: (val: boolean) => void; // For switch
}

export function ListItem({
  title,
  icon,
  iconColor = '#007AFF',
  rightElement = 'chevron',
  isLast = false,
  onPress,
  value,
  onValueChange,
}: ListItemProps) {
  const colors = useThemeColor();

  return (
    <TouchableHighlight
      onPress={onPress}
      underlayColor={colors.background}
      disabled={!onPress && rightElement !== 'switch'}
    >
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <SymbolView name={icon} tintColor="white" size={16} />
        </View>
        
        <View style={[
          styles.contentContainer, 
          !isLast && { borderBottomColor: colors.separator, borderBottomWidth: StyleSheet.hairlineWidth }
        ]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          
          <View style={styles.rightElement}>
            {rightElement === 'chevron' && (
              <SymbolView name="chevron.right" tintColor={colors.secondaryText} size={14} />
            )}
            {rightElement === 'switch' && (
              <Switch value={value} onValueChange={onValueChange} />
            )}
            {typeof rightElement === 'string' && rightElement !== 'chevron' && rightElement !== 'switch' && (
              <Text style={{ color: colors.secondaryText }}>{rightElement}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    minHeight: 44,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    height: '100%',
    paddingVertical: 10,
  },
  title: {
    fontSize: 17,
  },
  rightElement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
