import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { authService } from '../services/authService';

const AuthScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const theme = useTheme();

  async function signInWithEmail() {
    setLoading(true);
    setErrorMsg(null);
    const { error } = await authService.signIn(email, password);
    if (error) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await authService.signUp(email, password);
    if (error) {
      setErrorMsg(error.message);
    } else if (!data.session) {
      setErrorMsg('Check your inbox for email verification!');
    }
    setLoading(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="displaySmall" style={[styles.title, { color: '#FFD700' }]}>
        The Gilded Bazaar
      </Text>
      {errorMsg && (
        <Text style={styles.errorText}>{errorMsg}</Text>
      )}
      <TextInput
        label="Email"
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="email@address.com"
        autoCapitalize={'none'}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoComplete="email"
      />
      <TextInput
        label="Password"
        onChangeText={(text) => setPassword(text)}
        value={password}
        secureTextEntry={true}
        placeholder="Password"
        autoCapitalize={'none'}
        mode="outlined"
        style={styles.input}
        autoComplete="password"
      />
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          disabled={loading}
          onPress={() => signInWithEmail()}
          style={styles.button}
        >
          Sign In
        </Button>
        <Button
          mode="outlined"
          disabled={loading}
          onPress={() => signUpWithEmail()}
          style={styles.button}
        >
          Sign Up
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    marginBottom: 10,
  },
  errorText: {
    color: '#ff8a80',
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default AuthScreen;
