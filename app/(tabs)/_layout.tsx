import { useThemeColor } from '@/constants/Colors';
import i18n from '@/i18n';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  const colors = useThemeColor();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          elevation: 0,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView 
            intensity={80} 
            style={StyleSheet.absoluteFill} 
            tint={colors.background === '#000000' ? 'dark' : 'light'} 
          />
        ),
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('tab_chat'),
          tabBarIcon: ({ color }) => (
            <SymbolView name="message.fill" tintColor={color} size={24} />
          ),
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />
      <Tabs.Screen
        name="temp"
        options={{
          title: i18n.t('tab_temp'),
          tabBarIcon: ({ color }) => (
            <SymbolView name="star.fill" tintColor={color} size={24} />
          ),
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.t('tab_profile'),
          tabBarIcon: ({ color }) => (
            <SymbolView name="person.fill" tintColor={color} size={24} />
          ),
        }}
        listeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
      />
    </Tabs>
  );
}
