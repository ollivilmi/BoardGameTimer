import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="timer" options={{ headerShown: false, animation: 'fade' }} />
      </Stack>
      <StatusBar style="light" hidden />
    </GestureHandlerRootView>
  );
}
