/**
 * Locks page scrolling while a menu or dialog is open.
 *
 * `overflow: hidden` on <body> is not enough on iOS Safari (the page still rubber-bands under a touch), so the body is
 * pinned instead: position fixed with a negative `top` equal to the current scroll offset, which keeps the page
 * visually where it was, and the offset is restored when the lock is released. Reference counted, so two locks at once
 * (a menu and a dialog) release in the right order. Sets `data-scroll-locked` like Radix does, which the site's smooth
 * scroll already watches.
 */

import { useEffect } from 'react';

interface Saved {
  y: number;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  paddingRight: string;
  scrollBehavior: string;
}

let locks = 0;
let saved: Saved | null = null;

export function lockScroll(): void {
  if (typeof document === 'undefined') return;
  if (locks++ > 0) return;
  const { body, documentElement: html } = document;
  const scrollbar = window.innerWidth - html.clientWidth;
  saved = {
    y: window.scrollY,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    paddingRight: body.style.paddingRight,
    scrollBehavior: html.style.scrollBehavior,
  };
  body.style.position = 'fixed';
  body.style.top = `-${saved.y}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  // a desktop scrollbar disappearing would shift the page sideways; replace its width
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  body.setAttribute('data-scroll-locked', '1');
}

export function unlockScroll(): void {
  if (typeof document === 'undefined' || locks === 0) return;
  if (--locks > 0 || !saved) return;
  const { body, documentElement: html } = document;
  const s = saved;
  saved = null;
  body.style.position = s.position;
  body.style.top = s.top;
  body.style.left = s.left;
  body.style.right = s.right;
  body.style.width = s.width;
  body.style.paddingRight = s.paddingRight;
  body.removeAttribute('data-scroll-locked');
  // put the page back exactly where it was, without the site's smooth-scroll animating the jump
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, s.y);
  html.style.scrollBehavior = s.scrollBehavior;
}

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    lockScroll();
    return unlockScroll;
  }, [locked]);
}
