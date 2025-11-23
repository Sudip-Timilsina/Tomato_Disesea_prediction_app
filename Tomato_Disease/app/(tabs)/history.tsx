import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  RefreshControl,
  Animated,
  Image,
  Modal,
  Share,
  Platform,
  StatusBar,
  SafeAreaView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock disease data - replace with your actual diseaseInfo import
const mockDiseaseInfo = {
  'early-blight': {
    name: 'Early Blight',
    icon: '🍃',
    severity: 'Medium',
    severity_color: '#ffa502',
    description: 'A common fungal disease affecting tomato leaves'
  },
  'late-blight': {
    name: 'Late Blight',
    icon: '🦠',
    severity: 'High',
    severity_color: '#ff4757',
    description: 'Severe fungal disease that can destroy crops quickly'
  },
  'leaf-mold': {
    name: 'Leaf Mold',
    icon: '🍂',
    severity: 'Low',
    severity_color: '#2ed573',
    description: 'Mild fungal infection on leaf surfaces'
  },
  'septoria': {
    name: 'Septoria Leaf Spot',
    icon: '⚫',
    severity: 'Medium',
    severity_color: '#ffa502',
    description: 'Fungal disease causing small dark spots on leaves'
  },
  'spider-mites': {
    name: 'Spider Mites',
    icon: '🕷️',
    severity: 'Medium',
    severity_color: '#ffa502',
    description: 'Tiny pests that cause stippling on leaves'
  },
  'target-spot': {
    name: 'Target Spot',
    icon: '🎯',
    severity: 'Medium',
    severity_color: '#ffa502',
    description: 'Fungal disease with characteristic ring patterns'
  },
  'mosaic-virus': {
    name: 'Mosaic Virus',
    icon: '🦠',
    severity: 'High',
    severity_color: '#ff4757',
    description: 'Viral infection causing mottled leaf patterns'
  },
  'bacterial-spot': {
    name: 'Bacterial Spot',
    icon: '🔴',
    severity: 'High',
    severity_color: '#ff4757',
    description: 'Bacterial infection causing dark spots'
  },
  'healthy': {
    name: 'Healthy Plant',
    icon: '✅',
    severity: 'Good',
    severity_color: '#2ed573',
    description: 'Plant shows no signs of disease'
  },
  'yellow-leaf-curl': {
    name: 'Yellow Leaf Curl Virus',
    icon: '💛',
    severity: 'High',
    severity_color: '#ff4757',
    description: 'Viral disease causing leaf curling and yellowing'
  }
};

// Try to import your actual disease data, fallback to mock if not available
let diseaseInfo;
try {
  diseaseInfo = require('@/data/diseaseInfo').diseaseInfo;
} catch (error) {
  console.warn('Using mock disease data');
  diseaseInfo = mockDiseaseInfo;
}

const { width, height } = Dimensions.get('window');

