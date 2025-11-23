import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type IconSymbolProps = {
  name: SymbolViewProps['name'] | string;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
};

// Map SF Symbols to Material Icons for Android
const iconMap: { [key: string]: string } = {
  'house': 'home',
  'house.fill': 'home',
  'book': 'menu-book',
  'book.fill': 'menu-book',
  'star': 'star',
  'star.fill': 'star',
  'clock': 'access-time',
  'clock.fill': 'access-time',
  'gearshape': 'settings',
  'gearshape.fill': 'settings',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: IconSymbolProps) {
  if (Platform.OS === 'ios') {
    // Use native SF Symbols on iOS
    return (
      <SymbolView
        name={name as SymbolViewProps['name']}
        weight={weight}
        tintColor={color}
        resizeMode="scaleAspectFit"
        style={[{ width: size, height: size }, style]}
      />
    );
  } else {
    // Use mapped MaterialIcons name for Android and web
    const materialIconName = iconMap[name] || name; // Fallback to original name if not mapped
    return <MaterialIcons name={materialIconName} size={size} color={color} style={style} />;
  }
}