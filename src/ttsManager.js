import * as Speech from 'expo-speech';

export function speakAsync(text) {
  return new Promise((resolve) => {
    Speech.speak(text, { language: 'ja', onDone: resolve });
  });
}
