import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useIsFocused} from '@react-navigation/native';

import {COLORS} from '../constants/colors';
import {virtualTryOn} from '../services/aiService';
import useClothes from '../hooks/useClothes';


const handleImagePickerResponse = (response, setImage) => {
  if (response.didCancel) {
    if (__DEV__) {
      console.log('User cancelled image picker');
    }
    return;
  }
  if (response.errorCode) {
    if (__DEV__) {
      console.log('ImagePicker Error: ', response.errorMessage);
    }
    Alert.alert('Image Picker Error', response.errorMessage);
    return;
  }
  if (response.assets && response.assets.length > 0) {
    setImage(response.assets[0]);
  }
};

const ImagePickerBox = ({title, image, onSelectImage}) => {
  const selectImageSource = () => {
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => launchCamera({mediaType: 'photo', saveToPhotos: true}).then(res => handleImagePickerResponse(res, onSelectImage)),

      },
      {
        text: 'Choose from Library',
        onPress: () => launchImageLibrary({mediaType: 'photo'}).then(res => handleImagePickerResponse(res, onSelectImage)),

      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  return (
    <TouchableOpacity style={styles.imageBox} onPress={selectImageSource}>
      {image ? (
        <Image source={{uri: image.uri}} style={styles.previewImage} />
      ) : (
        <>
          <Icon name={title === 'You' ? 'person-circle-outline' : 'shirt-outline'} size={40} color={COLORS.primary} />
          <Text style={styles.imageBoxText}>Select Photo of {title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const VirtualTryOnScreen = () => {
  const isFocused = useIsFocused();
  const [userImage, setUserImage] = useState(null);
  const [garmentImage, setGarmentImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addCloth } = useClothes();

  const handleTryOn = async () => {
    if (!userImage || !garmentImage) {
      Alert.alert('Missing Images', 'Please select a photo of yourself and a garment.');
      return;
    }
    setIsLoading(true);
    setResultImage(null);
    try {
      const result = await virtualTryOn(userImage, garmentImage);
      setResultImage(result);
    } catch (error) {
      Alert.alert('AI Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToWardrobe = () => {
    if (!garmentImage) return;
    const newClothData = {
      name: 'New Item from Try-On',
      brand: 'Unknown',
      material: 'Unknown',
      image: garmentImage,
    };
    addCloth(newClothData);
    Alert.alert('Saved!', 'The new garment has been added to your wardrobe.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {isFocused && <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Virtual Try-On</Text>
        <Text style={styles.subtitle}>See how new clothes look on you</Text>

        <View style={styles.imagePickersContainer}>
          <ImagePickerBox title="You" image={userImage} onSelectImage={setUserImage} />
          <Icon name="add-outline" size={40} color={COLORS.textSecondary} />
          <ImagePickerBox title="Garment" image={garmentImage} onSelectImage={setGarmentImage} />
        </View>

        <TouchableOpacity style={styles.tryOnButton} onPress={handleTryOn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.tryOnButtonText}>Try It On!</Text>
          )}
        </TouchableOpacity>

        {resultImage && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Here's Your Look!</Text>
            <Image source={{uri: resultImage.uri}} style={styles.resultImage} />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveToWardrobe}>
              <Icon name="add-circle-outline" size={22} color={COLORS.textOnPrimary} />
              <Text style={styles.saveButtonText}>Save to My Wardrobe</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  imagePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  imageBox: {
    width: 150,
    height: 200,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageBoxText: {
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  tryOnButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  tryOnButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  resultImage: {
    width: '90%',
    aspectRatio: 3 / 4,
    borderRadius: 15,
    backgroundColor: COLORS.card,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveButtonText: {
    color: COLORS.textOnPrimary,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default VirtualTryOnScreen;
