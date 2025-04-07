import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { getMediaFiles } from '../utils/storage';
import { requestMediaPermissions } from '../utils/permissions';

const DroneMediaScreen = () => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'photos', 'videos'
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      loadMediaFiles();
    }
  }, [selectedType, hasPermission]);

  const checkPermissions = async () => {
    const granted = await requestMediaPermissions();
    setHasPermission(granted);
    
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'This app needs access to your media to show drone photos and videos.',
        [{ text: 'OK' }]
      );
    }
  };

  const loadMediaFiles = async () => {
    try {
      const files = await getMediaFiles(selectedType);
      setMediaFiles(files);
    } catch (error) {
      console.error('Error loading media files:', error);
    }
  };

  const renderMediaItem = ({ item }) => {
    const isVideo = item.path.toLowerCase().endsWith('.mp4');
    
    return (
      <TouchableOpacity
        style={styles.mediaItem}
        onPress={() => {
          // TODO: Implement media preview/playback
          console.log('Opening media:', item.path);
        }}
      >
        {/* For now, we'll just show a placeholder with file name */}
        <View style={styles.mediaPreview}>
          <Text style={styles.mediaType}>{isVideo ? '🎥' : '📷'}</Text>
        </View>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterButtons}>
        <TouchableOpacity
          style={[styles.filterButton, selectedType === 'all' && styles.selectedFilter]}
          onPress={() => setSelectedType('all')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedType === 'photos' && styles.selectedFilter]}
          onPress={() => setSelectedType('photos')}
        >
          <Text style={styles.filterText}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedType === 'videos' && styles.selectedFilter]}
          onPress={() => setSelectedType('videos')}
        >
          <Text style={styles.filterText}>Videos</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mediaFiles}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.path}
        numColumns={2}
        contentContainerStyle={styles.mediaList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterButtons: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mediaList: {
    padding: 8,
  },
  mediaItem: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  mediaPreview: {
    aspectRatio: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaType: {
    fontSize: 32,
  },
  fileName: {
    fontSize: 12,
    padding: 8,
    textAlign: 'center',
  },
});

export default DroneMediaScreen; 