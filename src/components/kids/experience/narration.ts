'use client';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { useKidsStore } from '@/stores/useKidsStore';
export function useNarration() {
  const locale = useThemeStore(s => s.locale);
  const sound = useKidsStore(s => s.soundEnabled);
  const settings = useKidsStore(s => s.voiceSettings);
  const [speaking, setSpeaking] = useState(false);
  const [notice, setNotice] = useState('');
  const serial = useRef(0);
  const stop = () => { serial.current++; if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setSpeaking(false); setNotice(''); };
  const cancelForSettings = useEffectEvent(() => { stop(); });
  useEffect(() => {
    const hide = () => { if (document.hidden) { serial.current++; window.speechSynthesis?.cancel(); setSpeaking(false); } };
    document.addEventListener('visibilitychange', hide);
    const epoch = serial;
    return () => { epoch.current++; window.speechSynthesis?.cancel(); document.removeEventListener('visibilitychange', hide); };
  }, []);
  useEffect(() => {
    const unsubscribeKids = useKidsStore.subscribe((next, previous) => {
      if (next.soundEnabled !== previous.soundEnabled || next.voiceSettings !== previous.voiceSettings) cancelForSettings();
    });
    const unsubscribeLocale = useThemeStore.subscribe((next, previous) => {
      if (next.locale !== previous.locale) cancelForSettings();
    });
    return () => { unsubscribeKids(); unsubscribeLocale(); };
  }, []);
  const play = (text: string, type: 'study' | 'story') => {
    stop(); setNotice('');
    if (!sound || settings.isVoiceEnabled === false || (type === 'story' && !settings.storyNarrationEnabled)) { setNotice('Ses ayarlardan kapalı.'); return; }
    if (!('speechSynthesis' in window)) { setNotice('Bu cihazda sesli anlatım desteklenmiyor. Metni birlikte okuyabilirsiniz.'); return; }
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.split('-')[0] === locale.split('-')[0] && v.localService);
    if (!voice) { setNotice('Seçili dilde cihaz sesi bulunamadı. Metni birlikte okuyabilirsiniz.'); return; }
    const request = serial.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice; utterance.lang = voice.lang;
    utterance.rate = settings.speed === 'slow' ? .7 : settings.speed === 'fast' ? 1 : .85;
    utterance.volume = settings.volume;
    utterance.onstart = () => { if (serial.current === request) setSpeaking(true); };
    utterance.onend = () => { if (serial.current === request) setSpeaking(false); };
    utterance.onerror = () => { if (serial.current === request) { setSpeaking(false); setNotice('Ses oynatılamadı. Yeniden deneyebilirsiniz.'); } };
    window.speechSynthesis.speak(utterance);
  };
  return { play, stop, speaking, notice };
}

