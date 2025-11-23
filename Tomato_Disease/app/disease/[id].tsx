import React from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  View,
  Dimensions, 
  Platform,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { diseaseInfo } from '@/data/diseaseInfo';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DiseaseDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  const disease = diseaseInfo && id ? diseaseInfo[id] : null;

  // Adaptive theme colors
  const theme = {
    background: isDark ? '#0f172a' : '#f8fafc',
    surface: isDark ? '#1e293b' : '#ffffff',
    surfaceVariant: isDark ? '#334155' : '#f1f5f9',
    primary: isDark ? '#3b82f6' : '#2563eb',
    primaryVariant: isDark ? '#1d4ed8' : '#1e40af',
    secondary: isDark ? '#8b5cf6' : '#7c3aed',
    accent: isDark ? '#06b6d4' : '#0891b2',
    text: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#cbd5e1' : '#64748b',
    textMuted: isDark ? '#94a3b8' : '#94a3b8',
    border: isDark ? '#334155' : '#e2e8f0',
    shadow: isDark ? '#000000' : '#64748b',
    overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)',
  };

  if (!disease) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={isDark
            ? ['#0f172a', '#1e293b', '#334155'] 
            : ['#3b82f6', '#6366f1', '#8b5cf6']
          }
          style={styles.errorGradient}
        >
          <View style={styles.errorContainer}>
            <View style={[styles.errorIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <ThemedText style={styles.errorIconText}>⚠️</ThemedText>
            </View>
            <ThemedText style={[styles.errorTitle, { color: '#ffffff' }]}>
              Content Not Available
            </ThemedText>
            <ThemedText style={[styles.errorMessage, { color: 'rgba(255,255,255,0.8)' }]}>
              The requested disease information could not be found. Please check your connection and try again.
            </ThemedText>
            <TouchableOpacity 
              style={[styles.backButton, { 
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderColor: 'rgba(255,255,255,0.3)' 
              }]}
              onPress={() => router.back()}
            >
              <ThemedText style={[styles.backButtonText, { color: '#ffffff' }]}>
                ← Go Back
              </ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ThemedView>
    );
  }

  const getSeverityConfig = (severity) => {
    const baseConfig = {
      high: { 
        color: isDark ? '#ef4444' : '#dc2626', 
        bg: isDark ? '#1f2937' : '#fef2f2', 
        label: 'Critical Risk',
        gradient: isDark ? ['#dc2626', '#b91c1c'] : ['#fee2e2', '#fecaca']
      },
      medium: { 
        color: isDark ? '#f59e0b' : '#d97706', 
        bg: isDark ? '#1f2937' : '#fffbeb', 
        label: 'Moderate Risk',
        gradient: isDark ? ['#d97706', '#b45309'] : ['#fef3c7', '#fed7aa']
      },
      low: { 
        color: isDark ? '#10b981' : '#059669', 
        bg: isDark ? '#1f2937' : '#f0fdf4', 
        label: 'Low Risk',
        gradient: isDark ? ['#059669', '#047857'] : ['#d1fae5', '#a7f3d0']
      },
      default: { 
        color: isDark ? '#6b7280' : '#64748b', 
        bg: isDark ? '#1f2937' : '#f1f5f9', 
        label: 'Unknown Risk',
        gradient: isDark ? ['#4b5563', '#374151'] : ['#e2e8f0', '#cbd5e1']
      }
    };

    if (!severity) return baseConfig.default;
    
    const severityLower = severity.toLowerCase();
    if (severityLower.includes('high') || severityLower.includes('severe')) return baseConfig.high;
    if (severityLower.includes('medium') || severityLower.includes('moderate')) return baseConfig.medium;
    if (severityLower.includes('low') || severityLower.includes('mild')) return baseConfig.low;
    
    return { ...baseConfig.default, label: severity };
  };

  const severityConfig = getSeverityConfig(disease.severity);

  const getDetailCardGradient = (type) => {
    const gradients = {
      symptoms: isDark 
        ? ['#1e40af', '#1d4ed8', '#2563eb'] 
        : ['#dbeafe', '#bfdbfe', '#93c5fd'],
      causes: isDark 
        ? ['#dc2626', '#b91c1c', '#991b1b'] 
        : ['#fee2e2', '#fecaca', '#fca5a5'],
      treatment: isDark 
        ? ['#059669', '#047857', '#065f46'] 
        : ['#d1fae5', '#a7f3d0', '#86efac'],
      prevention: isDark 
        ? ['#7c3aed', '#6d28d9', '#5b21b6'] 
        : ['#ede9fe', '#ddd6fe', '#c4b5fd']
    };
    return gradients[type] || gradients.symptoms;
  };

  const DetailCard = ({ icon, title, content, type }) => (
    <View style={[styles.detailCard, { 
      shadowColor: theme.shadow,
      backgroundColor: theme.surface 
    }]}>
      <LinearGradient
        colors={getDetailCardGradient(type)}
        style={styles.detailCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.detailCardHeader}>
          <View style={[styles.detailIconContainer, { 
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderColor: 'rgba(255,255,255,0.3)'
          }]}>
            <ThemedText style={[styles.detailIcon, { color: '#ffffff' }]}>
              {icon}
            </ThemedText>
          </View>
          <ThemedText style={[styles.detailCardTitle, { color: '#ffffff' }]}>
            {title}
          </ThemedText>
        </View>
        <ThemedText style={[styles.detailCardContent, { color: 'rgba(255,255,255,0.95)' }]}>
          {content}
        </ThemedText>
      </LinearGradient>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={Platform.OS === 'ios'}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={isDark 
            ? ['#0f172a', '#1e293b', '#334155', '#475569'] 
            : ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']
          }
          style={[styles.heroSection, { 
            shadowColor: theme.shadow,
            borderBottomColor: theme.border 
          }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.diseaseIconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
                style={[styles.iconGradient, { 
                  borderColor: 'rgba(255,255,255,0.4)',
                  shadowColor: '#000',
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8
                }]}
              >
                <ThemedText style={[styles.diseaseIcon, { color: '#ffffff' }]}>
                  {disease.icon || '🦠'}
                </ThemedText>
              </LinearGradient>
            </View>
            
            <View style={styles.heroText}>
              <ThemedText style={[styles.diseaseTitle, { color: '#ffffff' }]}>
                {disease.name || 'Unknown Disease'}
              </ThemedText>
              
              <View style={[
                styles.severityBadge,
                { 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderColor: 'rgba(255,255,255,0.4)',
                }
              ]}>
                <View style={[styles.severityDot, { backgroundColor: severityConfig.color }]} />
                <ThemedText style={[styles.severityText, { color: '#ffffff' }]}>
                  {severityConfig.label}
                </ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Description Card */}
        {disease.description && (
          <View style={[styles.descriptionCard, { 
            backgroundColor: theme.surface,
            shadowColor: theme.shadow,
            borderColor: theme.border
          }]}>
            <LinearGradient
              colors={isDark 
                ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] 
                : ['rgba(59,130,246,0.05)', 'rgba(99,102,241,0.03)']
              }
              style={styles.descriptionGradient}
            >
              <View style={styles.descriptionHeader}>
                <View style={[styles.descriptionIconContainer, { 
                  backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                  borderColor: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)'
                }]}>
                  <ThemedText style={[styles.descriptionIcon, { 
                    color: isDark ? '#60a5fa' : '#3b82f6' 
                  }]}>
                    📋
                  </ThemedText>
                </View>
                <ThemedText style={[styles.descriptionTitle, { color: theme.text }]}>
                  Medical Overview
                </ThemedText>
              </View>
              <ThemedText style={[styles.descriptionText, { color: theme.textSecondary }]}>
                {disease.description}
              </ThemedText>
            </LinearGradient>
          </View>
        )}

        {/* Detail Cards */}
        <View style={styles.detailsContainer}>
          {disease.symptoms && (
            <DetailCard
              icon="🔍"
              title="Clinical Symptoms"
              content={disease.symptoms}
              type="symptoms"
            />
          )}

          {disease.causes && (
            <DetailCard
              icon="🦠"
              title="Etiology & Causes"
              content={disease.causes}
              type="causes"
            />
          )}

          {disease.treatment && (
            <DetailCard
              icon="💊"
              title="Treatment Protocol"
              content={disease.treatment}
              type="treatment"
            />
          )}

          {disease.prevention && (
            <DetailCard
              icon="🛡️"
              title="Prevention Measures"
              content={disease.prevention}
              type="prevention"
            />
          )}
        </View>

        {/* Professional Footer */}
        <View style={[styles.footerCard, { 
          backgroundColor: theme.surface,
          borderColor: theme.border 
        }]}>
          <LinearGradient
            colors={isDark 
              ? ['rgba(139,92,246,0.1)', 'rgba(59,130,246,0.05)'] 
              : ['rgba(139,92,246,0.05)', 'rgba(59,130,246,0.03)']
            }
            style={styles.footerGradient}
          >
            <View style={styles.footerContent}>
              <ThemedText style={[styles.disclaimerIcon, { 
                color: isDark ? '#a78bfa' : '#8b5cf6' 
              }]}>
                ⚕️
              </ThemedText>
              <View style={styles.disclaimerTextContainer}>
                <ThemedText style={[styles.disclaimerTitle, { color: theme.text }]}>
                  Medical Disclaimer
                </ThemedText>
                <ThemedText style={[styles.disclaimerText, { color: theme.textMuted }]}>
                  This information is for educational purposes only. Always consult with qualified healthcare professionals for medical advice.
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Error State
  errorGradient: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  errorIconText: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Hero Section
  heroSection: {
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 36,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderBottomWidth: 1,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diseaseIconContainer: {
    marginRight: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 4 },
  },
  diseaseIcon: {
    fontSize: 36,
  },
  heroText: {
    flex: 1,
  },
  diseaseTitle: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Description Card
  descriptionCard: {
    margin: 20,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  descriptionGradient: {
    padding: 24,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  descriptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1.5,
  },
  descriptionIcon: {
    fontSize: 24,
  },
  descriptionTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },

  // Detail Cards
  detailsContainer: {
    padding: 20,
    gap: 20,
  },
  detailCard: {
    borderRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  detailCardGradient: {
    padding: 24,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  detailIcon: {
    fontSize: 22,
  },
  detailCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  detailCardContent: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Footer
  footerCard: {
    margin: 20,
    marginTop: 8,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
  },
  footerGradient: {
    padding: 20,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    fontSize: 28,
    marginRight: 16,
    marginTop: 2,
  },
  disclaimerTextContainer: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bottomSpacing: {
    height: 40,
  },
});