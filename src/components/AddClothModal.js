import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {COLORS} from '../constants/colors';

const AddClothModal = ({visible, onClose, onSave, cloth}) => {
  const insets = useSafeAreaInsets();
  const [itemName, setItemName] = useState('');
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (visible) { // Only run when modal becomes visible
      if (cloth) {
        setItemName(cloth.name);
        setBrand(cloth.brand);
        setMaterial(cloth.material);
        setImage({uri: cloth.imageUri});
      } else {
        resetForm();
      }
    }
  }, [cloth, visible]);

  const resetForm = () => {
    setItemName('');
    setBrand('');
    setMaterial('');
    setImage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!itemName || !brand || !material || !image) {
      Alert.alert('Missing Info', 'Please fill all fields and select an image.');
      return;
    }
    onSave({name: itemName, brand, material, image: image});
    handleClose();
  };

  const handleImagePickerResponse = response => {
    if (response.didCancel) {
      if (__DEV__) {
        console.log('User cancelled image picker');
      }
      return;
    }
    if (response.errorCode) {
      if (__DEV__) {
        console.log('ImagePicker Error:', response.errorCode, response.errorMessage);
      }
      Alert.alert('Image Picker Error', response.errorMessage || 'Unknown error');
      return;
    }
    if (response.assets && response.assets.length > 0) {
      setImage(response.assets[0]);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'StyleMe needs access to your camera to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      if (__DEV__) {
        console.log('Permission error:', err);
      }
      return false;
    }
  };

  const selectImageSource = () => {
    Alert.alert('Add a Photo', 'Choose an option', [
      {
        text: 'Take Photo...',
        onPress: async () => {
          const hasPermission = await requestCameraPermission();
          if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required.');
            return;
          }
          launchCamera({mediaType: 'photo'}).then(handleImagePickerResponse);
        },
      },
      {
        text: 'Choose from Library...',
        onPress: () => launchImageLibrary({mediaType: 'photo'}).then(handleImagePickerResponse),
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollViewContent, { paddingBottom: Math.max(insets.bottom + 20, 20) }]}
        >
          <Text style={styles.modalTitle}>{cloth ? 'Edit Item' : 'Add New Item'}</Text>

          <TouchableOpacity style={styles.imagePicker} onPress={selectImageSource}>
            {image ? (
              <Image source={{uri: image.uri}} style={styles.previewImage} />
            ) : (
              <>
                <Icon name="camera-outline" size={40} color={COLORS.primary} />
                <Text style={styles.imagePickerText}>Select a Photo</Text>
              </>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Item Name (e.g., Blue Denim Jacket)"
            placeholderTextColor={COLORS.textSecondary}
            value={itemName}
            onChangeText={setItemName}
          />
          <TextInput
            style={styles.input}
            placeholder="Brand (e.g., Levi's)"
            placeholderTextColor={COLORS.textSecondary}
            value={brand}
            onChangeText={setBrand}
          />
          <TextInput
            style={styles.input}
            placeholder="Material (e.g., Cotton, Denim)"
            placeholderTextColor={COLORS.textSecondary}
            value={material}
            onChangeText={setMaterial}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={handleClose}>
              <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonAdd]}
              onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrollView: {
    width: '90%',
    maxHeight: '85%',
    flexGrow: 0,
  },
  scrollViewContent: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: COLORS.text,
    marginBottom: 20,
  },
  imagePicker: {
    width: 150,
    height: 150,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  imagePickerText: {
    color: COLORS.primary,
    marginTop: 8,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    height: 50,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.neutral,
    marginRight: 10,
  },
  buttonAdd: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  buttonText: {
    color: COLORS.textOnPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextCancel: {
    color: COLORS.neutral,
  },
});

export default AddClothModal;
