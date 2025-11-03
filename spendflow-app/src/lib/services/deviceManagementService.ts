/**
 * Device Management and Persistent Authentication Service
 *
 * Handles device fingerprinting, trusted device management, and persistent login sessions
 * to reduce authentication friction while maintaining security.
 */

import { db } from '@/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

// Helper function to generate UUID v4 using crypto.getRandomValues()
function generateUUID(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Set version (4) and variant bits
  array[6] = (array[6] & 0x0f) | 0x40; // Version 4
  array[8] = (array[8] & 0x3f) | 0x80; // Variant 10
  
  const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Device fingerprint interface
export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  screenResolution: string;
  timezone: string;
  plugins: string[];
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
}

// Trusted device interface
export interface TrustedDevice {
  id: string;
  userId: string;
  deviceId: string;
  fingerprint: DeviceFingerprint;
  deviceName: string;
  ipAddress?: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  lastLogin: Timestamp;
  firstLogin: Timestamp;
  loginCount: number;
  isTrusted: boolean;
  trustExpires?: Timestamp;
  rememberMe: boolean;
  securityLevel: 'low' | 'medium' | 'high';
}

// Persistent session interface
export interface PersistentSession {
  id: string;
  userId: string;
  deviceId: string;
  sessionToken: string;
  refreshToken: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  lastUsed: Timestamp;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

// Device management service
export class DeviceManagementService {
  // Generate a unique device fingerprint
  static async generateDeviceFingerprint(): Promise<DeviceFingerprint> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
    const canvasFingerprint = ctx ? ctx.canvas.toDataURL() : '';

