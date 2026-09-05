// Powered by OnSpace.AI
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { DeviceInfo, DiagnosticResult, DiagnosticCheck } from '@/services/deviceService';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

const STATUS_CONFIG = {
  healthy: {
    color: Colors.success,
    glow: Colors.successGlow,
    bg: '#001A0E',
    icon: 'check-circle' as const,
    labelHi: 'डिवाइस स्वस्थ है',
    label: 'Device Healthy',
    desc: 'सभी प्रमुख घटक सामान्य रूप से काम कर रहे हैं।',
  },
  warning: {
    color: Colors.warning,
    glow: Colors.warningGlow,
    bg: '#1A1200',
    icon: 'warning' as const,
    labelHi: 'चेतावनी',
    label: 'Warning',
    desc: 'कुछ समस्याएं पाई गई हैं जिन पर ध्यान दें।',
  },
  critical: {
    color: Colors.danger,
    glow: Colors.dangerGlow,
    bg: '#1A0005',
    icon: 'error' as const,
    labelHi: 'समस्या पाई गई',
    label: 'Problem Detected',
    desc: 'गंभीर समस्याएं पाई गई हैं। तुरंत ध्यान दें।',
  },
};

const CHECK_STATUS_COLOR: Record<DiagnosticCheck['status'], string> = {
  good: Colors.success,
  warning: Colors.warning,
  bad: Colors.danger,
  info: Colors.primary,
};