// Safe text component that works across devices
const SafeText = ({ children, style, type, numberOfLines, ...props }) => {
  const colorScheme = useColorScheme();
  
  const getTextStyle = () => {
    const baseStyle = {
      color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    };
    
    switch (type) {
      case 'title':
        return { ...baseStyle, fontSize: 28, fontWeight: '700' };
      case 'subtitle':
        return { ...baseStyle, fontSize: 16, opacity: 0.7 };
      case 'header':
        return { ...baseStyle, fontSize: 18, fontWeight: '600' };
      default:
        return baseStyle;
    }
  };

  return (
    <Text 
      style={[getTextStyle(), style]} 
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

// Safe view component
const SafeView = ({ children, style, ...props }) => {
  const colorScheme = useColorScheme();
  
  const viewStyle = {
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#F8F9FA',
  };

  return (
    <View style={[viewStyle, style]} {...props}>
      {children}
    </View>
  );
};

// Animated prediction card component
const PredictionCard = ({ prediction, index, onPress, onShare, onDelete, onImagePress }) => {
  const colorScheme = useColorScheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 200,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 8,
    }).start();
  };

  if (!prediction || !prediction.class || !prediction.id) {
    return null;
  }

  const disease = diseaseInfo[prediction.class] || {
    name: 'Unknown',
    severity: 'Unknown',
    severity_color: colorScheme === 'dark' ? '#666666' : '#999999',
    icon: '🍅',
    description: 'Unknown disease type'
  };

  const confidence = (parseFloat(prediction.confidence || 0) * 100).toFixed(1);
  const date = new Date(prediction.timestamp || Date.now());
  const isRecent = Date.now() - date.getTime() < 24 * 60 * 60 * 1000;

  const cardBackgroundColor = colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const borderColor = colorScheme === 'dark' ? '#333333' : '#E5E5E5';

  return (
    <Animated.View 
      style={[
        { 
          opacity: opacityAnim, 
          transform: [{ scale: scaleAnim }] 
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.predictionCard,
          {
            backgroundColor: cardBackgroundColor,
            borderColor: borderColor,
            shadowColor: colorScheme === 'dark' ? '#000' : '#000',
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.predictionHeader}>
          <View style={styles.diseaseIconContainer}>
            {prediction.imageUri ? (
              <TouchableOpacity
                onPress={() => onImagePress(prediction)}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: prediction.imageUri }} 
                  style={styles.thumbnailImage}
                  onError={(error) => console.warn('Image load error:', error)}
                />
              </TouchableOpacity>
            ) : (
              <View style={[
                styles.iconBackground,
                { 
                  backgroundColor: `${disease.severity_color}20`,
                  borderColor: `${disease.severity_color}40`,
                }
              ]}>
                <Text style={[styles.diseaseIcon, { color: disease.severity_color }]}>
                  {disease.icon}
                </Text>
              </View>
            )}
            {isRecent && <View style={styles.recentBadge} />}
          </View>

          <View style={styles.predictionInfo}>
            <SafeText style={styles.predictionName} numberOfLines={2}>
              {disease.name}
            </SafeText>
            <View style={styles.predictionMeta}>
              <View style={[styles.severityBadge, { backgroundColor: disease.severity_color }]}>
                <Text style={styles.severityText}>{disease.severity}</Text>
              </View>
              <SafeText style={styles.confidenceText}>{confidence}%</SafeText>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${textColor}10` }]}
              onPress={() => onShare(prediction)}
              activeOpacity={0.8}
            >
              <Ionicons name="share" size={18} color={textColor} style={{ opacity: 0.8 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ff475710' }]}
              onPress={() => onDelete(prediction)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={18} color="#ff4757" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details */}
        <View style={styles.predictionDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time" size={14} color={textColor} style={{ opacity: 0.6 }} />
            <SafeText style={styles.predictionDetail} numberOfLines={1}>
              {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </SafeText>
          </View>

          {disease.description && (
            <SafeText style={styles.diseaseDescription} numberOfLines={2}>
              {disease.description}
            </SafeText>
          )}
        </View>

        {/* Decorative corner accent */}
        <View style={[styles.cornerAccent, { backgroundColor: `${disease.severity_color}15` }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HistoryScreen() {
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [hasError, setHasError] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Define tab bar height for padding
  const tabBarHeight = Platform.OS === 'ios' ? 90 : 65;

  // Animation setup
  useEffect(() => {
    try {
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.warn('Animation error:', error);
      headerOpacity.setValue(1);
    }
  }, []);

  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (showImageModal || showDeleteModal) {
          setShowImageModal(false);
          setShowDeleteModal(false);
          return true;
        }
        return false;
      };

      if (Platform.OS === 'android') {
        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
      }
    }, [showImageModal, showDeleteModal])
  );

  // Focus effect to reload data
  useFocusEffect(
    useCallback(() => {
      loadPredictions();
    }, [])
  );

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setHasError(false);
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Storage timeout')), 10000)
      );

      const storagePromise = AsyncStorage.getItem('predictions');
      const existing = await Promise.race([storagePromise, timeoutPromise]);

      if (existing) {
        const parsedPredictions = JSON.parse(existing);
        if (Array.isArray(parsedPredictions)) {
          setPredictions(parsedPredictions);
          applyFiltersAndSort(parsedPredictions, searchQuery, selectedFilter, sortOrder);
        } else {
          throw new Error('Invalid data format');
        }
      } else {
        setPredictions([]);
        setFilteredPredictions([]);
      }
    } catch (err) {
      console.error('Error loading predictions:', err);
      setHasError(true);
      setPredictions([]);
      setFilteredPredictions([]);
      
      if (Platform.OS === 'android') {
        Alert.alert(
          'Loading Error',
          'Unable to load prediction history. The app will continue with empty history.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = useCallback((data, search, filter, sort) => {
    try {
      if (!Array.isArray(data)) {
        setFilteredPredictions([]);
        return;
      }

      let filtered = [...data];

      // Apply search filter
      if (search && search.trim()) {
        filtered = filtered.filter((prediction) => {
          if (!prediction || !prediction.class) return false;
          
          const disease = diseaseInfo[prediction.class] || {};
          const diseaseName = (disease.name || '').toLowerCase();
          const className = (prediction.class || '').toLowerCase();
          const searchLower = search.toLowerCase();
          const severity = (disease.severity || '').toLowerCase();
          
          return (
            diseaseName.includes(searchLower) ||
            className.includes(searchLower) ||
            severity.includes(searchLower)
          );
        });
      }

      // Apply disease type filter
      if (filter !== 'all') {
        filtered = filtered.filter((prediction) => {
          if (!prediction || !prediction.class) return false;
          
          const disease = diseaseInfo[prediction.class] || {};
          const severity = (disease.severity || '').toLowerCase();
          const className = (prediction.class || '').toLowerCase();
          
          if (filter === 'healthy') {
            return severity === 'good' || severity === 'healthy' || className.includes('healthy');
          } else if (filter === 'diseased') {
            return severity !== 'good' && severity !== 'healthy' && !className.includes('healthy');
          }
          return true;
        });
      }

      // Apply sorting
      filtered.sort((a, b) => {
        try {
          switch (sort) {
            case 'oldest':
              return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
            case 'confidence':
              return parseFloat(b.confidence || 0) - parseFloat(a.confidence || 0);
            case 'newest':
            default:
              return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
          }
        } catch (error) {
          console.warn('Sort error:', error);
          return 0;
        }
      });

      setFilteredPredictions(filtered);
    } catch (error) {
      console.error('Filter/sort error:', error);
      setFilteredPredictions([]);
    }
  }, []);

  // Update filters when dependencies change
  useEffect(() => {
    if (predictions.length > 0) {
      applyFiltersAndSort(predictions, searchQuery, selectedFilter, sortOrder);
    }
  }, [predictions, searchQuery, selectedFilter, sortOrder, applyFiltersAndSort]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPredictions().finally(() => setRefreshing(false));
  }, []);

  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all prediction history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('predictions');
              setPredictions([]);
              setFilteredPredictions([]);
            } catch (err) {
              console.error('Error clearing history:', err);
              Alert.alert('Error', 'Failed to clear prediction history. Please try again.');
            }
          },
        },
      ]
    );
  };

  const deleteSinglePrediction = async (predictionId) => {
    try {
      if (!predictionId) {
        throw new Error('Invalid prediction ID');
      }
      
      const updatedPredictions = predictions.filter((p) => p && p.id !== predictionId);
      await AsyncStorage.setItem('predictions', JSON.stringify(updatedPredictions));
      setPredictions(updatedPredictions);
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting prediction:', err);
      Alert.alert('Error', 'Failed to delete prediction. Please try again.');
    }
  };

  const sharePrediction = async (prediction) => {
    try {
      if (!prediction || !prediction.class) {
        throw new Error('Invalid prediction data');
      }

      const disease = diseaseInfo[prediction.class] || { 
        name: 'Unknown', 
        severity: 'Unknown' 
      };
      const confidence = (parseFloat(prediction.confidence || 0) * 100).toFixed(1);
      const date = new Date(prediction.timestamp || Date.now()).toLocaleDateString();

      const message =
        `🍅 Tomato Leaf Analysis Result\n\n` +
        `Diagnosis: ${disease.name}\n` +
        `Confidence: ${confidence}%\n` +
        `Severity: ${disease.severity}\n` +
        `Date: ${date}\n\n` +
        `Analyzed with TomatoApp AI`;

      await Share.share({
        message,
        title: 'Tomato Leaf Analysis Result',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share prediction.');
    }
  };

  const exportHistory = async () => {
    try {
      if (!predictions || predictions.length === 0) {
        Alert.alert('No Data', 'No prediction history to export.');
        return;
      }

      const exportData = predictions
        .filter(prediction => prediction && prediction.class)
        .map((prediction) => {
          const disease = diseaseInfo[prediction.class] || {};
          const timestamp = prediction.timestamp || Date.now();
          return {
            diagnosis: disease.name || 'Unknown',
            confidence: `${(parseFloat(prediction.confidence || 0) * 100).toFixed(1)}%`,
            severity: disease.severity || 'Unknown',
            date: new Date(timestamp).toLocaleDateString(),
            time: new Date(timestamp).toLocaleTimeString(),
          };
        });

      if (exportData.length === 0) {
        Alert.alert('No Data', 'No valid predictions to export.');
        return;
      }

      const csvContent = [
        'Diagnosis,Confidence,Severity,Date,Time',
        ...exportData.map(
          (row) => `"${row.diagnosis}","${row.confidence}","${row.severity}","${row.date}","${row.time}"`
        ),
      ].join('\n');

      await Share.share({
        message: csvContent,
        title: 'Tomato Analysis History Export',
      });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export history.');
    }
  };

  const getFilterStats = useCallback(() => {
    try {
      if (!Array.isArray(predictions)) {
        return { healthy: 0, diseased: 0, total: 0 };
      }

      const validPredictions = predictions.filter(p => p && p.class);
      const healthy = validPredictions.filter((p) => {
        const disease = diseaseInfo[p.class] || {};
        const severity = (disease.severity || '').toLowerCase();
        const className = (p.class || '').toLowerCase();
        return severity === 'good' || severity === 'healthy' || className.includes('healthy');
      }).length;

      const diseased = validPredictions.length - healthy;

      return { healthy, diseased, total: validPredictions.length };
    } catch (error) {
      console.error('Stats calculation error:', error);
      return { healthy: 0, diseased: 0, total: 0 };
    }
  }, [predictions]);

  const handleCardPress = (prediction) => {
    try {
      router.push(`/disease/${prediction.class}`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleImagePress = (prediction) => {
    setSelectedPrediction(prediction);
    setShowImageModal(true);
  };

  const handleDeletePress = (prediction) => {
    setItemToDelete(prediction);
    setShowDeleteModal(true);
  };

  const stats = getFilterStats();
  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#F8F9FA';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const tintColor = '#007AFF';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
        <SafeView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={tintColor}
            />
            <SafeText style={styles.loadingText}>Loading history...</SafeText>
          </View>
        </SafeView>
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
        <SafeView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={80} color="#ff4757" />
            <SafeText style={styles.errorTitle}>Something went wrong</SafeText>
            <SafeText style={styles.errorSubtitle}>
              Unable to load your prediction history
            </SafeText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: tintColor }]}
              onPress={loadPredictions}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color="#ffffff" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      
      <SafeView style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.headerSection, { opacity: headerOpacity }]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: textColor }]}>
              📊 Analysis History
            </Text>
            <View style={[styles.titleUnderline, { backgroundColor: tintColor }]} />
          </View>
          
          <Text style={[styles.subtitle, { color: textColor }]}>
            Review your tomato disease analysis results and track patterns over time
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statItem, { borderColor: `${tintColor}30`, backgroundColor: `${tintColor}10` }]}>
              <Text style={[styles.statNumber, { color: tintColor }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { color: textColor }]}>Total</Text>
            </View>
            <View style={[styles.statItem, { borderColor: `#2ed57330`, backgroundColor: `#2ed57310`, marginLeft: 12 }]}>
              <Text style={[styles.statNumber, { color: '#2ed573' }]}>
                {stats.healthy}
              </Text>
              <Text style={[styles.statLabel, { color: textColor }]}>Healthy</Text>
            </View>
            <View style={[styles.statItem, { borderColor: `#ff475730`, backgroundColor: `#ff475710`, marginLeft: 12 }]}>
              <Text style={[styles.statNumber, { color: '#ff4757' }]}>
                {stats.diseased}
              </Text>
              <Text style={[styles.statLabel, { color: textColor }]}>Diseased</Text>
            </View>
          </View>
        </Animated.View>

        {predictions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf" size={80} color={`${textColor}40`} />
            <SafeText style={styles.emptyTitle}>No Predictions Yet</SafeText>
            <SafeText style={styles.emptySubtitle}>
              Start analyzing tomato leaves to build your history
            </SafeText>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: tintColor }]}
              onPress={() => {
                try {
                  router.push('/prediction');
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={20} color="#ffffff" />
              <Text style={styles.startButtonText}>Start Analysis</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Search and Filter Controls */}
            <View style={styles.controlsContainer}>
              <View style={[
                styles.searchContainer,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
                  borderColor: colorScheme === 'dark' ? '#333333' : '#E5E5E5'
                }
              ]}>
                <Ionicons name="search" size={20} color={`${textColor}60`} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder="Search diagnoses..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={`${textColor}60`}
                  maxLength={100}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.8}>
                    <Ionicons name="close-circle" size={20} color={`${textColor}60`} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContentContainer}
              >
                {[
                  { key: 'all', label: `All (${stats.total})` },
                  { key: 'healthy', label: `Healthy (${stats.healthy})` },
                  { key: 'diseased', label: `Diseased (${stats.diseased})` }
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterButton,
                      {
                        backgroundColor: selectedFilter === filter.key 
                          ? tintColor 
                          : colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
                        borderColor: selectedFilter === filter.key 
                          ? tintColor 
                          : colorScheme === 'dark' ? '#333333' : '#E5E5E5'
                      }
                    ]}
                    onPress={() => setSelectedFilter(filter.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.filterText,
                      {
                        color: selectedFilter === filter.key 
                          ? '#FFFFFF' 
                          : textColor
                      }
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.sortButton,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
                    borderColor: colorScheme === 'dark' ? '#333333' : '#E5E5E5'
                  }
                ]}
                onPress={() => {
                  const nextSort =
                    sortOrder === 'newest'
                      ? 'oldest'
                      : sortOrder === 'oldest'
                      ? 'confidence'
                      : 'newest';
                  setSortOrder(nextSort);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-vertical" size={16} color={textColor} />
                <Text style={[styles.sortText, { color: textColor }]}>
                  {sortOrder === 'newest' ? 'Newest' : sortOrder === 'oldest' ? 'Oldest' : 'Confidence'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Predictions List */}
            <ScrollView
              style={styles.predictionsContainer}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh}
                  colors={[tintColor]}
                  tintColor={tintColor}
                />
              }
              showsVerticalScrollIndicator={false}
              bounces={true}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
            >
              {filteredPredictions.length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search" size={60} color={`${textColor}40`} />
                  <SafeText style={styles.noResultsText}>No matching results</SafeText>
                  <SafeText style={styles.noResultsSubtext}>
                    Try adjusting your search or filters
                  </SafeText>
                </View>
              ) : (
                filteredPredictions
                  .filter(prediction => prediction && prediction.id)
                  .map((prediction, index) => (
                    <PredictionCard
                      key={prediction.id}
                      prediction={prediction}
                      index={index}
                      onPress={() => handleCardPress(prediction)}
                      onShare={sharePrediction}
                      onDelete={handleDeletePress}
                      onImagePress={handleImagePress}
                    />
                  ))
              )}

              <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Action Buttons */}
            <View style={[styles.actionButtonsContainer, { paddingBottom: tabBarHeight + 10 }]}>
              <TouchableOpacity
                style={[
                  styles.exportButton, 
                  { 
                    borderColor: tintColor,
                    backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF'
                  }
                ]}
                onPress={exportHistory}
                activeOpacity={0.8}
              >
                <Ionicons name="download" size={20} color={tintColor} />
                <Text style={[styles.exportButtonText, { color: tintColor }]}>
                  Export
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearHistory}
                activeOpacity={0.8}
              >
                <Ionicons name="trash" size={20} color="#ffffff" />
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

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
                {selectedPrediction?.imageUri && (
                  <Image
                    source={{ uri: selectedPrediction.imageUri }}
                    style={styles.modalImage}
                    resizeMode="contain"
                    onError={(error) => {
                      console.warn('Modal image load error:', error);
                      setShowImageModal(false);
                    }}
                  />
                )}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowImageModal(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          visible={showDeleteModal} 
          transparent 
          animationType="fade"
          onRequestClose={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.deleteModalContent,
                { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF' },
              ]}
            >
              <Ionicons name="warning" size={48} color="#ff4757" />
              <SafeText style={styles.deleteModalTitle}>Delete Prediction?</SafeText>
              <SafeText style={styles.deleteModalText}>
                This action cannot be undone. The prediction will be permanently removed from your history.
              </SafeText>
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { backgroundColor: colorScheme === 'dark' ? '#333333' : '#F5F5F5' },
                  ]}
                  onPress={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cancelButtonText, { color: textColor }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => deleteSinglePrediction(itemToDelete?.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    opacity: 0.7,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 25,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  titleUnderline: {
    width: 50,
    height: 3,
    borderRadius: 2,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.75,
    lineHeight: 22,
    fontWeight: '400',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 60,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.7,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    opacity: 0.7,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    minHeight: 48,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 20,
  },
  filtersContainer: {
    marginBottom: 15,
    flexGrow: 0,
  },
  filtersContentContainer: {
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    minHeight: 32,
    alignSelf: 'flex-end',
    borderWidth: 1,
  },
  sortText: {
    fontSize: 12,
    marginLeft: 5,
  },
  predictionsContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  predictionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 1,
  },
  diseaseIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  iconBackground: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  thumbnailImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  diseaseIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  recentBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ed573',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  predictionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  predictionName: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 6,
    lineHeight: 24,
  },
  predictionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ed573',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  predictionDetails: {
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(128,128,128,0.3)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  predictionDetail: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    opacity: 0.8,
  },
  diseaseDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 35,
    height: 35,
    borderBottomLeftRadius: 18,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(128,128,128,0.3)',
    gap: 10,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 48,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4757',
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 48,
  },
  clearButtonText: {
    color: '#ffffff',
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
    padding: 20,
  },
  modalContent: {
    position: 'relative',
    maxWidth: width * 0.9,
    maxHeight: height * 0.8,
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
    padding: 12,
    borderRadius: 25,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    maxWidth: 320,
    minWidth: 280,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  deleteModalText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    opacity: 0.8,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#ff4757',
    alignItems: 'center',
    minHeight: 48,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});