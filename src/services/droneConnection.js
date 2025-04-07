import dgram from 'react-native-udp';
import { store } from '@/store/store';
import { setConnectionStatus, setStreamEnabled } from '@/store/slices/droneSlice';
import { EventEmitter } from 'events';

// Tello drone connection constants
const TELLO_IP = '192.168.10.1';
const TELLO_CMD_PORT = 8889;


const MONITOR_INTERVAL = 10000; // 10 seconds

class DroneConnection extends EventEmitter {
    constructor() {
        super();
        this.socket = dgram.createSocket('udp4');
        this.monitorInterval = null;
        this.videoSocket = null;
        this.recordingData = null;
        this.isRecording = false;
        
        this.socket.on('message', (message) => {
            const response = message.toString().trim();
            console.log('Received from Tello:', response);
            
            // Check if response is a number (battery or time response)
            // The response object has access to the command that was sent cause of closure
            if (!isNaN(response)) {
                if (this.lastCommand === 'battery?') {
                    this.emit('battery', parseInt(response));
                } else if (this.lastCommand === 'time?') {
                    this.emit('flightTime', parseInt(response));
                }
            }
        });

        this.socket.on('error', (error) => {
            console.error('Command socket error:', error);
            store.dispatch(setConnectionStatus(false));
            this.stopMonitoring();
        });
    }

    // Send command to Tello drone
    async sendCommand(command) {
        return new Promise((resolve, reject) => {
            this.lastCommand = command;
            
            // Set a timeout for command response
            const timeout = setTimeout(() => {
                reject(new Error('Command timeout'));
            }, 5000);

            // Send the command
            this.socket.send(
                command,
                0,
                command.length,
                TELLO_CMD_PORT,
                TELLO_IP,
                (error) => {
                    if (error) {
                        clearTimeout(timeout);
                        reject(error);
                        return;
                    }

                    // Wait for response
                    this.socket.once('message', (response) => {
                        clearTimeout(timeout);
                        const responseStr = response.toString().trim();
                        if (responseStr === 'ok' || !isNaN(responseStr)) {
                            resolve(responseStr);
                        } else {
                            reject(new Error(`Command failed: ${responseStr}`));
                        }
                    });
                }
            );
        });
    }

    // Start monitoring battery and flight time
    startMonitoring() {
        if (this.monitorInterval) return;
        
        const monitor = async () => {
            try {
                const battery = await this.sendCommand('battery?');
                const flightTime = await this.sendCommand('time?');
                console.log(`Monitoring - Battery: ${battery}%, Flight Time: ${flightTime}s`);
            } catch (error) {
                console.error('Monitoring error:', error);
            }
        };

        // Run immediately and then every MONITOR_INTERVAL
        monitor();
        this.monitorInterval = setInterval(monitor, MONITOR_INTERVAL);
    }

    // Stop monitoring
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
    }

    // Connect to the drone
    async connect() {
        try {
            await this.sendCommand('command');
            store.dispatch(setConnectionStatus(true));
            console.log('Successfully connected to Tello drone');
            this.startMonitoring();
            return true;
        } catch (error) {
            console.error('Failed to connect to Tello drone:', error);
            store.dispatch(setConnectionStatus(false));
            return false;
        }
    }

    async videoStream() {
        try {
            const videoStream = await this.sendCommand('streamon');
            store.dispatch(setStreamEnabled(true));
            console.log('Video stream started:', videoStream);
        } catch (error) {
            console.error('Failed to start video stream:', error);
            store.dispatch(setStreamEnabled(false));
        }
    }

    async stopVideoStream() {
        try {
            const stopStream = await this.sendCommand('streamoff');
            store.dispatch(setStreamEnabled(false));
            console.log('Video stream stopped:', stopStream);
        } catch (error) {
            console.error('Failed to stop video stream:', error);
            store.dispatch(setStreamEnabled(false));
        }
    }

    async capturePhoto() {
        if (!this.isConnectedToDrone() || !store.getState().drone.streamEnabled) {
            throw new Error('Drone not connected or stream not enabled');
        }

        try {
            // Send snapshot command to the drone
            await this.sendCommand('snapshot');
            
            // Create a promise that will resolve with the photo data
            return new Promise((resolve, reject) => {
                // Set up a one-time listener for the photo data
                this.videoSocket = dgram.createSocket('udp4');
                
                this.videoSocket.on('message', (data) => {
                    // Convert the received buffer to base64
                    const base64Data = data.toString('base64');
                    
                    // Clean up the video socket
                    this.videoSocket.close();
                    this.videoSocket = null;
                    
                    resolve(base64Data);
                });

                this.videoSocket.on('error', (error) => {
                    this.videoSocket.close();
                    this.videoSocket = null;
                    reject(error);
                });

                // Bind to the video port to receive the snapshot
                this.videoSocket.bind(11111);

                // Set a timeout for the photo capture
                setTimeout(() => {
                    if (this.videoSocket) {
                        this.videoSocket.close();
                        this.videoSocket = null;
                        reject(new Error('Photo capture timeout'));
                    }
                }, 5000); // 5 second timeout
            });
        } catch (error) {
            console.error('Failed to capture photo:', error);
            throw error;
        }
    }

    async startRecording() {
        if (!this.isConnectedToDrone() || !store.getState().drone.streamEnabled) {
            throw new Error('Drone not connected or stream not enabled');
        }

        if (this.isRecording) {
            throw new Error('Already recording');
        }

        try {
            // Create a buffer to store video data
            this.recordingData = Buffer.alloc(0);
            this.isRecording = true;

            // Create a promise that will collect video data
            return new Promise((resolve, reject) => {
                // Set up video socket if not exists
                if (!this.videoSocket) {
                    this.videoSocket = dgram.createSocket('udp4');
                    
                    this.videoSocket.on('message', (data) => {
                        if (this.isRecording) {
                            // Append new data to recording buffer
                            this.recordingData = Buffer.concat([this.recordingData, data]);
                        }
                    });

                    this.videoSocket.on('error', (error) => {
                        this.stopRecording();
                        reject(error);
                    });

                    // Bind to the video port
                    this.videoSocket.bind(11111);
                }

                resolve(true);
            });
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.isRecording = false;
            throw error;
        }
    }

    async stopRecording() {
        if (!this.isRecording) {
            throw new Error('Not recording');
        }

        try {
            this.isRecording = false;
            
            // Convert the recorded buffer to base64
            const videoData = this.recordingData.toString('base64');
            
            // Clear the recording buffer
            this.recordingData = null;

            // Close video socket if it exists
            if (this.videoSocket) {
                this.videoSocket.close();
                this.videoSocket = null;
            }

            return videoData;
        } catch (error) {
            console.error('Failed to stop recording:', error);
            throw error;
        }
    }

    // Disconnect from the drone
    disconnect() {
        this.stopMonitoring();
        if (this.socket) {
            this.socket.close();
        }
        store.dispatch(setConnectionStatus(false));
        console.log('Disconnected from Tello drone');
    }

    // Check if connected to the drone
    isConnectedToDrone() {
        return store.getState().drone.isConnected;
    }
}

// Create and export a single instance
const droneConnection = new DroneConnection();
export default droneConnection;