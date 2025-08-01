import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

const STORAGE_KEY = '@StyleMe/clothes';

const useClothes = () => {
  const [clothes, setClothes] = useState([]);

  useEffect(() => {
    const loadClothes = async () => {
      try {
        const storedClothes = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedClothes !== null) {
          setClothes(JSON.parse(storedClothes));
        }
      } catch (e) {
        console.error('Failed to load clothes.', e);
      }
    };
    loadClothes();
  }, []);

  const saveClothes = async newClothes => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newClothes));
      setClothes(newClothes);
    } catch (e) {
      console.error('Failed to save clothes.', e);
    }
  };

  const addCloth = clothData => {
    const newCloth = {
      id: uuidv4(),
      name: clothData.name,
      brand: clothData.brand,
      material: clothData.material,
      imageUri: clothData.image.uri,
    };
    const newClothes = [newCloth, ...clothes];
    saveClothes(newClothes);
  };

  const updateCloth = (id, clothData) => {
    const updatedClothes = clothes.map(item =>
      item.id === id
        ? {...item, ...clothData, imageUri: clothData.image.uri}
        : item,
    );
    saveClothes(updatedClothes);
  };

  const deleteCloth = id => {
    const newClothes = clothes.filter(item => item.id !== id);
    saveClothes(newClothes);
  };

  return {clothes, addCloth, updateCloth, deleteCloth};
};

export default useClothes;