    // WebGL fingerprint
    let webglFingerprint = '';
    try {
      const canvasGL = document.createElement('canvas');
      const gl = canvasGL.getContext('webgl') || canvasGL.getContext('experimental-webgl');
      if (gl && typeof (gl as WebGLRenderingContext).getParameter === 'function') {
        const vendor = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).VENDOR) || '';
        const renderer = (gl as WebGLRenderingContext).getParameter((gl as WebGLRenderingContext).RENDERER) || '';
        webglFingerprint = vendor + renderer;
      }
    } catch {
      // WebGL not supported
    }

    // Audio fingerprint
    let audioFingerprint = '';
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      audioFingerprint = Array.from(dataArray.slice(0, 10)).join(',');
    } catch {
      // Audio context not supported
    }

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      plugins: Array.from(navigator.plugins).map(p => p.name),
      canvasFingerprint,
      webglFingerprint,
      audioFingerprint
    };
  }

  // Generate a stable device ID based on fingerprint
  static async generateDeviceId(fingerprint: DeviceFingerprint): Promise<string> {
    const data = JSON.stringify({
      userAgent: fingerprint.userAgent,
      platform: fingerprint.platform,
      screenResolution: fingerprint.screenResolution,
      timezone: fingerprint.timezone,
      canvasFingerprint: fingerprint.canvasFingerprint.substring(0, 50),
      webglFingerprint: fingerprint.webglFingerprint
    });

    // Simple hash function for device ID
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }

  // Register or update a trusted device
  static async registerDevice(
    userId: string,
    deviceName: string,
    rememberMe: boolean = false,
    ipAddress?: string
  ): Promise<TrustedDevice> {
    const fingerprint = await this.generateDeviceFingerprint();
    const deviceId = await this.generateDeviceId(fingerprint);

    const deviceRef = doc(db, 'trustedDevices', `${userId}_${deviceId}`);
    const deviceDoc = await getDoc(deviceRef);

    const now = Timestamp.now();
    const trustExpires = rememberMe ? Timestamp.fromDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) : undefined; // 90 days

    const deviceData: Omit<TrustedDevice, 'id'> = {
      userId,
      deviceId,
      fingerprint,
      deviceName,
      userAgent: navigator.userAgent,
      lastLogin: now,
      firstLogin: deviceDoc.exists() ? deviceDoc.data().firstLogin : now,
      loginCount: deviceDoc.exists() ? (deviceDoc.data().loginCount || 0) + 1 : 1,
      isTrusted: rememberMe,
      rememberMe,
      securityLevel: this.calculateSecurityLevel(fingerprint)
    };

    // Only include ipAddress if it has a value (Firestore doesn't allow undefined)
    if (ipAddress) {
      deviceData.ipAddress = ipAddress;
    }

    // Only include trustExpires if it has a value (Firestore doesn't allow undefined)
    if (trustExpires) {
      deviceData.trustExpires = trustExpires;
    }

    const cleanedDeviceData = Object.fromEntries(
      Object.entries(deviceData).filter(([, value]) => value !== undefined)
    );

    await setDoc(deviceRef, cleanedDeviceData);

    return {
      id: deviceRef.id,
      ...deviceData
    };
  }

  // Get all trusted devices for a user
  static async getTrustedDevices(userId: string): Promise<TrustedDevice[]> {
    const q = query(
      collection(db, 'trustedDevices'),
      where('userId', '==', userId),
      orderBy('lastLogin', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TrustedDevice));
  }

  // Check if current device is trusted
  static async isDeviceTrusted(userId: string): Promise<boolean> {
    try {
      const fingerprint = await this.generateDeviceFingerprint();
      const deviceId = await this.generateDeviceId(fingerprint);

      const deviceRef = doc(db, 'trustedDevices', `${userId}_${deviceId}`);
      const deviceDoc = await getDoc(deviceRef);

      if (!deviceDoc.exists()) {
        return false;
      }

      const device = deviceDoc.data() as TrustedDevice;
      const now = Timestamp.now();

      // Check if trust has expired
      if (device.trustExpires && device.trustExpires < now) {
        return false;
      }

      return device.isTrusted;
    } catch (error) {
      console.error('Error checking device trust:', error);
      return false;
    }
  }

  // Remove trust from a device
  static async revokeDeviceTrust(deviceId: string): Promise<void> {
    const deviceRef = doc(db, 'trustedDevices', deviceId);
    await updateDoc(deviceRef, {
      isTrusted: false,
      rememberMe: false,
      // Remove trustExpires field instead of setting to null
      updatedAt: Timestamp.now()
    });
  }

  // Calculate security level based on device fingerprint
  private static calculateSecurityLevel(fingerprint: DeviceFingerprint): 'low' | 'medium' | 'high' {
    let score = 0;

    // Platform security
    if (fingerprint.platform.includes('Mac') || fingerprint.platform.includes('Linux')) {
      score += 2;
    } else if (fingerprint.platform.includes('Win')) {
      score += 1;
    }

    // Screen resolution (higher resolution = more likely desktop)
    const [width, height] = fingerprint.screenResolution.split('x').map(Number);
    if (width >= 1920 && height >= 1080) {
      score += 2;
    } else if (width >= 1366 && height >= 768) {
      score += 1;
    }

    // Cookie support
    if (fingerprint.cookieEnabled) {
      score += 1;
    }

    // Timezone (common timezones are more trustworthy)
    const commonTimezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'];
    if (commonTimezones.includes(fingerprint.timezone)) {
      score += 1;
    }

    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }
}

// Persistent authentication service
export class PersistentAuthService {
  private static readonly SESSION_COOKIE = 'spendflow_session';
  private static readonly REFRESH_COOKIE = 'spendflow_refresh';

