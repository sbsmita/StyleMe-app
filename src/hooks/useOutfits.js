import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

const OUTFITS_STORAGE_KEY = '@StyleMe_outfits';

const useOutfits = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOutfits = useCallback(async () => {
    setLoading(true);
    try {
      const storedOutfits = await AsyncStorage.getItem(OUTFITS_STORAGE_KEY);
      if (storedOutfits !== null) {
        setOutfits(JSON.parse(storedOutfits));
      } else {
        setOutfits([]); // Ensure it's an empty array if nothing is stored
      }
    } catch (error) {
      console.error('Failed to load outfits from storage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOutfits();
  }, [loadOutfits]);

  const saveOutfitsToStorage = async newOutfits => {
    try {
      await AsyncStorage.setItem(OUTFITS_STORAGE_KEY, JSON.stringify(newOutfits));
      setOutfits(newOutfits);
    } catch (error) {
      console.error('Failed to save outfits to storage', error);
    }
  };

  const addOutfit = async outfitData => {
    const newOutfit = {id: uuidv4(), ...outfitData};
    const newOutfits = [...outfits, newOutfit];
    await saveOutfitsToStorage(newOutfits);
  };

  const deleteOutfit = async id => {
    const newOutfits = outfits.filter(outfit => outfit.id !== id);
    await saveOutfitsToStorage(newOutfits);
  };

  return {outfits, loading, addOutfit, deleteOutfit, refreshOutfits: loadOutfits};
};

export default useOutfits;
