// Powered by OnSpace.AI
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'नाम आवश्यक है';
    if (!mobile.trim() || mobile.length < 10) errs.mobile = 'सही मोबाइल नंबर डालें';
    if (!customerId.trim()) errs.customerId = 'Customer ID आवश्यक है';
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      await login({ name: name.trim(), mobile: mobile.trim(), customerId: customerId.trim() });
      router.replace('/scan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="phone-android" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.appTitle}>Device Diagnostic</Text>
          <Text style={styles.appSubtitle}>डिवाइस डायग्नोस्टिक</Text>
          <Text style={styles.heroDesc}>
            अपने डिवाइस की पूरी जांच करें और स्वास्थ्य रिपोर्ट पाएं
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>पंजीकरण करें</Text>
          <Text style={styles.cardSubtitle}>Register / Login</Text>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              <MaterialIcons name="person" size={14} color={Colors.textSecondary} /> नाम (Name)
            </Text>
            <View style={[styles.inputWrap, errors.name ? styles.inputError : null]}>
              <MaterialIcons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="अपना नाम दर्ज करें"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={(v) => { setName(v); setErrors(e => ({ ...e, name: '' })); }}
                autoCapitalize="words"
              />
            </View>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Mobile */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              <MaterialIcons name="phone" size={14} color={Colors.textSecondary} /> मोबाइल नंबर
            </Text>
            <View style={[styles.inputWrap, errors.mobile ? styles.inputError : null]}>
              <MaterialIcons name="phone" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="10 अंकों का मोबाइल नंबर"
                placeholderTextColor={Colors.textMuted}
                value={mobile}
                onChangeText={(v) => { setMobile(v); setErrors(e => ({ ...e, mobile: '' })); }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.mobile ? <Text style={styles.errorText}>{errors.mobile}</Text> : null}
          </View>

          {/* Customer ID */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              <MaterialIcons name="badge" size={14} color={Colors.textSecondary} /> Customer ID
            </Text>
            <View style={[styles.inputWrap, errors.customerId ? styles.inputError : null]}>
              <MaterialIcons name="badge" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Customer ID दर्ज करें"
                placeholderTextColor={Colors.textMuted}
                value={customerId}
                onChangeText={(v) => { setCustomerId(v); setErrors(e => ({ ...e, customerId: '' })); }}
                autoCapitalize="characters"
              />
            </View>
            {errors.customerId ? <Text style={styles.errorText}>{errors.customerId}</Text> : null}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <>
                <MaterialIcons name="sensors" size={20} color={Colors.background} />
                <Text style={styles.btnText}>स्कैन शुरू करें • Start Scan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          यह ऐप आपके डिवाइस का केवल तकनीकी विश्लेषण करता है
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { paddingHorizontal: Spacing.md },
  heroSection: { alignItems: 'center', marginBottom: Spacing.xl },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appTitle: { ...Typography.hero, color: Colors.primary, letterSpacing: 1 },
  appSubtitle: { ...Typography.subtitle, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.sm },
  heroDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  cardTitle: { ...Typography.subtitle, color: Colors.textPrimary, marginBottom: 2 },
  cardSubtitle: { ...Typography.label, color: Colors.primary, marginBottom: Spacing.lg },
  fieldGroup: { marginBottom: Spacing.md },
  fieldLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputError: { borderColor: Colors.danger },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    includeFontPadding: false,
  },
  errorText: { ...Typography.caption, color: Colors.danger, marginTop: 4 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    height: 54,
    marginTop: Spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { ...Typography.subtitle, color: Colors.background, fontSize: 16 },
  footerNote: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