  // Create a persistent session
  static async createPersistentSession(userId: string, deviceId: string): Promise<PersistentSession> {
    const sessionId = generateUUID();
    const sessionToken = generateUUID();
    const refreshToken = generateUUID();

    // Session expires in 7 days, refresh token in 90 days
    const sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const refreshExpires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const session: Omit<PersistentSession, 'id'> = {
      userId,
      deviceId,
      sessionToken,
      refreshToken,
      expiresAt: Timestamp.fromDate(sessionExpires),
      createdAt: Timestamp.now(),
      lastUsed: Timestamp.now(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      isActive: true
    };

    const sessionRef = doc(db, 'persistentSessions', sessionId);
    await setDoc(sessionRef, session);

    // Set secure cookies
    this.setSecureCookie(this.SESSION_COOKIE, sessionToken, sessionExpires);
    this.setSecureCookie(this.REFRESH_COOKIE, refreshToken, refreshExpires);

    return {
      id: sessionId,
      ...session
    };
  }

  // Validate and refresh a persistent session
  static async validatePersistentSession(): Promise<string | null> {
    const sessionToken = this.getCookie(this.SESSION_COOKIE);
    const refreshToken = this.getCookie(this.REFRESH_COOKIE);

    if (!sessionToken) return null;

    try {
      // Find active session
      const q = query(
        collection(db, 'persistentSessions'),
        where('sessionToken', '==', sessionToken),
        where('isActive', '==', true),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const session = snapshot.docs[0].data() as PersistentSession;

      // Check if session is expired
      if (session.expiresAt < Timestamp.now()) {
        // Try to refresh with refresh token
        if (refreshToken && session.refreshToken === refreshToken) {
          return await this.refreshSession(session.id);
        }
        return null;
      }

      // Update last used timestamp
      await updateDoc(doc(db, 'persistentSessions', session.id), {
        lastUsed: Timestamp.now()
      });

      return session.userId;
    } catch (error) {
      console.error('Error validating persistent session:', error);
      return null;
    }
  }

  // Refresh an expired session using refresh token
  private static async refreshSession(sessionId: string): Promise<string | null> {
    try {
      const sessionRef = doc(db, 'persistentSessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) return null;

      const session = sessionDoc.data() as PersistentSession;

      // Create new session tokens
      const newSessionToken = generateUUID();
      const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await updateDoc(sessionRef, {
        sessionToken: newSessionToken,
        expiresAt: Timestamp.fromDate(newExpires),
        lastUsed: Timestamp.now()
      });

      // Update cookie
      this.setSecureCookie(this.SESSION_COOKIE, newSessionToken, newExpires);

      return session.userId;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }

  // End persistent session
  static async endPersistentSession(): Promise<void> {
    // Remove cookies
    this.deleteCookie(this.SESSION_COOKIE);
    this.deleteCookie(this.REFRESH_COOKIE);

    try {
      const sessionToken = this.getCookie(this.SESSION_COOKIE);
      if (sessionToken) {
        const q = query(
          collection(db, 'persistentSessions'),
          where('sessionToken', '==', sessionToken),
          limit(1)
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          await updateDoc(doc(db, 'persistentSessions', snapshot.docs[0].id), {
            isActive: false
          });
        }
      }
    } catch (error) {
      console.error('Error ending persistent session:', error);
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = Timestamp.now();

      const q = query(
        collection(db, 'persistentSessions'),
        where('expiresAt', '<', now)
      );

      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));

      await Promise.all(deletePromises);
      console.log(`Cleaned up ${deletePromises.length} old alerts`);
      return deletePromises.length;
    } catch {
      console.error('Error cleaning up expired sessions');
      return 0;
    }
  }

  // Cookie management utilities
  private static setSecureCookie(name: string, value: string, expires: Date): void {
    const cookieOptions = [
      `${name}=${value}`,
      `expires=${expires.toUTCString()}`,
      'path=/',
      'secure',
      'httponly',
      'samesite=strict'
    ].join('; ');

    document.cookie = cookieOptions;
  }

  private static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private static deleteCookie(name: string): void {
    const cookieValue = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = cookieValue;
  }

  private static async getClientIP(): Promise<string> {
    try {
      // This is a simplified approach - in production, you'd use a service
      // or get the IP from the server-side request
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

// Cookie consent and preferences
export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  rememberDevice: boolean;
  lastUpdated: Timestamp;
}

export class CookieConsentService {
  private static readonly PREFERENCES_KEY = 'cookie_preferences';

  static getPreferences(): CookiePreferences {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading cookie preferences:', error);
    }

    // Default preferences
    return {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      rememberDevice: false,
      lastUpdated: Timestamp.now()
    };
  }

  static setPreferences(preferences: Partial<CookiePreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = {
        ...current,
        ...preferences,
        lastUpdated: Timestamp.now()
      };
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  }

  static canUseCookies(type: keyof CookiePreferences): boolean {
    const preferences = this.getPreferences();
    return preferences[type] === true;
  }

  static clearAllCookies(): void {
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

      // Clear the cookie by setting it to expire in the past
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  }
}
