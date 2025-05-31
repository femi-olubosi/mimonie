import { useFonts } from 'expo-font';

export default function useAppFonts() {
  return useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    er: require('@/assets/fonts/Epilogue/static/Epilogue-Regular.ttf'),
    em: require('@/assets/fonts/Epilogue/static/Epilogue-Medium.ttf'),
    eb: require('@/assets/fonts/Epilogue/static/Epilogue-Bold.ttf'),
    esb: require('@/assets/fonts/Epilogue/static/Epilogue-SemiBold.ttf'),
    ir: require('@/assets/fonts/Inter/static/Inter-Regular.ttf'),
    im: require('@/assets/fonts/Inter/static/Inter-Medium.ttf'),
    ib: require('@/assets/fonts/Inter/static/Inter-Bold.ttf'),
    isb: require('@/assets/fonts/Inter/static/Inter-SemiBold.ttf'),
  });
}
