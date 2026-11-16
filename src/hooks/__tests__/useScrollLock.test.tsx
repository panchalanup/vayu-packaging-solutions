import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { lockScroll, unlockScroll, useScrollLock } from '../useScrollLock';

describe('scroll lock', () => {
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    Object.defineProperty(window, 'scrollY', { value: 640, configurable: true });
    document.body.removeAttribute('style');
    document.documentElement.removeAttribute('style');
  });

  afterEach(() => {
    // leave nothing locked for the next test
    while (document.body.hasAttribute('data-scroll-locked')) unlockScroll();
  });

  it('pins the body where the page was, so nothing jumps, and marks it locked', () => {
    lockScroll();
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-640px');
    expect(document.body.style.width).toBe('100%');
    expect(document.body.getAttribute('data-scroll-locked')).toBe('1');
    unlockScroll();
  });

  it('restores the styles and the scroll position, instantly, when released', () => {
    document.documentElement.style.scrollBehavior = 'smooth';
    document.body.style.paddingRight = '3px';
    lockScroll();
    unlockScroll();
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
    expect(document.body.style.paddingRight).toBe('3px');
    expect(document.body.hasAttribute('data-scroll-locked')).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith(0, 640);
    // the site's smooth scrolling is back afterwards
    expect(document.documentElement.style.scrollBehavior).toBe('smooth');
  });

  it('is reference counted: the page stays locked until the last lock is released', () => {
    lockScroll();
    lockScroll();
    unlockScroll();
    expect(document.body.style.position).toBe('fixed');
    expect(scrollTo).not.toHaveBeenCalled();
    unlockScroll();
    expect(document.body.style.position).toBe('');
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it('ignores a release with nothing locked', () => {
    unlockScroll();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('the hook locks while true and releases when it turns false or unmounts', () => {
    const { rerender, unmount } = renderHook(({ on }) => useScrollLock(on), { initialProps: { on: false } });
    expect(document.body.style.position).toBe('');
    rerender({ on: true });
    expect(document.body.style.position).toBe('fixed');
    rerender({ on: false });
    expect(document.body.style.position).toBe('');
    rerender({ on: true });
    unmount();
    expect(document.body.style.position).toBe('');
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });
});
