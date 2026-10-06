import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectPerfTier, parseTierOverride, TIER_SETTINGS } from '../perfTier';
import { isWebGLAvailable, resetWebGLSupportCache } from '../webglSupport';

describe('detectPerfTier', () => {
  it('drops software renderers to low', () => {
    expect(detectPerfTier({ renderer: 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))' })).toBe('low');
    expect(detectPerfTier({ renderer: 'llvmpipe (LLVM 15.0.7, 256 bits)' })).toBe('low');
  });

  it('puts phones on medium', () => {
    expect(detectPerfTier({ isMobile: true })).toBe('medium');
  });

  it('handles constrained desktops', () => {
    expect(detectPerfTier({ deviceMemory: 2 })).toBe('low');
    expect(detectPerfTier({ deviceMemory: 4 })).toBe('medium');
    expect(detectPerfTier({ hardwareConcurrency: 4 })).toBe('medium');
  });

  it('defaults to high when nothing is known', () => {
    expect(detectPerfTier({})).toBe('high');
    expect(detectPerfTier({ renderer: 'NVIDIA GeForce RTX 3060', deviceMemory: 8, hardwareConcurrency: 12 })).toBe('high');
  });

  it('keeps tier settings ordered by cost', () => {
    expect(TIER_SETTINGS.high.maxDpr).toBeGreaterThan(TIER_SETTINGS.medium.maxDpr);
    expect(TIER_SETTINGS.medium.maxDpr).toBeGreaterThan(TIER_SETTINGS.low.maxDpr);
    expect(TIER_SETTINGS.low.shadows).toBe(false);
  });
});

describe('parseTierOverride', () => {
  it('accepts only known values', () => {
    expect(parseTierOverride('?quality=high')).toBe('high');
    expect(parseTierOverride('?quality=low&x=1')).toBe('low');
    expect(parseTierOverride('?quality=ultra')).toBeNull();
    expect(parseTierOverride('?quality=<script>')).toBeNull();
    expect(parseTierOverride('')).toBeNull();
  });
});

describe('isWebGLAvailable', () => {
  beforeEach(() => resetWebGLSupportCache());
  afterEach(() => vi.restoreAllMocks());

  it('returns false (without throwing) when no context can be created', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    expect(isWebGLAvailable()).toBe(false);
  });

  it('returns false when context creation throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(isWebGLAvailable()).toBe(false);
  });

  it('returns true and releases the probe context when WebGL works', () => {
    const loseContext = vi.fn();
    const fakeGl = { getExtension: vi.fn(() => ({ loseContext })) };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeGl as never);
    expect(isWebGLAvailable()).toBe(true);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it('memoises the result', () => {
    const spy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    isWebGLAvailable();
    const callsAfterFirstProbe = spy.mock.calls.length; // webgl2 then webgl
    isWebGLAvailable();
    expect(spy.mock.calls.length).toBe(callsAfterFirstProbe);
  });
});
