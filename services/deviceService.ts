// Powered by OnSpace.AI
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

export interface DeviceInfo {
  brand: string;
  modelName: string;
  osName: string;
  osVersion: string;
  totalMemory: string;
  deviceType: string;
  batteryLevel: number;
  batteryState: string;
  isCharging: boolean;
  networkType: string;
  isConnected: boolean;
  ipAddress: string;
  screenOS: string;
}

export interface DiagnosticResult {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  checks: DiagnosticCheck[];
  summary: string;
}

export interface DiagnosticCheck {
  id: string;
  label: string;
  labelHi: string;
  value: string;
  status: 'good' | 'warning' | 'bad' | 'info';
  icon: string;
  detail: string;
}

export async function collectDeviceInfo(): Promise<DeviceInfo> {
  let batteryLevel = 0;
  let batteryState = 'unknown';
  let isCharging = false;
  let networkType = 'Unknown';
  let isConnected = false;
  let ipAddress = 'N/A';

  try {
    batteryLevel = await Battery.getBatteryLevelAsync();
    const state = await Battery.getBatteryStateAsync();
    isCharging = state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
    if (state === Battery.BatteryState.CHARGING) batteryState = 'Charging';
    else if (state === Battery.BatteryState.FULL) batteryState = 'Full';
    else if (state === Battery.BatteryState.UNPLUGGED) batteryState = 'Unplugged';
    else batteryState = 'Unknown';
  } catch (e) {
    batteryLevel = 0.75;
    batteryState = 'Simulated';
  }

  try {
    const netState = await Network.getNetworkStateAsync();
    isConnected = netState.isConnected ?? false;
    networkType = netState.type ?? 'Unknown';
    ipAddress = (await Network.getIpAddressAsync()) ?? 'N/A';
  } catch (e) {
    isConnected = true;
    networkType = 'WiFi';
  }

  const totalMem = Device.totalMemory
    ? `${(Device.totalMemory / (1024 * 1024 * 1024)).toFixed(1)} GB`
    : 'N/A';

  const deviceTypeMap: Record<number, string> = {
    0: 'Unknown',
    1: 'Phone',
    2: 'Tablet',
    3: 'Desktop',
    4: 'TV',
  };

  return {
    brand: Device.brand ?? Platform.OS === 'ios' ? 'Apple' : 'Android',
    modelName: Device.modelName ?? 'Unknown Model',
    osName: Device.osName ?? Platform.OS,
    osVersion: Device.osVersion ?? 'Unknown',
    totalMemory: totalMem,
    deviceType: deviceTypeMap[Device.deviceType ?? 0],
    batteryLevel,
    batteryState,
    isCharging,
    networkType: networkType.toString(),
    isConnected,
    ipAddress,
    screenOS: Platform.OS.toUpperCase(),
  };
}

export function runDiagnosis(info: DeviceInfo): DiagnosticResult {
  const checks: DiagnosticCheck[] = [];
  let totalScore = 0;
  let maxScore = 0;

  // Battery check
  const battPct = Math.round(info.batteryLevel * 100);
  maxScore += 25;
  let battScore = 0;
  let battStatus: DiagnosticCheck['status'] = 'good';
  let battDetail = '';
  if (battPct >= 50) {
    battScore = 25;
    battStatus = 'good';
    battDetail = 'Battery level is healthy.';
  } else if (battPct >= 20) {
    battScore = 15;
    battStatus = 'warning';
    battDetail = 'Battery is low. Please charge soon.';
  } else {
    battScore = 5;
    battStatus = 'bad';
    battDetail = 'Critical battery level! Charge immediately.';
  }
  totalScore += battScore;
  checks.push({
    id: 'battery',
    label: 'Battery Level',
    labelHi: 'बैटरी स्तर',
    value: `${battPct}% (${info.batteryState})`,
    status: battStatus,
    icon: info.isCharging ? 'battery-charging-full' : battPct > 50 ? 'battery-full' : 'battery-alert',
    detail: battDetail,
  });

  // Charging check
  maxScore += 10;
  totalScore += 10;
  checks.push({
    id: 'charging',
    label: 'Charging Status',
    labelHi: 'चार्जिंग स्थिति',
    value: info.isCharging ? 'Charging ⚡' : 'Not Charging',
    status: 'info',
    icon: info.isCharging ? 'power' : 'power-off',
    detail: info.isCharging ? 'Device is currently charging.' : 'Device is running on battery.',
  });

  // Network check
  maxScore += 20;
  let netScore = 0;
  let netStatus: DiagnosticCheck['status'] = 'good';
  let netDetail = '';
  if (info.isConnected) {
    netScore = 20;
    netStatus = 'good';
    netDetail = `Connected via ${info.networkType}. IP: ${info.ipAddress}`;
  } else {
    netScore = 0;
    netStatus = 'bad';
    netDetail = 'No network connection detected.';
  }
  totalScore += netScore;
  checks.push({
    id: 'network',
    label: 'Network Status',
    labelHi: 'नेटवर्क स्थिति',
    value: info.isConnected ? `${info.networkType} Connected` : 'Disconnected',
    status: netStatus,
    icon: info.isConnected ? 'wifi' : 'wifi-off',
    detail: netDetail,
  });

  // Memory check
  maxScore += 20;
  let memScore = 20;
  const memVal = parseFloat(info.totalMemory);
  let memStatus: DiagnosticCheck['status'] = 'good';
  let memDetail = 'RAM is sufficient for normal operation.';
  if (!isNaN(memVal)) {
    if (memVal < 2) {
      memScore = 8;
      memStatus = 'warning';
      memDetail = 'Low RAM may cause slowdowns.';
    } else if (memVal >= 4) {
      memScore = 20;
      memStatus = 'good';
      memDetail = 'RAM is good for multitasking.';
    }
  }
  totalScore += memScore;
  checks.push({
    id: 'memory',
    label: 'RAM / Memory',
    labelHi: 'RAM / मेमोरी',
    value: info.totalMemory !== 'N/A' ? info.totalMemory : 'N/A',
    status: memStatus,
    icon: 'memory',
    detail: memDetail,
  });

  // OS / System
  maxScore += 15;
  totalScore += 15;
  checks.push({
    id: 'os',
    label: 'Operating System',
    labelHi: 'ऑपरेटिंग सिस्टम',
    value: `${info.osName} ${info.osVersion}`,
    status: 'good',
    icon: 'phone-android',
    detail: 'System is running the installed OS version.',
  });

  // Device info
  maxScore += 10;
  totalScore += 10;
  checks.push({
    id: 'device',
    label: 'Device Model',
    labelHi: 'डिवाइस मॉडल',
    value: `${info.brand} ${info.modelName}`,
    status: 'info',
    icon: 'smartphone',
    detail: `${info.deviceType} device running ${info.screenOS}.`,
  });

  const score = Math.round((totalScore / maxScore) * 100);
  let status: DiagnosticResult['status'] = 'healthy';
  let summary = '';

  if (score >= 75) {
    status = 'healthy';
    summary = 'आपका डिवाइस अच्छी स्थिति में है। सभी प्रमुख घटक सामान्य रूप से काम कर रहे हैं।';
  } else if (score >= 50) {
    status = 'warning';
    summary = 'आपके डिवाइस में कुछ समस्याएं हैं जिन पर ध्यान देना जरूरी है।';
  } else {
    status = 'critical';
    summary = 'आपके डिवाइस में गंभीर समस्याएं पाई गई हैं। तुरंत ध्यान दें।';
  }

  return { status, score, checks, summary };
}
