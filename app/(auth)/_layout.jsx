import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F172A' },
      
      }}
    >
      <Stack.Screen name="index"  title="Sign In" />
      <Stack.Screen name="signup" />
    </Stack>
  )
}