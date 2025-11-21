import { useThemeColor } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ListGroupProps {
  title?: string;
  children: React.ReactNode;
}

export function ListGroup({ title, children }: ListGroupProps) {
  const colors = useThemeColor();

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: colors.secondaryText }]}>
          {title.toUpperCase()}
        </Text>
      )}
      <View style={[styles.group, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 13,
    marginBottom: 6,
    paddingHorizontal: 16,
  },
  group: {
    borderRadius: 10,
    overflow: 'hidden',
  },
});