const CHECK_STATUS_ICON: Record<DiagnosticCheck['status'], string> = {
  good: 'check-circle',
  warning: 'warning',
  bad: 'cancel',
  info: 'info',
};

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ deviceInfoStr: string; resultStr: string }>();

  const deviceInfo: DeviceInfo | null = params.deviceInfoStr ? JSON.parse(params.deviceInfoStr) : null;
  const result: DiagnosticResult | null = params.resultStr ? JSON.parse(params.resultStr) : null;

  if (!deviceInfo || !result) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textSecondary }}>Report data not available</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, marginTop: 16 }}>वापस जाएं</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cfg = STATUS_CONFIG[result.status];

  async function shareReport() {
    const lines = [
      `📱 Device Diagnostic Report`,
      `━━━━━━━━━━━━━━━━━━`,
      `Device: ${deviceInfo?.brand} ${deviceInfo?.modelName}`,
      `OS: ${deviceInfo?.osName} ${deviceInfo?.osVersion}`,
      `Status: ${cfg.label} (${result.score}%)`,
      ``,
      ...result.checks.map(c => `${c.status === 'good' ? '✅' : c.status === 'warning' ? '⚠️' : c.status === 'bad' ? '❌' : 'ℹ️'} ${c.labelHi}: ${c.value}`),
      ``,
      result.summary,
    ];
    await Share.share({ message: lines.join('\n') });
  }

  const goodCount = result.checks.filter(c => c.status === 'good').length;
  const warnCount = result.checks.filter(c => c.status === 'warning').length;
  const badCount = result.checks.filter(c => c.status === 'bad').length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>डायग्नोस्टिक रिपोर्ट</Text>
        <TouchableOpacity onPress={shareReport} style={styles.shareBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="share" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        {/* Hero Status Card */}
        <View style={[styles.statusCard, { backgroundColor: cfg.bg, borderColor: cfg.color + '40' }]}>
          <View style={[styles.statusIconCircle, { backgroundColor: cfg.glow, borderColor: cfg.color }]}>
            <MaterialIcons name={cfg.icon} size={48} color={cfg.color} />
          </View>
          <Text style={[styles.statusScore, { color: cfg.color }]}>{result.score}%</Text>
          <Text style={styles.statusLabelHi}>{cfg.labelHi}</Text>
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={styles.statusDesc}>{result.summary}</Text>

          {/* Quick stats */}
          <View style={styles.quickStats}>
            <StatPill icon="check-circle" color={Colors.success} value={goodCount} label="सामान्य" />
            <StatPill icon="warning" color={Colors.warning} value={warnCount} label="चेतावनी" />
            <StatPill icon="cancel" color={Colors.danger} value={badCount} label="समस्या" />
          </View>
        </View>

        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 डिवाइस जानकारी</Text>
          <View style={styles.infoGrid}>
            <InfoRow label="ब्रांड" value={`${deviceInfo.brand} ${deviceInfo.modelName}`} />
            <InfoRow label="OS" value={`${deviceInfo.osName} ${deviceInfo.osVersion}`} />
            <InfoRow label="RAM" value={deviceInfo.totalMemory} />
            <InfoRow label="डिवाइस प्रकार" value={deviceInfo.deviceType} />
            <InfoRow label="IP Address" value={deviceInfo.ipAddress} />
            <InfoRow label="नेटवर्क" value={deviceInfo.networkType} />
          </View>
        </View>

        {/* Diagnostic Checks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 विस्तृत जांच</Text>
          {result.checks.map((check) => (
            <DiagCard key={check.id} check={check} />
          ))}
        </View>

        {/* Recommendation */}
        <View style={[styles.recCard, { borderColor: cfg.color + '50', backgroundColor: cfg.bg }]}>
          <MaterialIcons name="lightbulb" size={20} color={cfg.color} />
          <View style={styles.recContent}>
            <Text style={[styles.recTitle, { color: cfg.color }]}>सुझाव • Recommendation</Text>
            <Text style={styles.recDesc}>
              {result.status === 'healthy'
                ? 'आपका डिवाइस उत्कृष्ट स्थिति में है। नियमित रूप से डायग्नोस्टिक चलाते रहें।'
                : result.status === 'warning'
                ? 'कृपया चेतावनी वाले क्षेत्रों पर ध्यान दें और जल्द सुधार करें।'
                : 'तुरंत किसी तकनीशियन से संपर्क करें। डिवाइस में गंभीर समस्याएं हैं।'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/scan')} activeOpacity={0.85}>
          <MaterialIcons name="refresh" size={22} color={Colors.background} />
          <Text style={styles.primaryBtnText}>दोबारा स्कैन करें • Rescan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareFullBtn} onPress={shareReport} activeOpacity={0.85}>
          <MaterialIcons name="share" size={20} color={Colors.primary} />
          <Text style={styles.shareFullBtnText}>रिपोर्ट शेयर करें • Share Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function DiagCard({ check }: { check: DiagnosticCheck }) {
  const color = CHECK_STATUS_COLOR[check.status];
  const icon = CHECK_STATUS_ICON[check.status];

  return (
    <View style={[diagStyles.card, { borderLeftColor: color }]}>
      <View style={diagStyles.row}>
        <View style={[diagStyles.iconBox, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={check.icon as any} size={20} color={color} />
        </View>
        <View style={diagStyles.info}>
          <Text style={diagStyles.label}>{check.labelHi}</Text>
          <Text style={diagStyles.subLabel}>{check.label}</Text>
          <Text style={[diagStyles.value, { color }]}>{check.value}</Text>
          <Text style={diagStyles.detail}>{check.detail}</Text>
        </View>
        <MaterialIcons name={icon as any} size={22} color={color} />
      </View>
    </View>
  );
}

function StatPill({ icon, color, value, label }: { icon: string; color: string; value: number; label: string }) {
  return (
    <View style={[pillStyles.pill, { borderColor: color + '40', backgroundColor: color + '10' }]}>
      <MaterialIcons name={icon as any} size={16} color={color} />
      <Text style={[pillStyles.val, { color }]}>{value}</Text>
      <Text style={pillStyles.lbl}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
  val: { ...Typography.subtitle, fontSize: 18, fontWeight: '700' },
  lbl: { ...Typography.caption, color: Colors.textMuted },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { ...Typography.label, color: Colors.textSecondary, flex: 1 },
  value: { ...Typography.body, color: Colors.textPrimary, flex: 1, textAlign: 'right', fontWeight: '500' },
});

const diagStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1 },
  label: { ...Typography.body, color: Colors.textPrimary, fontWeight: '600' },
  subLabel: { ...Typography.caption, color: Colors.textMuted },
  value: { ...Typography.label, fontWeight: '600', marginTop: 2 },
  detail: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2, lineHeight: 16 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: Spacing.xs },
  navTitle: { ...Typography.subtitle, color: Colors.textPrimary, flex: 1, textAlign: 'center' },
  shareBtn: { padding: Spacing.xs },
  content: { padding: Spacing.md, gap: Spacing.md },
  statusCard: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusScore: { fontSize: 44, fontWeight: '800' },
  statusLabelHi: { ...Typography.subtitle, color: Colors.textPrimary },
  statusLabel: { ...Typography.label, fontWeight: '600' },
  statusDesc: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  quickStats: { flexDirection: 'row', gap: Spacing.sm, width: '100%', marginTop: Spacing.sm },
  section: {},
  sectionTitle: { ...Typography.subtitle, color: Colors.textPrimary, marginBottom: Spacing.md },
  infoGrid: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  recContent: { flex: 1 },
  recTitle: { ...Typography.label, fontWeight: '700', marginBottom: 4 },
  recDesc: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    height: 56,
  },
  primaryBtnText: { ...Typography.subtitle, color: Colors.background, fontSize: 16 },
  shareFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    height: 50,
  },
  shareFullBtnText: { ...Typography.label, color: Colors.primary, fontSize: 15 },
});
