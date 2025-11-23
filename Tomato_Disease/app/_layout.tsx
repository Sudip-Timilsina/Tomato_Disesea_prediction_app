

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Text } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading time
    return () => clearTimeout(timer);
  }, []);

  if (!loaded || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/app-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: Colors[colorScheme ?? 'light'].text }]}>
            TomatoDoc AI
          </Text>
        </View>
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme ?? 'light'].tint}
          style={styles.loader}
        />
        <Text style={[styles.footerText, { color: Colors[colorScheme ?? 'light'].text }]}>
        Made by Sudip Timilsina
      </Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="disease/[id]" options={{ title: 'Disease Details' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  footerText: {
  marginTop: 30,
  fontSize: 14,
  fontStyle: 'italic',
  textAlign: 'center',
  opacity: 0.6,
},

});