import { ListGroup } from '@/components/ui/ListGroup';
import { ListItem } from '@/components/ui/ListItem';
import { useThemeColor } from '@/constants/Colors';
import i18n from '@/i18n';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const colors = useThemeColor();
  const [customizeEnabled, setCustomizeEnabled] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{i18n.t('settings_title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <ListGroup title={i18n.t('group_general')}>
          <ListItem 
            title={i18n.t('setting_icloud')} 
            icon="icloud.fill" 
            iconColor="#FF9500" 
            onPress={() => {}} 
          />
          <ListItem 
            title={i18n.t('setting_notifications')} 
            icon="bell.fill" 
            iconColor="#34C759" 
            onPress={() => {}} 
          />
          <ListItem 
            title={i18n.t('setting_customize')} 
            icon="paintbrush.fill" 
            iconColor="#AF52DE" 
            rightElement="switch"
            value={customizeEnabled}
            onValueChange={setCustomizeEnabled}
          />
          <ListItem 
            title={i18n.t('setting_advanced')} 
            icon="gear" 
            iconColor="#007AFF" 
            isLast 
            onPress={() => {}} 
          />
        </ListGroup>

        <ListGroup title={i18n.t('group_features')}>
          <ListItem 
            title={i18n.t('setting_replan')} 
            icon="arrow.triangle.2.circlepath" 
            iconColor="#FFCC00" 
            rightElement={i18n.t('label_pro')}
            onPress={() => {}} 
          />
          <ListItem 
            title={i18n.t('setting_energy')} 
            icon="bolt.fill" 
            iconColor="#34C759" 
            rightElement={i18n.t('label_setup')}
            onPress={() => {}} 
          />
          <ListItem 
            title={i18n.t('setting_cycles')} 
            icon="drop.fill" 
            iconColor="#FF3B30" 
            rightElement={i18n.t('label_setup')}
            isLast
            onPress={() => {}} 
          />
        </ListGroup>

        <ListGroup title={i18n.t('group_integrations')}>
          <ListItem 
            title={i18n.t('setting_awake')} 
            icon="alarm.fill" 
            iconColor="#FF9500" 
            rightElement={i18n.t('label_setup')}
            onPress={() => {}} 
          />
          <ListItem 
            title={i18n.t('setting_calendars')} 
            icon="calendar" 
            iconColor="#FF3B30" 
            rightElement={i18n.t('label_pro')}
            onPress={() => {}} 
          />
          <ListItem 
            title={i18n.t('setting_reminders')} 
            icon="list.bullet" 
            iconColor="#34C759" 
            rightElement={i18n.t('label_pro')}
            onPress={() => {}} 
          />
          <ListItem 
            title={i18n.t('setting_onesec')} 
            icon="timer" 
            iconColor="#5856D6" 
            rightElement={i18n.t('label_setup')}
            onPress={() => {}} 
          />
          <ListItem 
            title={i18n.t('setting_widgets')} 
            icon="square.grid.2x2.fill" 
            iconColor="#FF9500" 
            isLast
            onPress={() => {}} 
          />
        </ListGroup>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
});
