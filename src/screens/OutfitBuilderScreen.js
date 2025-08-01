import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../constants/colors';
import StarRating from '../components/StarRating';
import useClothes from '../hooks/useClothes';
import useOutfits from '../hooks/useOutfits';
import {FlatList} from 'react-native-gesture-handler';

const DropZone = ({title, item, onRemove}) => (
  <View style={styles.dropZone}>
    {item ? (
      <>
        <Image source={{uri: item.imageUri}} style={styles.dropZoneImage} />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="close-circle" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </>
    ) : (
      <>
        <Icon name="add-circle-outline" size={30} color={COLORS.textSecondary} />
        <Text style={styles.dropZoneText}>{title}</Text>
      </>
    )}
  </View>
);

const OutfitBuilderScreen = ({navigation}) => {
  const {clothes} = useClothes();
  const {addOutfit} = useOutfits(); // Get the addOutfit function from our hook
  const [outfitName, setOutfitName] = useState('');
  const [rating, setRating] = useState(0);
  const [canvasItems, setCanvasItems] = useState({
    top: null,
    bottom: null,
    shoes: null,
    accessory: null,
  });

  const handleAddItem = clothItem => {
    // Find the first empty slot in the canvas
    const availableSlots = ['top', 'bottom', 'shoes', 'accessory'];
    const emptySlot = availableSlots.find(slot => !canvasItems[slot]);

    if (emptySlot) {
      setCanvasItems(prev => ({...prev, [emptySlot]: clothItem}));
    } else {
      Alert.alert(
        'Canvas Full',
        'All outfit slots are filled. Remove an item to add another.',
      );
    }
  };

  const handleRemoveItem = slot => {
    setCanvasItems(prev => ({...prev, [slot]: null}));
  };

  const handleSave = async () => {
    const itemsInOutfit = Object.values(canvasItems).filter(Boolean);

    if (!outfitName.trim()) {
      Alert.alert('Missing Name', 'Please give your outfit a name.');
      return;
    }

    if (itemsInOutfit.length === 0) {
      Alert.alert('Empty Outfit', 'Please add at least one item to the canvas before saving.');
      return;
    }

    await addOutfit({name: outfitName, rating, items: itemsInOutfit});
    Alert.alert('Saved!', 'Your new outfit has been saved.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Create New Outfit</Text>

            <View style={styles.outfitDetails}>
              <TextInput
                style={styles.nameInput}
                placeholder="My Awesome Outfit Name"
                placeholderTextColor={COLORS.textSecondary}
                value={outfitName}
                onChangeText={setOutfitName}
              />
              <StarRating rating={rating} onRatingChange={setRating} />
            </View>

            <Text style={styles.sectionTitle}>Outfit Canvas</Text>
            <View style={styles.canvas}>
              <DropZone
                title="Top"
                item={canvasItems.top}
                onRemove={() => handleRemoveItem('top')}
              />
              <DropZone
                title="Bottom"
                item={canvasItems.bottom}
                onRemove={() => handleRemoveItem('bottom')}
              />
              <DropZone
                title="Shoes"
                item={canvasItems.shoes}
                onRemove={() => handleRemoveItem('shoes')}
              />
              <DropZone
                title="Accessory"
                item={canvasItems.accessory}
                onRemove={() => handleRemoveItem('accessory')}
              />
            </View>

            <Text style={styles.sectionTitle}>Your Clothes</Text>
            <Text style={styles.infoText}>Tap an item to add it to the canvas</Text>
          </>
        }
        data={clothes}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
            <TouchableOpacity
              style={styles.clothItem}
              onPress={() => handleAddItem(item)}>
              <Image source={{uri: item.imageUri}} style={styles.clothImage} />
              <Text style={styles.clothName} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Outfit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.background},
  listContainer: {padding: 20, paddingBottom: 100},
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  outfitDetails: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    paddingBottom: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 10,
  },
  canvas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropZone: {
    width: '48%',
    height: 150,
    backgroundColor: COLORS.card,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  dropZoneText: {color: COLORS.textSecondary, marginTop: 5},
  infoText: {color: COLORS.textSecondary, marginBottom: 10, textAlign: 'center'},
  clothItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginBottom: 10,
  },
  clothImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  clothName: {flex: 1, color: COLORS.text, fontSize: 16, fontWeight: '500'},
  saveButton: {backgroundColor: COLORS.success, padding: 20, alignItems: 'center'},
  saveButtonText: {color: COLORS.textOnPrimary, fontSize: 18, fontWeight: 'bold'},
});

export default OutfitBuilderScreen;
