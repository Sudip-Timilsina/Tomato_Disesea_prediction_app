
// import { Tabs } from 'expo-router';
// import React from 'react';
// import { Platform, StyleSheet } from 'react-native';
// import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
// import { HapticTab } from '@/components/HapticTab';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import TabBarBackground from '@/components/ui/TabBarBackground';
// import { Colors } from '@/constants/Colors';
// import { useColorScheme } from '@/hooks/useColorScheme';

// const AnimatedTabIcon = ({ name, color, focused, size }) => {
//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [
//         {
//           scale: withSpring(focused ? 1.15 : 1, {
//             damping: 15,
//             stiffness: 150,
//             mass: 1,
//           }),
//         },
//       ],
//     };
//   }, [focused]);

//   return (
//     <Animated.View style={animatedStyle}>
//       <IconSymbol
//         size={size}
//         name={focused ? `${name}.fill` : name}
//         color={color}
//       />
//     </Animated.View>
//   );
// };

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
  
//   const activeColor = Colors[colorScheme ?? 'light']?.tint ?? '#007AFF';
//   const inactiveColor = Colors[colorScheme ?? 'light']?.inactiveTint ?? '#8E8E93';

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: activeColor,
//         tabBarInactiveTintColor: inactiveColor,
//         headerShown: false,
//         tabBarButton: HapticTab,
//         tabBarBackground: () => (
//           <TabBarBackground style={styles.tabBarBackground} />
//         ),
//         tabBarStyle: [
//           styles.tabBar,
//           Platform.select({
//             ios: { 
//               position: 'absolute', 
//               borderTopWidth: 0,
//               backgroundColor: 'rgba(255, 255, 255, 0.95)',
//             },
//             android: { 
//               elevation: 8,
//               backgroundColor: '#ffffff',
//             },
//             default: {
//               backgroundColor: '#ffffff',
//             },
//           }),
//         ],
//         tabBarLabelStyle: styles.tabBarLabel,
//         tabBarItemStyle: styles.tabBarItem,
//         tabBarHideOnKeyboard: true,
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color, focused }) => (
//             <AnimatedTabIcon
//               size={Platform.OS === 'android' ? 24 : 28}
//               name="house"
//               color={color}
//               focused={focused}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="disease-guide"
//         options={{
//           title: 'Disease Guide',
//           tabBarIcon: ({ color, focused }) => (
//             <AnimatedTabIcon
//               size={Platform.OS === 'android' ? 24 : 28}
//               name="book"
//               color={color}
//               focused={focused}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="prediction"
//         options={{
//           title: 'Predict',
//           tabBarIcon: ({ color, focused }) => (
//             <AnimatedTabIcon
//               size={Platform.OS === 'android' ? 24 : 28}
//               name="star"
//               color={color}
//               focused={focused}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="history"
//         options={{
//           title: 'History',
//           tabBarIcon: ({ color, focused }) => (
//             <AnimatedTabIcon
//               size={Platform.OS === 'android' ? 24 : 28}
//               name="clock"
//               color={color}
//               focused={focused}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="settings"
//         options={{
//           title: 'Settings',
//           tabBarIcon: ({ color, focused }) => (
//             <AnimatedTabIcon
//               size={Platform.OS === 'android' ? 24 : 28}
//               name="gearshape"
//               color={color}
//               focused={focused}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

// const styles = StyleSheet.create({
//   tabBar: {
//     borderTopWidth: Platform.OS === 'ios' ? 0 : 0.5,
//     borderTopColor: Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.12)' : 'transparent',
//     paddingBottom: Platform.select({
//       ios: 20,
//       android: 8,
//       default: 8,
//     }),
//     paddingTop: Platform.select({
//       ios: 8,
//       android: 12,
//       default: 8,
//     }),
//     height: Platform.select({
//       ios: 90,
//       android: 65,
//       default: 65,
//     }),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
//     shadowRadius: Platform.OS === 'ios' ? 4 : 0,
//     elevation: Platform.OS === 'android' ? 8 : 0,
//   },
//   tabBarBackground: {
//     backgroundColor: 'transparent',
//     borderTopLeftRadius: Platform.OS === 'android' ? 0 : 20,
//     borderTopRightRadius: Platform.OS === 'android' ? 0 : 20,
//     overflow: 'hidden',
//   },
//   tabBarLabel: {
//     fontSize: Platform.select({
//       ios: 12,
//       android: 11,
//       default: 12,
//     }),
//     fontFamily: Platform.select({
//       ios: 'System',
//       android: 'Roboto',
//       default: 'System',
//     }),
//     fontWeight: Platform.select({
//       ios: '600',
//       android: '500',
//       default: '600',
//     }),
//     marginBottom: Platform.select({
//       ios: 4,
//       android: 2,
//       default: 4,
//     }),
//     marginTop: Platform.select({
//       ios: 0,
//       android: 2,
//       default: 0,
//     }),
//   },
//   tabBarItem: {
//     paddingVertical: Platform.select({
//       ios: 0,
//       android: 4,
//       default: 0,
//     }),
//   },
// });
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const AnimatedTabIcon = ({ name, color, focused, size }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(focused ? 1.15 : 1, {
            damping: 15,
            stiffness: 150,
            mass: 1,
          }),
        },
      ],
    };
  }, [focused]);

  return (
    <Animated.View style={animatedStyle}>
      <IconSymbol
        size={size}
        name={focused ? `${name}.fill` : name}
        color={color}
      />
    </Animated.View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const activeColor = Colors[colorScheme ?? 'light']?.tint ?? '#007AFF';
  const inactiveColor = Colors[colorScheme ?? 'light']?.inactiveTint ?? '#8E8E93';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <TabBarBackground style={styles.tabBarBackground} />
        ),
        tabBarStyle: [
          styles.tabBar,
          Platform.select({
            ios: {
              position: 'absolute',
              borderTopWidth: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
            android: {
              elevation: 8,
              backgroundColor: '#ffffff',
              marginBottom: 20, // ✅ This raises the tab bar on Android
            },
            default: {
              backgroundColor: '#ffffff',
            },
          }),
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              size={Platform.OS === 'android' ? 24 : 28}
              name="house"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="disease-guide"
        options={{
          title: 'Disease Guide',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              size={Platform.OS === 'android' ? 24 : 28}
              name="book"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="prediction"
        options={{
          title: 'Predict',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              size={Platform.OS === 'android' ? 24 : 28}
              name="star"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              size={Platform.OS === 'android' ? 24 : 28}
              name="clock"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: Platform.OS === 'ios' ? 0 : 0.5,
    borderTopColor: Platform.OS === 'android' ? 'rgba(0, 0, 0, 0.12)' : 'transparent',
    paddingBottom: Platform.select({
      ios: 20,
      android: 15, // ✅ slightly increased
      default: 8,
    }),
    paddingTop: Platform.select({
      ios: 8,
      android: 12,
      default: 8,
    }),
    height: Platform.select({
      ios: 90,
      android: 90, // ✅ slightly increased height
      default: 65,
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: Platform.OS === 'ios' ? 4 : 0,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  tabBarBackground: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: Platform.OS === 'android' ? 0 : 20,
    borderTopRightRadius: Platform.OS === 'android' ? 0 : 20,
    overflow: 'hidden',
  },
  tabBarLabel: {
    fontSize: Platform.select({
      ios: 12,
      android: 11,
      default: 12,
    }),
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    fontWeight: Platform.select({
      ios: '600',
      android: '500',
      default: '600',
    }),
    marginBottom: Platform.select({
      ios: 4,
      android: 2,
      default: 4,
    }),
    marginTop: Platform.select({
      ios: 0,
      android: 2,
      default: 0,
    }),
  },
  tabBarItem: {
    paddingVertical: Platform.select({
      ios: 0,
      android: 4,
      default: 0,
    }),
  },
});
