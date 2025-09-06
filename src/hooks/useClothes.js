import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

const STORAGE_KEY = '@StyleMe/clothes';

const useClothes = () => {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClothes = useCallback(async () => {
    setLoading(true);
    try {
      const storedClothes = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedClothes !== null) {
        const parsedClothes = JSON.parse(storedClothes);
        setClothes(parsedClothes);
      } else {
        setClothes([]);
      }
    } catch (e) {
      if (__DEV__) {
        console.log('Failed to load clothes');
      }
      setClothes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClothes();
  }, [loadClothes]); // Now loadClothes is stable, so we can include it

  const saveClothes = async newClothes => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newClothes));
      setClothes(newClothes);
    } catch (e) {
      if (__DEV__) {
        console.log('Failed to save clothes');
      }
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

  return {clothes, loading, addCloth, updateCloth, deleteCloth, refreshClothes: loadClothes};
};

export default useClothes;
