// import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
// import { PlatformPressable } from '@react-navigation/elements';
// import * as Haptics from 'expo-haptics';

// export function HapticTab(props: BottomTabBarButtonProps) {
//   return (
//     <PlatformPressable
//       {...props}
//       onPressIn={(ev) => {
//         if (process.env.EXPO_OS === 'ios') {
//           // Add a soft haptic feedback when pressing down on the tabs.
//           Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//         }
//         props.onPressIn?.(ev);
//       }}
//     />
//   );
// }
import React from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

export const HapticTab = (props) => {
  return (
    <Pressable
      onPressIn={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      {...props}
    />
  );
};

