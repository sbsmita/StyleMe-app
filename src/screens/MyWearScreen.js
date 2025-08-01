import React, {useState, useEffect, useMemo} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';

import {COLORS} from '../constants/colors';
import useClothes from '../hooks/useClothes';
import ClothingCard from '../components/ClothingCard';
import AddClothModal from '../components/AddClothModal';

const MyWearScreen = () => {
  const isFocused = useIsFocused();
  const {clothes, addCloth, updateCloth, deleteCloth} = useClothes();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCloth, setEditingCloth] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddNew = () => {
    setEditingCloth(null);
    setModalVisible(true);
  };

  const handleEdit = item => {
    setEditingCloth(item);
    setModalVisible(true);
  };

  const handleDelete = id => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCloth(id),
        },
      ],
    );
  };

  const handleSaveCloth = clothData => {
    if (editingCloth) {
      updateCloth(editingCloth.id, clothData);
    } else {
      addCloth(clothData);
    }
    setEditingCloth(null);
  };

  const filteredClothes = useMemo(() => {
    if (!searchQuery) {
      return clothes;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return clothes.filter(
      item =>
        (item.name || '').toLowerCase().includes(lowercasedQuery) ||
        (item.brand || '').toLowerCase().includes(lowercasedQuery) ||
        (item.material || '').toLowerCase().includes(lowercasedQuery),
    );
  }, [clothes, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}

      <FlatList
        ListHeaderComponent={
          // The screen title is now in the navigator header.
          // The search bar remains as the list header.
          <View style={styles.searchContainer}>
            <Icon name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, brand, material..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        }
        data={filteredClothes}
        renderItem={({item}) => (
          <ClothingCard
            item={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}><Icon name="shirt-outline" size={60} color={COLORS.card} /><Text style={styles.emptyText}>Your wardrobe is empty.</Text><Text style={styles.emptySubText}>Tap the '+' button to add your first item!</Text></View>
        }
      />

      <AddClothModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCloth}
        cloth={editingCloth}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginTop: 20, // Add margin to space it from the header
    marginBottom: 20, // Add margin to space it from the list
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: COLORS.text,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    shadowColor: COLORS.primary,
    shadowRadius: 10,
    shadowOpacity: 0.3,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100, // Add padding to push it down from the header
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
});

export default MyWearScreen;
