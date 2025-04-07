import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';

const VideoFeed = () => {

    return (
        <View style={styles.container}>
            <VLCPlayer
                style={styles.player}
                videoAspectRatio="16:9"
                autoplay={true}
                source={{ uri: 'udp://0.0.0.0:11111' }}
                onError={(e) => console.log('Error:', e)}
                onProgress={(e) => console.log('Progress:', e)}
                resizeMode="cover"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    player: {
        width: '100%',
        aspectRatio: 16/9
    }
});

export default VideoFeed; 