import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS} from '../constants/colors';

const StarRating = ({rating = 0, onRatingChange, size = 30, disabled = false}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map(star => (
        <TouchableOpacity
          key={star}
          disabled={disabled}
          onPress={() => onRatingChange && onRatingChange(star)}>
          <Icon
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={COLORS.star}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 2,
  },
});

export default StarRating;
