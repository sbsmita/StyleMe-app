import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../constants/colors';

const VirtualTryOnSettings = ({
  visible,
  onClose,
  preferences,
  onUpdatePreferences,
  providers,
  onClearHistory,
}) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleSave = () => {
    onUpdatePreferences(localPreferences);
    onClose();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultPreferences = {
              preferredProvider: 'FASHN_AI',
              autoDetectGarmentType: true,
              saveToHistory: true,
              maxHistoryItems: 20,
              enhanceQuality: true,
              preserveBackground: true,
            };
            setLocalPreferences(defaultPreferences);
          }
        }
      ]
    );
  };

  const updatePreference = (key, value) => {
    setLocalPreferences(prev => ({...prev, [key]: value}));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Virtual Try-On Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* AI Provider Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Provider</Text>
              <Text style={styles.sectionDescription}>
                Choose your preferred AI service for virtual try-on
              </Text>
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerOption,
                    localPreferences.preferredProvider === provider.id && styles.providerOptionSelected,
                    !provider.available && styles.providerOptionDisabled,
                  ]}
                  onPress={() => provider.available && updatePreference('preferredProvider', provider.id)}
                  disabled={!provider.available}
                >
                  <View style={styles.providerInfo}>
                    <Text style={[
                      styles.providerName,
                      !provider.available && styles.providerNameDisabled,
                    ]}>
                      {provider.name}
                    </Text>
                    <Text style={styles.providerDescription}>
                      {provider.description}
                    </Text>
                  </View>
                  {localPreferences.preferredProvider === provider.id && (
                    <Icon name="checkmark-circle" size={20} color={COLORS.success} />
                  )}
                  {!provider.available && (
                    <Text style={styles.unavailableText}>Unavailable</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* General Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>General Settings</Text>
              
              {/* Removed Hugging Face API key section - now using Fashn.ai */}

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Auto-detect Garment Type</Text>
                  <Text style={styles.settingDescription}>
                    Automatically identify clothing type from images using AI
                  </Text>
                </View>
                <Switch
                  value={localPreferences.autoDetectGarmentType}
                  onValueChange={(value) => updatePreference('autoDetectGarmentType', value)}
                  trackColor={{false: COLORS.border, true: COLORS.primary}}
                  thumbColor={COLORS.background}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Enhance Quality</Text>
                  <Text style={styles.settingDescription}>
                    Apply AI enhancement for better results (slower processing)
                  </Text>
                </View>
                <Switch
                  value={localPreferences.enhanceQuality}
                  onValueChange={(value) => updatePreference('enhanceQuality', value)}
                  trackColor={{false: COLORS.border, true: COLORS.primary}}
                  thumbColor={COLORS.background}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Preserve Background</Text>
                  <Text style={styles.settingDescription}>
                    Keep original background in try-on results
                  </Text>
                </View>
                <Switch
                  value={localPreferences.preserveBackground}
                  onValueChange={(value) => updatePreference('preserveBackground', value)}
                  trackColor={{false: COLORS.border, true: COLORS.primary}}
                  thumbColor={COLORS.background}
                />
              </View>
            </View>

            {/* History Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>History & Storage</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Save to History</Text>
                  <Text style={styles.settingDescription}>
                    Automatically save try-on results
                  </Text>
                </View>
                <Switch
                  value={localPreferences.saveToHistory}
                  onValueChange={(value) => updatePreference('saveToHistory', value)}
                  trackColor={{false: COLORS.border, true: COLORS.primary}}
                  thumbColor={COLORS.background}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Max History Items</Text>
                  <Text style={styles.settingDescription}>
                    Maximum number of items to keep in history
                  </Text>
                </View>
                <View style={styles.historyOptions}>
                  {[10, 20, 50, 100].map((count) => (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.historyOption,
                        localPreferences.maxHistoryItems === count && styles.historyOptionSelected,
                      ]}
                      onPress={() => updatePreference('maxHistoryItems', count)}
                    >
                      <Text style={[
                        styles.historyOptionText,
                        localPreferences.maxHistoryItems === count && styles.historyOptionTextSelected,
                      ]}>
                        {count}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.clearHistoryButton} onPress={onClearHistory}>
                <Icon name="trash-outline" size={20} color={COLORS.error} />
                <Text style={styles.clearHistoryText}>Clear All History</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset to Default</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  
  // Provider Options
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  providerOptionDisabled: {
    opacity: 0.5,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  providerNameDisabled: {
    color: COLORS.textSecondary,
  },
  providerDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  unavailableText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
  },

  // Settings
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // History Options
  historyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  historyOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  historyOptionText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  historyOptionTextSelected: {
    color: COLORS.textOnPrimary,
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  clearHistoryText: {
    color: COLORS.error,
    fontWeight: '500',
  },

  // API Key Button
  apiKeyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 12,
  },
  apiKeyText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetButtonText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.textOnPrimary,
    fontWeight: '600',
  },
});

export default VirtualTryOnSettings;