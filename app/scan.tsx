// Powered by OnSpace.AI
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { collectDeviceInfo, runDiagnosis, DeviceInfo, DiagnosticResult } from '@/services/deviceService';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

const SCAN_STEPS = [
  { label: 'बैटरी जांच', sub: 'Battery Check', icon: 'battery-full' },
  { label: 'नेटवर्क जांच', sub: 'Network Check', icon: 'wifi' },
  { label: 'मेमोरी जांच', sub: 'RAM Check', icon: 'memory' },
  { label: 'सिस्टम जांच', sub: 'System Check', icon: 'phone-android' },
  { label: 'रिपोर्ट तैयार', sub: 'Generating Report', icon: 'assignment' },
];

type ScanState = 'idle' | 'scanning' | 'done';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [currentStep, setCurrentStep] = useState(-1);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (scanState === 'scanning') {
      const radar = Animated.loop(
        Animated.timing(radarAnim, { toValue: 1, duration: 1800, useNativeDriver: true, easing: Easing.linear })
      );
      radar.start();
      return () => radar.stop();
    }
  }, [scanState]);

  async function startScan() {
    setScanState('scanning');
    setCurrentStep(0);
    setResult(null);

    Animated.timing(progressAnim, { toValue: 0, duration: 0, useNativeDriver: false }).start();

    // Collect real device info
    const info = await collectDeviceInfo();
    setDeviceInfo(info);

    // Simulate steps
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      setCurrentStep(i);
      await delay(700 + Math.random() * 400);
      Animated.timing(progressAnim, {
        toValue: (i + 1) / SCAN_STEPS.length,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }

    const diag = runDiagnosis(info);
    setResult(diag);
    setScanState('done');
  }

  function viewReport() {
    if (!deviceInfo || !result) return;
    router.push({
      pathname: '/report',
      params: {
        deviceInfoStr: JSON.stringify(deviceInfo),
        resultStr: JSON.stringify(result),
      },
    });
  }

  const radarRotate = radarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
            <Text style={styles.userId}>ID: {user?.customerId}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="logout" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Hero Area */}
      <View style={styles.heroArea}>
        <Animated.View style={[styles.radarOuter, { transform: [{ scale: pulseAnim }] }]}>
          <Animated.View style={[styles.radarSweep, { transform: [{ rotate: radarRotate }] }]}>
            <View style={styles.radarLine} />
          </Animated.View>
          <View style={styles.phoneIcon}>
            <MaterialIcons
              name="phone-android"
              size={52}
              color={scanState === 'scanning' ? Colors.primary : Colors.textSecondary}
            />
          </View>
          <View style={[styles.radarRing, { width: 100, height: 100, borderRadius: 50, opacity: 0.3 }]} />
          <View style={[styles.radarRing, { width: 140, height: 140, borderRadius: 70, opacity: 0.2 }]} />
          <View style={[styles.radarRing, { width: 180, height: 180, borderRadius: 90, opacity: 0.1 }]} />
        </Animated.View>

        {scanState === 'idle' && (
          <View style={styles.idleText}>
            <Text style={styles.scanTitle}>डिवाइस स्कैन</Text>
            <Text style={styles.scanSubtitle}>Device Diagnostic Ready</Text>
            <Text style={styles.scanDesc}>
              अपने डिवाइस की पूरी जांच के लिए स्कैन शुरू करें
            </Text>
          </View>
        )}

        {scanState === 'scanning' && (
          <View style={styles.scanningInfo}>
            <Text style={styles.scanningLabel}>
              {SCAN_STEPS[currentStep]?.label ?? '...'}
            </Text>
            <Text style={styles.scanningSubLabel}>
              {SCAN_STEPS[currentStep]?.sub ?? ''}
            </Text>
          </View>
        )}

        {scanState === 'done' && result && (
          <View style={styles.doneInfo}>
            <MaterialIcons
              name={result.status === 'healthy' ? 'check-circle' : result.status === 'warning' ? 'warning' : 'error'}
              size={32}
              color={result.status === 'healthy' ? Colors.success : result.status === 'warning' ? Colors.warning : Colors.danger}
            />
            <Text style={[styles.doneScore, {
              color: result.status === 'healthy' ? Colors.success : result.status === 'warning' ? Colors.warning : Colors.danger
            }]}>
              {result.score}%
            </Text>
            <Text style={styles.doneLabel}>
              {result.status === 'healthy' ? 'Device Healthy ✅' : result.status === 'warning' ? 'Warning ⚠️' : 'Problem Detected 🔴'}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      {scanState === 'scanning' && (
        <View style={styles.progressSection}>
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <View style={styles.stepRow}>
            {SCAN_STEPS.map((step, i) => (
              <View key={step.label} style={[styles.stepDot, i <= currentStep && styles.stepDotActive]}>
                <MaterialIcons
                  name={step.icon as any}
                  size={14}
                  color={i <= currentStep ? Colors.background : Colors.textMuted}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Device Mini Info */}
      {deviceInfo && scanState !== 'scanning' && (
        <View style={styles.miniInfoRow}>
          <MiniChip icon="smartphone" label={`${deviceInfo.brand} ${deviceInfo.modelName}`} />
          <MiniChip icon="system-update" label={`${deviceInfo.osName} ${deviceInfo.osVersion}`} />
          <MiniChip
            icon="battery-full"
            label={`${Math.round(deviceInfo.batteryLevel * 100)}%`}
            color={deviceInfo.batteryLevel < 0.2 ? Colors.danger : Colors.success}
          />
        </View>
      )}

      {/* Action Button */}
      <View style={[styles.actionArea, { paddingBottom: insets.bottom + Spacing.md }]}>
        {scanState === 'idle' && (
          <TouchableOpacity style={styles.mainBtn} onPress={startScan} activeOpacity={0.85}>
            <MaterialIcons name="radar" size={24} color={Colors.background} />
            <Text style={styles.mainBtnText}>स्कैन शुरू करें • Start Scan</Text>
          </TouchableOpacity>
        )}
        {scanState === 'scanning' && (
          <View style={[styles.mainBtn, styles.mainBtnScanning]}>
            <MaterialIcons name="sensors" size={24} color={Colors.primary} />
            <Text style={[styles.mainBtnText, { color: Colors.primary }]}>स्कैनिंग जारी है...</Text>
          </View>
        )}
        {scanState === 'done' && (
          <View style={styles.doneActions}>
            <TouchableOpacity style={styles.mainBtn} onPress={viewReport} activeOpacity={0.85}>
              <MaterialIcons name="assignment" size={24} color={Colors.background} />
              <Text style={styles.mainBtnText}>रिपोर्ट देखें • View Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={startScan} activeOpacity={0.85}>
              <MaterialIcons name="refresh" size={20} color={Colors.primary} />
              <Text style={styles.secondaryBtnText}>दोबारा स्कैन</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function MiniChip({ icon, label, color }: { icon: string; label: string; color?: string }) {
  return (
    <View style={chipStyles.chip}>
      <MaterialIcons name={icon as any} size={12} color={color ?? Colors.primary} />
      <Text style={[chipStyles.label, color ? { color } : null]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: { ...Typography.caption, color: Colors.textSecondary, maxWidth: 90 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { ...Typography.subtitle, color: Colors.primary, fontSize: 16 },
  userName: { ...Typography.body, color: Colors.textPrimary, fontWeight: '600' },
  userId: { ...Typography.caption, color: Colors.textMuted },
  logoutBtn: { padding: Spacing.sm },

  heroArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  radarOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: Colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryGlow,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  radarSweep: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarLine: {
    position: 'absolute',
    width: 2,
    height: 88,
    backgroundColor: Colors.primary,
    bottom: 90,
    left: 89,
    opacity: 0.7,
    borderRadius: 1,
  },
  phoneIcon: { zIndex: 2 },
  radarRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  idleText: { alignItems: 'center' },
  scanTitle: { ...Typography.title, color: Colors.textPrimary, marginBottom: 4 },
  scanSubtitle: { ...Typography.label, color: Colors.primary, marginBottom: Spacing.sm },
  scanDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  scanningInfo: { alignItems: 'center' },
  scanningLabel: { ...Typography.subtitle, color: Colors.primary },
  scanningSubLabel: { ...Typography.label, color: Colors.textSecondary, marginTop: 2 },

  doneInfo: { alignItems: 'center', gap: Spacing.xs },
  doneScore: { fontSize: 40, fontWeight: '800' },
  doneLabel: { ...Typography.subtitle, color: Colors.textPrimary },

  progressSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  progressBg: {
    height: 6,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  stepRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  miniInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    justifyContent: 'center',
  },

  actionArea: { paddingHorizontal: Spacing.md },
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    height: 56,
  },
  mainBtnScanning: {
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  mainBtnText: { ...Typography.subtitle, color: Colors.background, fontSize: 16 },
  doneActions: { gap: Spacing.sm },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    height: 48,
  },
  secondaryBtnText: { ...Typography.label, color: Colors.primary, fontSize: 15 },
});
