import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../constants/colors';

const PremiumFeature = ({iconName, title, description}) => (
  <View style={styles.feature}>
    <View style={styles.iconContainer}>
      <Icon name={iconName} size={24} color={COLORS.primary} />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const PremiumFeaturesList = () => {
  const features = [
    {
      iconName: 'infinite-outline',
      title: 'Unlimited Outfits',
      description: 'Create as many outfits as you want without any restrictions',
    },
    {
      iconName: 'camera-outline',
      title: 'Virtual Try-On',
      description: 'See how outfits look on you with our virtual try-on feature',
    },
    {
      iconName: 'checkmark-circle-outline',
      title: 'Ad-Free Experience',
      description: 'Enjoy the app without any interruptions or advertisements',
    },
  ];

  return (
    <View style={styles.container}>
      {features.map((feature, index) => (
        <PremiumFeature
          key={index}
          iconName={feature.iconName}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default PremiumFeaturesList;
