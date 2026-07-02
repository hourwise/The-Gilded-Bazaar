import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface WalletProps {
  gold: number;
  silver: number;
  copper: number;
}

const Wallet = ({ gold, silver, copper }: WalletProps) => {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: 'rgba(46, 8, 84, 0.9)' }]} elevation={2}>
      <View style={styles.coinContainer}>
        <MaterialCommunityIcons name="circle" color="#ffd700" size={18} />
        <Text style={styles.coinText}>{gold} GP</Text>
      </View>
      <View style={styles.coinContainer}>
        <MaterialCommunityIcons name="circle" color="#c0c0c0" size={18} />
        <Text style={styles.coinText}>{silver} SP</Text>
      </View>
      <View style={styles.coinContainer}>
        <MaterialCommunityIcons name="circle" color="#cd7f32" size={18} />
        <Text style={styles.coinText}>{copper} CP</Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinText: {
    color: '#f5f5dc',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 16,
  },
});

export default Wallet;
