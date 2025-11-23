import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Dimensions, 
  Text, 
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

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
        fontSize: 32,
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

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Safe color definitions with fallbacks
  const backgroundColor = colorScheme === 'dark' ? '#000000' : '#FFFFFF';
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const cardBackgroundColor = colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  const handleNavigation = (route) => {
    try {
      router.push(route);
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <View style={[styles.heroIcon, { 
              backgroundColor: cardBackgroundColor,
              shadowColor: colorScheme === 'dark' ? '#000' : '#000',
              borderColor: borderColor,
            }]}>
              <Text style={styles.heroEmoji}>🍅</Text>
            </View>
            <View style={[styles.heroIconAccent, styles.accent1]} />
            <View style={[styles.heroIconAccent, styles.accent2]} />
            <View style={[styles.heroIconAccent, styles.accent3]} />
          </View>
          
          <View style={styles.heroTextContainer}>
            <Text style={[styles.heroTitle, { color: textColor }]}>
              TomatoDoc AI
            </Text>
            <Text style={[styles.heroSubtitle, { color: '#4CAF50' }]}>
              AI-Powered Plant Health Assistant
            </Text>
            <Text style={[styles.heroDescription, { color: textColor }]}>
              Instantly diagnose tomato plant diseases using advanced machine learning. 
              Get expert recommendations and keep your plants healthy.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, {
              shadowColor: colorScheme === 'dark' ? '#000' : '#000',
              shadowOpacity: Platform.OS === 'android' ? 0 : (colorScheme === 'dark' ? 0.25 : 0.15),
              elevation: Platform.OS === 'android' ? 4 : 0,
            }]}
            onPress={() => handleNavigation('/prediction')}
            activeOpacity={0.8}
          >
            <View style={styles.buttonIconContainer}>
              <Ionicons name="camera" size={24} color="white" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.primaryButtonText}>Start Diagnosis</Text>
              <Text style={styles.buttonSubtext}>Scan your plant now</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="white" style={{ opacity: 0.8 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, {
              backgroundColor: cardBackgroundColor,
              borderColor: colorScheme === 'dark' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)',
              shadowColor: colorScheme === 'dark' ? '#000' : '#000',
              shadowOpacity: Platform.OS === 'android' ? 0 : (colorScheme === 'dark' ? 0.25 : 0.15),
              elevation: Platform.OS === 'android' ? 4 : 0,
            }]}
            onPress={() => handleNavigation('/disease-guide')}
            activeOpacity={0.8}
          >
            <View style={[styles.buttonIconContainer, styles.secondaryIconContainer]}>
              <Ionicons name="library" size={24} color="#2196F3" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.secondaryButtonText, { color: textColor }]}>
                Disease Guide
              </Text>
              <Text style={[styles.buttonSubtext, { color: textColor, opacity: 0.6 }]}>
                Learn about diseases
              </Text>
            </View>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={textColor} 
              style={{ opacity: 0.6 }} 
            />
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={[styles.featuresContainer, {
          borderTopColor: borderColor,
        }]}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, {
              backgroundColor: cardBackgroundColor,
              borderColor: borderColor,
              shadowOpacity: Platform.OS === 'android' ? 0 : (colorScheme === 'dark' ? 0.2 : 0.1),
              elevation: Platform.OS === 'android' ? 2 : 0,
            }]}>
              <Ionicons name="flash" size={20} color="#FF6B35" />
            </View>
            <Text style={[styles.featureText, { color: textColor }]}>Instant Results</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, {
              backgroundColor: cardBackgroundColor,
              borderColor: borderColor,
              shadowOpacity: Platform.OS === 'android' ? 0 : (colorScheme === 'dark' ? 0.2 : 0.1),
              elevation: Platform.OS === 'android' ? 2 : 0,
            }]}>
              <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            </View>
            <Text style={[styles.featureText, { color: textColor }]}>AI Accuracy</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, {
              backgroundColor: cardBackgroundColor,
              borderColor: borderColor,
              shadowOpacity: Platform.OS === 'android' ? 0 : (colorScheme === 'dark' ? 0.2 : 0.1),
              elevation: Platform.OS === 'android' ? 2 : 0,
            }]}>
              <Ionicons name="library" size={20} color="#2196F3" />
            </View>
            <Text style={[styles.featureText, { color: textColor }]}>Expert Guide</Text>
          </View>
        </View>

        {/* Quick Stats Section - Additional content for better UX */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsTitle, { color: textColor }]}>Why Choose TomatoDoc AI?</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>95%</Text>
              <Text style={[styles.statLabel, { color: textColor }]}>Accuracy Rate</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
              <Text style={[styles.statNumber, { color: '#2196F3' }]}>10+</Text>
              <Text style={[styles.statLabel, { color: textColor }]}>Disease Types</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
              <Text style={[styles.statNumber, { color: '#FF6B35' }]}>24/7</Text>
              <Text style={[styles.statLabel, { color: textColor }]}>Available</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    flex: Platform.OS === 'android' ? 0 : 1,
    minHeight: Platform.OS === 'android' ? height * 0.5 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'android' ? 24 : 32,
    paddingVertical: Platform.OS === 'android' ? 40 : 20,
  },
  heroIconContainer: {
    position: 'relative',
    marginBottom: Platform.OS === 'android' ? 32 : 40,
  },
  heroIcon: {
    width: Platform.OS === 'android' ? 100 : 120,
    height: Platform.OS === 'android' ? 100 : 120,
    borderRadius: Platform.OS === 'android' ? 50 : 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'android' ? 4 : 8,
    },
    shadowRadius: Platform.OS === 'android' ? 10 : 20,
    elevation: Platform.OS === 'android' ? 8 : 0,
    borderWidth: 1,
  },
  heroEmoji: {
    fontSize: Platform.OS === 'android' ? 48 : 56,
  },
  heroIconAccent: {
    position: 'absolute',
    borderRadius: Platform.OS === 'android' ? 10 : 12,
    opacity: 0.8,
  },
  accent1: {
    width: Platform.OS === 'android' ? 20 : 24,
    height: Platform.OS === 'android' ? 20 : 24,
    backgroundColor: '#4CAF50',
    top: Platform.OS === 'android' ? -6 : -8,
    right: Platform.OS === 'android' ? -6 : -8,
  },
  accent2: {
    width: Platform.OS === 'android' ? 14 : 16,
    height: Platform.OS === 'android' ? 14 : 16,
    backgroundColor: '#FF6B35',
    bottom: 0,
    left: Platform.OS === 'android' ? -10 : -12,
  },
  accent3: {
    width: Platform.OS === 'android' ? 18 : 20,
    height: Platform.OS === 'android' ? 18 : 20,
    backgroundColor: '#2196F3',
    top: Platform.OS === 'android' ? 16 : 20,
    right: Platform.OS === 'android' ? -14 : -16,
  },
  heroTextContainer: {
    alignItems: 'center',
    maxWidth: width - (Platform.OS === 'android' ? 48 : 64),
  },
  heroTitle: {
    fontSize: Platform.OS === 'android' ? 32 : 36,
    fontWeight: Platform.OS === 'android' ? '700' : '800',
    textAlign: 'center',
    marginBottom: Platform.OS === 'android' ? 6 : 8,
    letterSpacing: Platform.OS === 'android' ? -0.5 : -1,
  },
  heroSubtitle: {
    fontSize: Platform.OS === 'android' ? 16 : 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Platform.OS === 'android' ? 12 : 16,
    opacity: 0.9,
  },
  heroDescription: {
    fontSize: Platform.OS === 'android' ? 15 : 16,
    textAlign: 'center',
    lineHeight: Platform.OS === 'android' ? 22 : 24,
    opacity: 0.7,
    fontWeight: '400',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 24 : 32,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: Platform.OS === 'android' ? 16 : 18,
    paddingHorizontal: 24,
    borderRadius: Platform.OS === 'android' ? 14 : 16,
    marginBottom: Platform.OS === 'android' ? 14 : 16,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'android' ? 2 : 4,
    },
    shadowRadius: Platform.OS === 'android' ? 6 : 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'android' ? 16 : 18,
    paddingHorizontal: 24,
    borderRadius: Platform.OS === 'android' ? 14 : 16,
    borderWidth: Platform.OS === 'android' ? 1.5 : 2,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'android' ? 2 : 4,
    },
    shadowRadius: Platform.OS === 'android' ? 6 : 12,
  },
  buttonIconContainer: {
    width: Platform.OS === 'android' ? 44 : 48,
    height: Platform.OS === 'android' ? 44 : 48,
    borderRadius: Platform.OS === 'android' ? 22 : 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Platform.OS === 'android' ? 14 : 16,
  },
  secondaryIconContainer: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  buttonTextContainer: {
    flex: 1,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'android' ? 17 : 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  secondaryButtonText: {
    fontSize: Platform.OS === 'android' ? 17 : 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: Platform.OS === 'android' ? 13 : 14,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: Platform.OS === 'android' ? 24 : 32,
    borderTopWidth: 1,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: Platform.OS === 'android' ? 36 : 40,
    height: Platform.OS === 'android' ? 36 : 40,
    borderRadius: Platform.OS === 'android' ? 18 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? 6 : 8,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'android' ? 1 : 2,
    },
    shadowRadius: Platform.OS === 'android' ? 2 : 4,
    borderWidth: 1,
  },
  featureText: {
    fontSize: Platform.OS === 'android' ? 13 : 14,
    fontWeight: '600',
    opacity: 0.8,
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: Platform.OS === 'android' ? 20 : 24,
  },
  statsTitle: {
    fontSize: Platform.OS === 'android' ? 20 : 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Platform.OS === 'android' ? 16 : 20,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Platform.OS === 'android' ? 12 : 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Platform.OS === 'android' ? 16 : 20,
    paddingHorizontal: Platform.OS === 'android' ? 8 : 12,
    borderRadius: Platform.OS === 'android' ? 12 : 14,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'android' ? 1 : 2,
    },
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
    shadowRadius: Platform.OS === 'android' ? 0 : 4,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  statNumber: {
    fontSize: Platform.OS === 'android' ? 24 : 28,
    fontWeight: '800',
    marginBottom: Platform.OS === 'android' ? 4 : 6,
  },
  statLabel: {
    fontSize: Platform.OS === 'android' ? 12 : 13,
    fontWeight: '600',
    opacity: 0.7,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: Platform.OS === 'android' ? 20 : 24,
  },
});