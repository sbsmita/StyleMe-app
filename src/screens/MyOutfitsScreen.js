import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useIsFocused, useFocusEffect} from '@react-navigation/native';
import {COLORS} from '../constants/colors';
import OutfitCard from '../components/OutfitCard';
import useOutfits from '../hooks/useOutfits';

const MyOutfitsScreen = ({navigation}) => {
  const isFocused = useIsFocused();
  const {outfits, deleteOutfit, refreshOutfits} = useOutfits();

  // Refreshes the outfit list every time the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshOutfits();
    }, [refreshOutfits]),
  );

  const handleAddNewOutfit = () => {
    navigation.navigate('Outfit Builder');
  };

  const handleDelete = id => {
    Alert.alert(
      'Delete Outfit',
      'Are you sure you want to delete this outfit?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: () => deleteOutfit(id)},
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
      <FlatList
        data={outfits}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <OutfitCard outfit={item} onDelete={() => handleDelete(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="albums-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No outfits saved yet.</Text>
            <Text style={styles.emptySubText}>
              Tap the '+' button to create your first outfit!
            </Text>
          </View>
        }
        contentContainerStyle={outfits.length === 0 ? styles.emptyListContainer : styles.listContainer}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddNewOutfit}>
        <Icon name="add" size={30} color={COLORS.textOnPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 80, // Space for FAB
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default MyOutfitsScreen;
