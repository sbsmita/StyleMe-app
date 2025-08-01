import React from 'react';
import {StyleSheet} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../constants/colors';

const CustomDrawerContent = props => {
  return (
    // This gradient will be the background for the entire drawer
    <LinearGradient
      colors={[COLORS.secondary, COLORS.primary]}
      style={styles.gradient}>
      <DrawerContentScrollView {...props}>
        {/* This renders the standard drawer items */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default CustomDrawerContent;
