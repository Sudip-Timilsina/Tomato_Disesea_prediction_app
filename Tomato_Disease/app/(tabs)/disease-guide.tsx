import React from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text,
  Animated, 
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock disease data - replace with your actual diseaseInfo import
const mockDiseaseInfo = {
  'early-blight': {
    name: 'Early Blight',
    icon: '🍃',
    severity: 'Medium',
    severity_color: '#ffa502'
  },
  'late-blight': {
    name: 'Late Blight',
    icon: '🦠',
    severity: 'High',
    severity_color: '#ff4757'
  },
  'leaf-mold': {
    name: 'Leaf Mold',
    icon: '🍂',
    severity: 'Low',
    severity_color: '#2ed573'
  },
  'septoria': {
    name: 'Septoria Leaf Spot',
    icon: '⚫',
    severity: 'Medium',
    severity_color: '#ffa502'
  },
  'spider-mites': {
    name: 'Spider Mites',
    icon: '🕷️',
    severity: 'Medium',
    severity_color: '#ffa502'
  },
  'target-spot': {
    name: 'Target Spot',
    icon: '🎯',
    severity: 'Medium',
    severity_color: '#ffa502'
  },
  'mosaic-virus': {
    name: 'Mosaic Virus',
    icon: '🦠',
    severity: 'High',
    severity_color: '#ff4757'
  },
  'bacterial-spot': {
    name: 'Bacterial Spot',
    icon: '🔴',
    severity: 'High',
    severity_color: '#ff4757'
  },
  'healthy': {
    name: 'Healthy Plant',
    icon: '✅',
    severity: 'Good',
    severity_color: '#2ed573'
  },
  'yellow-leaf-curl': {
    name: 'Yellow Leaf Curl Virus',
    icon: '💛',
    severity: 'High',
    severity_color: '#ff4757'
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

// Safe ThemedText replacement
const SafeText = ({ children, style, type, ...props }) => {
  const colorScheme = useColorScheme();
  
  const getTextStyle = () => {
    const baseStyle = {
      color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    };
    
    if (type === 'title') {
      return {
        ...baseStyle,
        fontSize: 28,
        fontWeight: '700',
      };
    }
    
    return baseStyle;
  };

  return (
    <Text style={[getTextStyle(), style]} {...props}>
      {children}
    </Text>
  );
};

// Safe ThemedView replacement
const SafeView = ({ children, style, ...props }) => {
  const colorScheme = useColorScheme();
  
  const viewStyle = {
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
  };

  return (
    <View style={[viewStyle, style]} {...props}>
      {children}
    </View>
  );
};

const DiseaseCard = ({ diseaseKey, disease, index }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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

  const cardBackgroundColor = colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const borderColor = colorScheme === 'dark' ? '#333333' : '#E5E5E5';

  return (
    <Animated.View 
      style={[
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.diseaseCard,
          {
            backgroundColor: cardBackgroundColor,
            borderColor: borderColor,
            shadowColor: colorScheme === 'dark' ? '#000' : '#000',
          },
        ]}
        onPress={() => {
          try {
            router.push(`/disease/${diseaseKey}`);
          } catch (error) {
            console.log('Navigation error:', error);
          }
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={styles.diseaseHeader}>
          <View
            style={[
              styles.diseaseIconContainer,
              { 
                backgroundColor: `${disease.severity_color}20`,
                borderColor: `${disease.severity_color}40`,
              },
            ]}
          >
            <Text style={[styles.diseaseIcon, { color: disease.severity_color }]}>
              {disease.icon}
            </Text>
          </View>
          
          <View style={styles.diseaseHeaderText}>
            <View style={styles.diseaseInfo}>
              <Text style={[styles.diseaseName, { color: textColor }]}>
                {disease.name}
              </Text>
              
              <View style={[styles.severityBadge, { backgroundColor: disease.severity_color }]}>
                <Text style={styles.severityText}>{disease.severity}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.chevronContainer}>
            <View style={[
              styles.chevronBackground,
              { backgroundColor: `${textColor}10` }
            ]}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={textColor}
                style={{ opacity: 0.8 }}
              />
            </View>
          </View>
        </View>
        
        {/* Decorative corner accent */}
        <View style={[styles.cornerAccent, { backgroundColor: `${disease.severity_color}15` }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function DiseaseGuideScreen() {
  const diseases = Object.entries(diseaseInfo);
  const colorScheme = useColorScheme();
  const headerOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#F8F9FA';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const tintColor = '#007AFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      
      <Animated.View style={[styles.headerSection, { opacity: headerOpacity }]}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            🌿 Disease Guide
          </Text>
          <View style={[styles.titleUnderline, { backgroundColor: tintColor }]} />
        </View>
        
        <Text style={[styles.subtitle, { color: textColor }]}>
          Learn about common tomato plant diseases and how to manage them effectively
        </Text>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { borderColor: `${tintColor}30`, backgroundColor: `${tintColor}10` }]}>
            <Text style={[styles.statNumber, { color: tintColor }]}>
              {diseases.length}
            </Text>
            <Text style={[styles.statLabel, { color: textColor }]}>Diseases</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.diseasesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {diseases.map(([diseaseKey, disease], index) => (
          <DiseaseCard 
            key={diseaseKey} 
            diseaseKey={diseaseKey} 
            disease={disease} 
            index={index}
          />
        ))}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.12)',
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
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
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
  diseasesContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  diseaseCard: {
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
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  diseaseIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  diseaseIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  diseaseHeaderText: {
    flex: 1,
    marginLeft: 16,
  },
  diseaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    flex: 1,
    lineHeight: 24,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
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
  chevronContainer: {
    marginLeft: 12,
  },
  chevronBackground: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 35,
    height: 35,
    borderBottomLeftRadius: 18,
  },
  bottomSpacer: {
    height: 16,
  },
});