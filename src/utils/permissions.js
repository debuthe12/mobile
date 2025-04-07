import { PermissionsAndroid, Platform } from 'react-native';

export const requestMediaPermissions = async () => {
  if (Platform.OS !== 'android') return true;

  try {
    if (Platform.Version >= 33) {
      // For Android 13 and above
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      return Object.values(results).every(
        result => result === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      // For Android 12 and below
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Media Access Permission",
          message: "App needs access to your media to show drone photos and videos.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
}; 