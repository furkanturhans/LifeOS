'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { useThemeStore } from '@/stores/useThemeStore';

function applyPlatformClasses() {
  const root = document.documentElement;
  root.classList.add('capacitor-native');

  const platform = Capacitor.getPlatform();
  if (platform === 'android') {
    root.classList.add('platform-android');
  } else if (platform === 'ios') {
    root.classList.add('platform-ios');
  }
}

async function initNativeShell(resolvedTheme: 'light' | 'dark') {
  applyPlatformClasses();

  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({
      style: resolvedTheme === 'dark' ? Style.Dark : Style.Light,
    });
  } catch {
    // StatusBar plugin may be unavailable in browser preview
  }

  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    await Keyboard.setScroll({ isDisabled: false });
  } catch {
    // Keyboard plugin may be unavailable in browser preview
  }

  try {
    await SplashScreen.hide();
  } catch {
    // SplashScreen plugin may be unavailable in browser preview
  }
}

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void initNativeShell(resolvedTheme);
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    void StatusBar.setStyle({
      style: resolvedTheme === 'dark' ? Style.Dark : Style.Light,
    }).catch(() => undefined);
  }, [resolvedTheme]);

  return <>{children}</>;
}
