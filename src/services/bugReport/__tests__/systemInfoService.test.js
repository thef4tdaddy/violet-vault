/**
 * Tests for SystemInfoService
 * Testing system information collection functionality
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SystemInfoService } from '../systemInfoService.js';

// Mock logger
vi.mock('../../../utils/common/logger.js', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}));

describe('SystemInfoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBrowserInfo', () => {
    it('should collect basic browser information', () => {
      const info = SystemInfoService.getBrowserInfo();
      
      expect(info).toHaveProperty('userAgent');
      expect(info).toHaveProperty('language');
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('cookieEnabled');
      expect(info).toHaveProperty('onLine');
      expect(typeof info.userAgent).toBe('string');
      expect(typeof info.cookieEnabled).toBe('boolean');
      expect(typeof info.onLine).toBe('boolean');
    });

    it('should handle missing navigator properties gracefully', () => {
      const originalNavigator = global.navigator;
      
      // Mock navigator with missing properties
      global.navigator = {
        userAgent: 'test-agent',
        language: 'en-US',
        platform: 'test-platform'
      };
      
      const info = SystemInfoService.getBrowserInfo();
      
      expect(info.userAgent).toBe('test-agent');
      expect(info.language).toBe('en-US');
      expect(info.platform).toBe('test-platform');
      
      global.navigator = originalNavigator;
    });
  });

  describe('getViewportInfo', () => {
    it('should collect viewport information', () => {
      const info = SystemInfoService.getViewportInfo();
      
      expect(info).toHaveProperty('viewport');
      expect(info).toHaveProperty('screen');
      expect(info.viewport).toHaveProperty('width');
      expect(info.viewport).toHaveProperty('height');
      expect(info.screen).toHaveProperty('width');
      expect(info.screen).toHaveProperty('height');
      
      expect(typeof info.viewport.width).toBe('number');
      expect(typeof info.viewport.height).toBe('number');
      expect(typeof info.screen.width).toBe('number');
      expect(typeof info.screen.height).toBe('number');
    });

    it('should include device pixel ratio', () => {
      const info = SystemInfoService.getViewportInfo();
      
      expect(info).toHaveProperty('devicePixelRatio');
      expect(typeof info.devicePixelRatio).toBe('number');
    });
  });

  describe('getPerformanceInfo', () => {
    it('should collect performance metrics when available', () => {
      const info = SystemInfoService.getPerformanceInfo();
      
      expect(info).toHaveProperty('loadTime');
      expect(info).toHaveProperty('domContentLoaded');
      expect(info).toHaveProperty('navigationType');
      expect(info).toHaveProperty('redirectCount');
    });

    it('should handle missing performance API gracefully', () => {
      const originalPerformance = global.performance;
      
      // Mock performance with missing timing
      global.performance = {
        getEntriesByType: vi.fn(() => [])
      };
      
      const info = SystemInfoService.getPerformanceInfo();
      
      expect(info).toHaveProperty('error');
      
      global.performance = originalPerformance;
    });
  });

  describe('getStorageInfo', () => {
    it('should check localStorage availability', () => {
      const info = SystemInfoService.getStorageInfo();
      
      expect(info).toHaveProperty('localStorage');
      expect(info.localStorage).toHaveProperty('available');
      expect(typeof info.localStorage.available).toBe('boolean');
    });

    it('should check sessionStorage availability', () => {
      const info = SystemInfoService.getStorageInfo();
      
      expect(info).toHaveProperty('sessionStorage');
      expect(info.sessionStorage).toHaveProperty('available');
      expect(typeof info.sessionStorage.available).toBe('boolean');
    });

    it('should handle storage access errors', () => {
      const originalLocalStorage = global.localStorage;
      
      // Mock localStorage that throws on access
      Object.defineProperty(global, 'localStorage', {
        value: {
          get length() { throw new Error('Access denied'); }
        },
        writable: true
      });
      
      const info = SystemInfoService.getStorageInfo();
      
      expect(info.localStorage.available).toBe(false);
      
      global.localStorage = originalLocalStorage;
    });
  });

  describe('isStorageAvailable', () => {
    it('should detect working localStorage', () => {
      const available = SystemInfoService.isStorageAvailable('localStorage');
      expect(typeof available).toBe('boolean');
    });

    it('should detect working sessionStorage', () => {
      const available = SystemInfoService.isStorageAvailable('sessionStorage');
      expect(typeof available).toBe('boolean');
    });

    it('should return false for non-existent storage type', () => {
      const available = SystemInfoService.isStorageAvailable('nonExistentStorage');
      expect(available).toBe(false);
    });
  });

  describe('estimateStorageSize', () => {
    it('should estimate localStorage size', () => {
      // Add some test data
      localStorage.setItem('test-key', 'test-value');
      
      const size = SystemInfoService.estimateStorageSize('localStorage');
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
      
      // Clean up
      localStorage.removeItem('test-key');
    });

    it('should return 0 for empty storage', () => {
      const size = SystemInfoService.estimateStorageSize('sessionStorage');
      expect(size).toBeGreaterThanOrEqual(0);
    });

    it('should handle storage access errors', () => {
      const size = SystemInfoService.estimateStorageSize('nonExistentStorage');
      expect(size).toBe(0);
    });
  });

  describe('getUrlInfo', () => {
    it('should collect URL information', () => {
      const info = SystemInfoService.getUrlInfo();
      
      expect(info).toHaveProperty('href');
      expect(info).toHaveProperty('protocol');
      expect(info).toHaveProperty('host');
      expect(info).toHaveProperty('pathname');
      expect(info).toHaveProperty('search');
      expect(info).toHaveProperty('hash');
      
      expect(typeof info.href).toBe('string');
      expect(typeof info.protocol).toBe('string');
    });
  });

  describe('getDOMInfo', () => {
    it('should collect DOM statistics', () => {
      const info = SystemInfoService.getDOMInfo();
      
      expect(info).toHaveProperty('documentReadyState');
      expect(info).toHaveProperty('elementCount');
      expect(info).toHaveProperty('scriptCount');
      expect(info).toHaveProperty('styleSheetCount');
      
      expect(typeof info.elementCount).toBe('number');
      expect(typeof info.scriptCount).toBe('number');
      expect(typeof info.styleSheetCount).toBe('number');
    });
  });

  describe('getSafeLocalStorageSnapshot', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should create safe snapshot of localStorage', () => {
      localStorage.setItem('safe-key', 'safe-value');
      localStorage.setItem('auth-token', 'secret-value');
      
      const snapshot = SystemInfoService.getSafeLocalStorageSnapshot();
      
      expect(snapshot).toHaveProperty('safe-key');
      expect(snapshot).not.toHaveProperty('auth-token');
      expect(snapshot['safe-key']).toBe('safe-value');
      
      localStorage.clear();
    });

    it('should truncate long values', () => {
      const longValue = 'x'.repeat(200);
      localStorage.setItem('long-key', longValue);
      
      const snapshot = SystemInfoService.getSafeLocalStorageSnapshot();
      
      expect(snapshot['long-key']).toContain('...');
      expect(snapshot['long-key'].length).toBeLessThan(longValue.length);
      
      localStorage.clear();
    });

    it('should handle localStorage access errors', () => {
      const originalLength = localStorage.length;
      
      Object.defineProperty(localStorage, 'length', {
        get() { throw new Error('Access denied'); }
      });
      
      const snapshot = SystemInfoService.getSafeLocalStorageSnapshot();
      
      expect(snapshot).toHaveProperty('error');
      
      Object.defineProperty(localStorage, 'length', {
        get() { return originalLength; }
      });
    });
  });

  describe('collectSystemInfo', () => {
    it('should collect comprehensive system information', async () => {
      const systemInfo = await SystemInfoService.collectSystemInfo();
      
      expect(systemInfo).toHaveProperty('timestamp');
      expect(systemInfo).toHaveProperty('browser');
      expect(systemInfo).toHaveProperty('viewport');
      expect(systemInfo).toHaveProperty('performance');
      expect(systemInfo).toHaveProperty('storage');
      expect(systemInfo).toHaveProperty('network');
      expect(systemInfo).toHaveProperty('url');
      expect(systemInfo).toHaveProperty('userAgent');
      
      expect(typeof systemInfo.timestamp).toBe('string');
      expect(typeof systemInfo.userAgent).toBe('string');
    });

    it('should return fallback data on error', async () => {
      // Mock getBrowserInfo to throw error
      vi.spyOn(SystemInfoService, 'getBrowserInfo').mockImplementation(() => {
        throw new Error('Collection failed');
      });
      
      const systemInfo = await SystemInfoService.collectSystemInfo();
      
      expect(systemInfo).toHaveProperty('error');
      expect(systemInfo).toHaveProperty('timestamp');
      expect(systemInfo).toHaveProperty('browser');
      
      SystemInfoService.getBrowserInfo.mockRestore();
    });
  });

  describe('getFallbackSystemInfo', () => {
    it('should provide minimal fallback information', () => {
      const fallback = SystemInfoService.getFallbackSystemInfo();
      
      expect(fallback).toHaveProperty('timestamp');
      expect(fallback).toHaveProperty('browser');
      expect(fallback).toHaveProperty('viewport');
      expect(fallback).toHaveProperty('url');
      expect(fallback).toHaveProperty('error');
      
      expect(typeof fallback.timestamp).toBe('string');
      expect(typeof fallback.error).toBe('string');
    });
  });
});