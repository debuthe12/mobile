import RNFS from 'react-native-fs';

// Log the actual path
console.log('Document Directory Path:', RNFS.DocumentDirectoryPath);

// Constants for media directories
const MEDIA_DIR = {
  BASE: `${RNFS.DocumentDirectoryPath}/drone_media`,
  PHOTOS: `${RNFS.DocumentDirectoryPath}/drone_media/photos`,
  VIDEOS: `${RNFS.DocumentDirectoryPath}/drone_media/videos`,
};

// Create necessary directories
export const initializeMediaStorage = async () => {
  try {
    // Create directories if they don't exist
    await RNFS.mkdir(MEDIA_DIR.BASE);
    await RNFS.mkdir(MEDIA_DIR.PHOTOS);
    await RNFS.mkdir(MEDIA_DIR.VIDEOS);
    
    console.log('Media directories initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize media storage:', error);
    return false;
  }
};

// Save photo function
export const savePhoto = async (base64Data, fileName) => {
  try {
    const timestamp = Date.now();
    const photoPath = `${MEDIA_DIR.PHOTOS}/photo_${timestamp}_${fileName}.jpg`;
    await RNFS.writeFile(photoPath, base64Data, 'base64');
    return photoPath;
  } catch (error) {
    console.error('Failed to save photo:', error);
    throw error;
  }
};

// Save video function
export const saveVideo = async (videoData, fileName) => {
  try {
    const timestamp = Date.now();
    const videoPath = `${MEDIA_DIR.VIDEOS}/video_${timestamp}_${fileName}.mp4`;
    await RNFS.writeFile(videoPath, videoData, 'base64');
    return videoPath;
  } catch (error) {
    console.error('Failed to save video:', error);
    throw error;
  }
};

// Get saved media files
export const getMediaFiles = async (type = 'all') => {
  try {
    let files = [];
    if (type === 'all' || type === 'photos') {
      const photos = await RNFS.readDir(MEDIA_DIR.PHOTOS);
      files = [...files, ...photos];
    }
    if (type === 'all' || type === 'videos') {
      const videos = await RNFS.readDir(MEDIA_DIR.VIDEOS);
      files = [...files, ...videos];
    }
    return files;
  } catch (error) {
    console.error('Failed to get media files:', error);
    throw error;
  }
};

// Delete media file
export const deleteMediaFile = async (filePath) => {
  try {
    await RNFS.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw error;
  }
};

export default {
  MEDIA_DIR,
  initializeMediaStorage,
  savePhoto,
  saveVideo,
  getMediaFiles,
  deleteMediaFile,
};