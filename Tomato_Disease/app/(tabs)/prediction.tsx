import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  Platform, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Text, 
  Dimensions,
  Animated,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Modal,
  Share,
  BackHandler
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { diseaseInfo } from '@/data/diseaseInfo';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function PredictionScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // Safe animation refs with error handling
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Get theme colors
  const getThemeColors = () => {
    return {
      background: isDarkMode ? '#121212' : '#F5F5F5',
      surface: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      primary: isDarkMode ? '#4CAF50' : '#2E7D32',
      primaryVariant: isDarkMode ? '#66BB6A' : '#1B5E20',
      text: isDarkMode ? '#FFFFFF' : '#000000',
      textSecondary: isDarkMode ? '#B0B0B0' : '#666666',
      border: isDarkMode ? '#333333' : '#E0E0E0',
      success: isDarkMode ? '#4CAF50' : '#2E7D32',
      warning: isDarkMode ? '#FFA726' : '#FF9800',
      error: isDarkMode ? '#EF5350' : '#F44336',
      headerBg: isDarkMode ? '#1B5E20' : '#2E7D32',
      cardBg: isDarkMode ? '#2A2A2A' : '#FFFFFF',
    };
  };

  const theme = getThemeColors();

  // Safe animation with error handling
  const startAnimations = useCallback(() => {
    try {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.warn('Animation error:', error);
      // Fallback: set values directly
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    startAnimations();
  }, [startAnimations]);

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (showImageModal) {
          setShowImageModal(false);
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }
  }, [showImageModal]);

  // Request permissions with better error handling
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (Platform.OS === 'android') {
          // Request permissions separately for better compatibility
          const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
          const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
          
          setHasPermission(
            cameraStatus.status === 'granted' && 
            mediaLibraryStatus.status === 'granted'
          );
        } else {
          // iOS
          const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
          const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
          setHasPermission(
            cameraStatus.status === 'granted' && 
            mediaLibraryStatus.status === 'granted'
          );
        }
      } catch (error) {
        console.error('Permission error:', error);
        setHasPermission(false);
      }
    };

    requestPermissions();
  }, []);

  const normalizeClassName = (className) => {
    if (!className) return null;
    try {
      const normalized = String(className).trim();
      return normalized;
    } catch (error) {
      console.error('Error normalizing class name:', error);
      return null;
    }
  };

  const findDiseaseInfo = (className) => {
    if (!className) return null;
    
    try {
      const normalizedClass = normalizeClassName(className);
      if (!normalizedClass) return null;
      
      // Direct match
      if (diseaseInfo && diseaseInfo[normalizedClass]) return diseaseInfo[normalizedClass];
      
      // Case insensitive match
      const lowerClass = normalizedClass.toLowerCase();
      for (const key in diseaseInfo) {
        if (key.toLowerCase() === lowerClass) return diseaseInfo[key];
      }
      
      // Handle underscore variations
      const singleUnderscoreClass = normalizedClass.replace(/___/g, '_');
      if (diseaseInfo[singleUnderscoreClass]) return diseaseInfo[singleUnderscoreClass];
      
      const tripleUnderscoreClass = normalizedClass.replace(/_/g, '___');
      if (diseaseInfo[tripleUnderscoreClass]) return diseaseInfo[tripleUnderscoreClass];
      
      // Partial match
      for (const key in diseaseInfo) {
        if (key.toLowerCase().includes(lowerClass) || lowerClass.includes(key.toLowerCase())) {
          return diseaseInfo[key];
        }
      }
    } catch (error) {
      console.error('Error finding disease info:', error);
    }
    
    return null;
  };

  const savePrediction = async (prediction) => {
    try {
      const existing = await AsyncStorage.getItem('predictions');
      const predictions = existing ? JSON.parse(existing) : [];
      const newPrediction = {
        id: Date.now().toString(),
        class: prediction.class,
        confidence: prediction.confidence,
        timestamp: new Date().toISOString(),
        imageUri: preview,
      };
      predictions.unshift(newPrediction);
      
      // Keep only last 50 predictions to manage storage
      const limitedPredictions = predictions.slice(0, 50);
      await AsyncStorage.setItem('predictions', JSON.stringify(limitedPredictions));
    } catch (err) {
      console.error('Error saving prediction:', err);
      // Don't show alert for storage errors, just log
    }
  };

  const sendFile = useCallback(async () => {
    if (!image || !selectedFile || !selectedFile.uri) {
      setData({ error: 'No valid file selected' });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setNetworkError(false);
    
    try {
      let localUri = selectedFile.uri;
      let fileName = `tomato-leaf-${Date.now()}.jpg`;
      let mimeType = 'image/jpeg';

      // Enhanced Android file handling
      if (Platform.OS === 'android') {
        if (localUri.startsWith('content://')) {
          try {
            const extension = selectedFile.fileName ? 
              selectedFile.fileName.split('.').pop()?.toLowerCase() || 'jpg' : 
              'jpg';
            fileName = `tomato-leaf-${Date.now()}.${extension}`;
            const tempUri = `${FileSystem.cacheDirectory}${fileName}`;
            
            // Copy file to cache directory
            await FileSystem.copyAsync({ 
              from: localUri, 
              to: tempUri 
            });
            localUri = tempUri;
          } catch (copyError) {
            console.error('File copy error:', copyError);
            throw new Error('Failed to process the selected image. Please try again.');
          }
        }
      }

      // Verify file exists and get info
      let fileInfo;
      try {
        fileInfo = await FileSystem.getInfoAsync(localUri);
        if (!fileInfo.exists) {
          throw new Error(`File does not exist at ${localUri}`);
        }
      } catch (fileError) {
        console.error('File verification error:', fileError);
        throw new Error('Failed to access the selected image. Please try again.');
      }

      // Determine MIME type more safely
      const fileExtension = localUri.split('.').pop()?.toLowerCase() || 'jpg';
      mimeType = fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'image/jpeg' : 
                 fileExtension === 'png' ? 'image/png' : 
                 'image/jpeg'; // fallback

      const formData = new FormData();
      formData.append('file', { 
        uri: localUri, 
        name: fileName, 
        type: mimeType 
      });

      // Enhanced API call with better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // Increased timeout

      const response = await axios.post(
        'https://Sudip0908-TomatoApp.hf.space/predict', 
        formData, 
        {
          headers: { 
            'Content-Type': 'multipart/form-data', 
            'Accept': 'application/json' 
          },
          timeout: 45000,
          signal: controller.signal,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      clearTimeout(timeoutId);
      
      if (response.data) {
        setData(response.data);
        await savePrediction(response.data);
        setRetryCount(0);
        
        // Success animation with error handling
        try {
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        } catch (animError) {
          console.warn('Success animation error:', animError);
        }
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (err) {
      console.error('Prediction error:', err);
      setNetworkError(true);
      
      let errorMessage = 'Unable to analyze the image';
      
      if (err.code === 'ECONNABORTED' || err.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your internet connection and try again.';
      } else if (err.response) {
        errorMessage = `Server error: ${err.response.status}. Please try again later.`;
      } else if (err.request) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setData({ error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [image, selectedFile, preview, scaleAnim]);

  const retryPrediction = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      sendFile();
    } else {
      Alert.alert(
        'Multiple Failures',
        'The prediction has failed multiple times. Please check your internet connection and try with a different image.',
        [{ text: 'OK' }]
      );
    }
  };

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
    setNetworkError(false);
    setRetryCount(0);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    clearData();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    setPreview(selectedFile.uri);
  }, [selectedFile]);

  useEffect(() => {
    if (!preview) return;
    sendFile();
  }, [preview, sendFile]);

  const showImagePickerOptions = () => {
    if (hasPermission === false) {
      Alert.alert(
        'Permissions Required', 
        'Camera and photo library access is needed to analyze tomato leaves. Please enable permissions in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Select Image Source', 
      'How would you like to capture the tomato leaf?', 
      [
        { 
          text: '📸 Take Photo', 
          onPress: onTakePhoto,
          style: 'default'
        },
        { 
          text: '🖼️ Choose from Gallery', 
          onPress: onSelectFile,
          style: 'default'
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
      ]
    );
  };

  const onTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: Platform.OS === 'android' ? 0.7 : 0.8, // Lower quality for Android
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        exif: false, // Disable EXIF data to reduce size
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setData(null);
        setImage(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Camera Error', 'Failed to take photo. Please try again.');
    }
  };

  const onSelectFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: Platform.OS === 'android' ? 0.7 : 0.8, // Lower quality for Android
        allowsMultipleSelection: false,
        exif: false, // Disable EXIF data
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setData(null);
        setImage(true);
      }
    } catch (err) {
      console.error('Image selection error:', err);
      Alert.alert('Selection Error', 'Failed to select image. Please try again.');
    }
  };

  const shareResults = async () => {
    if (!data || data.error || !diseaseData) return;
    
    try {
      const confidence = data.confidence ? (parseFloat(data.confidence) * 100).toFixed(1) : 0;
      const message = `🍅 Tomato Leaf Analysis Results\n\n` +
                    `Diagnosis: ${diseaseData.name}\n` +
                    `Confidence: ${confidence}%\n` +
                    `Severity: ${diseaseData.severity}\n\n` +
                    `Analyzed with TomatoApp`;
      
      await Share.share({
        message,
        title: 'Tomato Leaf Analysis Results'
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const confidence = data && data.confidence ? (parseFloat(data.confidence) * 100).toFixed(1) : 0;
  const diseaseData = data && data.class ? findDiseaseInfo(data.class) : null;

  const dynamicStyles = createDynamicStyles(theme);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.headerBg }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "light-content"} 
        backgroundColor={theme.headerBg} 
      />
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, dynamicStyles.header]}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={[styles.headerTitle, { color: 'white' }]}>
                🍅 AI Plant Doctor
              </Text>
              <Text style={[styles.headerSubtitle, { color: '#C8E6C9' }]}>
                Get instant diagnosis for your tomato plants
              </Text>
            </Animated.View>
          </View>

          <Animated.View 
            style={[
              styles.mainContent, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.imageSection}>
              {image ? (
                <Animated.View style={[
                  dynamicStyles.imageContainer, 
                  { transform: [{ scale: scaleAnim }] }
                ]}>
                  <TouchableOpacity onPress={() => setShowImageModal(true)}>
                    <Image 
                      source={{ uri: preview }} 
                      style={styles.capturedImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <View style={styles.imageActions}>
                    <TouchableOpacity style={styles.retakeButton} onPress={showImagePickerOptions}>
                      <Ionicons name="refresh" size={18} color="white" />
                      <Text style={styles.retakeButtonText}>Retake</Text>
                    </TouchableOpacity>
                    {diseaseData && (
                      <TouchableOpacity style={styles.shareButton} onPress={shareResults}>
                        <Ionicons name="share" size={18} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              ) : (
                <TouchableOpacity 
                  style={[styles.captureButton, dynamicStyles.captureButton]} 
                  onPress={showImagePickerOptions}
                >
                  <View style={styles.captureButtonContent}>
                    <Ionicons name="camera" size={48} color={theme.primary} />
                    <Text style={[styles.captureText, { color: theme.primary }]}>
                      Capture Leaf
                    </Text>
                    <Text style={[styles.captureSubtext, { color: theme.textSecondary }]}>
                      Take a clear photo of the tomato leaf
                    </Text>
                    <View style={[styles.tipsContainer, dynamicStyles.tipsContainer]}>
                      <Text style={[styles.tipsText, { color: theme.primary }]}>
                        💡 Tips: Use good lighting, focus on affected areas
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {isLoading && (
              <Animated.View style={[
                styles.loadingContainer, 
                dynamicStyles.loadingContainer,
                { opacity: fadeAnim }
              ]}>
                <ActivityIndicator size="large" color={theme.success} />
                <Text style={[styles.loadingText, { color: theme.success }]}>
                  Analyzing leaf...
                </Text>
                <Text style={[styles.loadingSubtext, { color: theme.textSecondary }]}>
                  AI is examining your tomato plant
                </Text>
                <View style={[styles.progressIndicator, dynamicStyles.progressIndicator]}>
                  <View style={[styles.progressBar, { backgroundColor: theme.success }]} />
                </View>
              </Animated.View>
            )}

            {data && !isLoading && (
              <Animated.View style={[
                styles.resultsSection, 
                { opacity: fadeAnim }
              ]}>
                {data.error ? (
                  <View style={[styles.errorContainer, dynamicStyles.errorContainer]}>
                    <Ionicons name="warning" size={48} color={theme.error} />
                    <Text style={[styles.errorText, { color: theme.error }]}>
                      Analysis Failed
                    </Text>
                    <Text style={[styles.errorDetail, { color: theme.textSecondary }]}>
                      {data.error}
                    </Text>
                    {networkError && retryCount < 3 && (
                      <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.warning }]} onPress={retryPrediction}>
                        <Ionicons name="refresh" size={16} color="white" />
                        <Text style={styles.retryButtonText}>
                          Retry ({retryCount + 1}/3)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View style={[styles.diagnosisContainer, dynamicStyles.diagnosisContainer]}>
                    <View style={styles.diagnosisHeader}>
                      <Text style={[styles.diagnosisTitle, { color: theme.primary }]}>
                        🔬 Diagnosis Results
                      </Text>
                      <View style={[
                        styles.confidenceBadge, 
                        { 
                          backgroundColor: confidence > 80 ? theme.success : 
                                         confidence > 60 ? theme.warning : theme.error 
                        }
                      ]}>
                        <Text style={styles.confidenceText}>
                          {confidence}% Confidence
                        </Text>
                      </View>
                    </View>

                    {!diseaseData && (
                      <View style={[styles.warningContainer, dynamicStyles.warningContainer]}>
                        <Ionicons name="alert-circle" size={24} color={theme.warning} />
                        <Text style={[styles.warningText, { color: theme.text }]}>
                          Unknown Classification
                        </Text>
                        <Text style={[styles.warningDetail, { color: theme.textSecondary }]}>
                          Backend returned: "{data.class}" but no matching disease information found.
                        </Text>
                      </View>
                    )}

                    {diseaseData && (
                      <View style={styles.diseaseCard}>
                        <View style={styles.diseaseHeader}>
                          <Text style={[styles.diseaseName, { color: theme.primaryVariant }]}>
                            {diseaseData.name}
                          </Text>
                          <View style={[styles.severityBadge, { backgroundColor: diseaseData.severity_color || theme.warning }]}>
                            <Ionicons name="alert" size={12} color="white" />
                            <Text style={styles.severityText}>{diseaseData.severity}</Text>
                          </View>
                        </View>

                        <Text style={[styles.diseaseDescription, { color: theme.text }]}>
                          {diseaseData.description}
                        </Text>

                        <View style={styles.infoGrid}>
                          <View style={[styles.infoSection, dynamicStyles.infoSection]}>
                            <Text style={[styles.infoTitle, { color: theme.primary }]}>
                              🔍 Symptoms
                            </Text>
                            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                              {diseaseData.symptoms}
                            </Text>
                          </View>

                          <View style={[styles.infoSection, dynamicStyles.infoSection]}>
                            <Text style={[styles.infoTitle, { color: theme.primary }]}>
                              🦠 Causes
                            </Text>
                            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                              {diseaseData.causes}
                            </Text>
                          </View>

                          <View style={[styles.infoSection, dynamicStyles.infoSection]}>
                            <Text style={[styles.infoTitle, { color: theme.primary }]}>
                              💊 Treatment
                            </Text>
                            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                              {diseaseData.treatment}
                            </Text>
                          </View>

                          <View style={[styles.infoSection, dynamicStyles.infoSection]}>
                            <Text style={[styles.infoTitle, { color: theme.primary }]}>
                              🛡️ Prevention
                            </Text>
                            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                              {diseaseData.prevention}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={[styles.detailButton, { backgroundColor: theme.primary }]}
                            onPress={() => {
                              try {
                                router.push(`/disease/${data.class}`);
                              } catch (error) {
                                console.error('Navigation error:', error);
                              }
                            }}
                          >
                            <Ionicons name="information-circle" size={20} color="white" />
                            <Text style={styles.detailButtonText}>View Full Details</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[
                              styles.shareResultButton, 
                              { 
                                backgroundColor: theme.surface,
                                borderColor: theme.primary 
                              }
                            ]} 
                            onPress={shareResults}
                          >
                            <Ionicons name="share" size={20} color={theme.primary} />
                            <Text style={[styles.shareResultButtonText, { color: theme.primary }]}>
                              Share Results
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <TouchableOpacity 
                      style={[styles.newAnalysisButton, { backgroundColor: theme.primary }]} 
                      onPress={clearData}
                    >
                      <Ionicons name="add-circle" size={20} color="white" />
                      <Text style={styles.newAnalysisButtonText}>New Analysis</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Image Modal */}
        <Modal 
          visible={showImageModal} 
          transparent 
          animationType="fade"
          onRequestClose={() => setShowImageModal(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalBackground} 
              onPress={() => setShowImageModal(false)}
              activeOpacity={1}
            >
              <View style={styles.modalContent}>
                {preview && (
                  <Image 
                    source={{ uri: preview }} 
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                )}
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setShowImageModal(false)}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

// Dynamic styles function
const createDynamicStyles = (theme) => StyleSheet.create({
  header: {
    backgroundColor: theme.headerBg,
  },
  captureButton: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
  },
  tipsContainer: {
    backgroundColor: theme.isDarkMode ? 'rgba(76, 175, 80, 0.1)' : '#E8F5E8',
  },
  imageContainer: {
    shadowColor: theme.isDarkMode ? '#000' : '#000',
  },
  loadingContainer: {
    backgroundColor: theme.cardBg,
  },
  progressIndicator: {
    backgroundColor: theme.border,
  },
  errorContainer: {
    backgroundColor: theme.cardBg,
  },
  warningContainer: {
    backgroundColor: theme.isDarkMode ? 'rgba(255, 193, 7, 0.1)' : '#fff3cd',
    borderColor: theme.isDarkMode ? 'rgba(255, 193, 7, 0.3)' : '#ffeaa7',
  },
  diagnosisContainer: {
    backgroundColor: theme.cardBg,
  },
  infoSection: {
    backgroundColor: theme.isDarkMode ? 'rgba(76, 175, 80, 0.1)' : '#F8F9FA',
    borderLeftColor: theme.primary,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  imageSection: {
    marginBottom: 20,
  },
  captureButton: {
    height: 220,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  captureButtonContent: {
    alignItems: 'center',
  },
  captureText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
  },
  captureSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  tipsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  tipsText: {
    fontSize: 12,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  capturedImage: {
    width: '100%',
    height: 280,
    borderRadius: 20,
  },
  imageActions: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    gap: 10,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  shareButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 20,
  },
  loadingContainer: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  loadingSubtext: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 15,
  },
  progressIndicator: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '70%',
    borderRadius: 2,
  },
  resultsSection: {
    marginBottom: 20,
  },
  errorContainer: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
  errorDetail: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  warningContainer: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  warningDetail: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  diagnosisContainer: {
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  diagnosisTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  confidenceBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  diseaseCard: {
    marginBottom: 25,
  },
  diseaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  diseaseName: {
    fontSize: 26,
    fontWeight: 'bold',
    flex: 1,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  diseaseDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 25,
  },
  infoGrid: {
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  detailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shareResultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  shareResultButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  newAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  newAnalysisButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    position: 'relative',
  },
  modalImage: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 20,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 20,
  },
});