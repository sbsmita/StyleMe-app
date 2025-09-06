import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {View, Text, StyleSheet} from 'react-native';
import CustomDrawerContent from './CustomDrawerContent'; // Import the custom component
import MyWearScreen from '../screens/MyWearScreen';
import VirtualTryOnScreen from '../screens/VirtualTryOnScreen';
import MyOutfitsScreen from '../screens/MyOutfitsScreen';
import OutfitBuilderScreen from '../screens/OutfitBuilderScreen';
import PaywallScreen from '../screens/PaywallScreen';
import MyPurchasesScreen from '../screens/MyPurchasesScreen';
import {COLORS} from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="My Wardrobe"
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          // Re-enable the header so the hamburger menu is visible
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textOnPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // Styling for the text and icons in the drawer
          drawerActiveTintColor: COLORS.textOnPrimary,
          drawerInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
          drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.2)',
          drawerLabelStyle: {
            fontWeight: 'bold',
            fontSize: 16,
          },
          // These two options create the shadow overlay effect
          drawerType: 'front',
          overlayColor: 'rgba(0,0,0,0.5)',
        }}>
        <Drawer.Screen name="My Wardrobe" component={MyWearScreen} options={{
          drawerIcon: ({color, size}) => <Icon name="shirt-outline" size={size} color={color} />
        }}/>
        <Drawer.Screen name="My Outfits" component={MyOutfitsScreen} options={{
          drawerIcon: ({color, size}) => <Icon name="albums-outline" size={size} color={color} />
        }}/>
        <Drawer.Screen name="Outfit Builder" component={OutfitBuilderScreen} options={{
          drawerItemStyle: { height: 0 } // Hide from drawer, only accessible via navigation
        }}/>
        <Drawer.Screen name="Paywall" component={PaywallScreen} options={{
          drawerItemStyle: { height: 0 }, // Hide from drawer, only accessible via navigation
          headerShown: false // Hide header for full-screen paywall experience
        }}/>
        <Drawer.Screen
          name="Virtual Try-On"
          component={VirtualTryOnScreen}
          options={{
            drawerIcon: ({color, size}) => (
              <Icon name="camera-reverse-outline" size={size} color={color} />
            ),
            drawerLabel: ({color}) => (
              <View style={styles.drawerLabelContainer}>
                <Text style={[styles.drawerLabel, {color}]}>
                  Virtual Try-On
                </Text>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>Coming Soon</Text>
                </View>
              </View>
            ),
          }}
          listeners={{
            drawerItemPress: e => {
              e.preventDefault();
            },
          }}
        />
        <Drawer.Screen name="My Purchases" component={MyPurchasesScreen} options={{
          drawerIcon: ({color, size}) => <Icon name="card-outline" size={size} color={color} />
        }}/>
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  chip: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 10,
  },
  chipText: {
    color: COLORS.textOnPrimary, // White text
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AppNavigator;
