// LifeOS sandbox host. The imported games are Apache-2.0; see LICENSE/NOTICE.
import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { createGameClock } from './clock';
import { setGameTranslations } from './text';
import Snake from './snake';
import Breakout from './breakout';
import Runner from './runner';
import Jelly from './jelly';
import Pong from './pong';
import Space from './space';
import Merge from './2048';
import Match from './match3';
import Mines from './mines';
import Slide from './slide';
import Sokoban from './sokoban';
import Lights from './lights';
import Colors from './colors';
import Hanoi from './hanoi';
import Memory from './memory';
import Four from './four';
import Reversi from './reversi';
import Towers from './towers';
import Basket from './basket';
import Archery from './archery';

const games = { snake:Snake, breakout:Breakout, runner:Runner, jelly:Jelly, pong:Pong, space:Space, '2048':Merge, match3:Match, mines:Mines, slide:Slide, sokoban:Sokoban, lights:Lights, colors:Colors, hanoi:Hanoi, memory:Memory, four:Four, reversi:Reversi, towers:Towers, basket:Basket, archery:Archery };
const id = new URLSearchParams(location.search).get('game');
const token = location.hash.slice(1);
// Capacitor on iOS may use an opaque custom-scheme origin.
const hostOrigin = /^https?:\/\//.test(location.origin) ? location.origin : null;
const native = { setTimeout:window.setTimeout.bind(window), clearTimeout:window.clearTimeout.bind(window) };
const clock = createGameClock(native, () => performance.now());
window.setTimeout = clock.setTimeout;
window.setInterval = clock.setInterval;
window.clearTimeout = clock.clearTimeout;
window.clearInterval = clock.clearInterval;
window.requestAnimationFrame = callback => clock.setTimeout(() => callback(clock.now()),16);
window.cancelAnimationFrame = clock.clearTimeout;
const epoch = Date.now();
Date.now = () => Math.round(epoch + clock.now());
let root, finished = false, initialized = false;
const pressed = new Set();
window.addEventListener('keydown',event=>{
  if(document.documentElement.dataset.paused==='true'){event.preventDefault();event.stopImmediatePropagation();return;}
  pressed.add(event.key);
},true);
window.addEventListener('keyup',event=>pressed.delete(event.key),true);
const send = (type, data = {}) => parent.postMessage({ scope:'lifeos-game', token, type, ...data }, hostOrigin || '*');
function pause(value) {
  if(value)for(const key of pressed)window.dispatchEvent(new KeyboardEvent('keyup',{key}));
  document.documentElement.dataset.paused = String(value);
  if (value) clock.pause(); else if (!finished) clock.resume();
}
const complete = value => {
  if (finished) return;
  const score = Number(typeof value === 'object' ? value?.score : value);
  if (!Number.isFinite(score)) return;
  finished = true;
  pause(true);
  send('complete', { score:Math.max(0,Math.min(100,Math.round(score))) });
};
function fit() {
  const element=document.getElementById('game');
  const scale=Math.min(1,innerWidth/360);
  element.style.width='360px';
  element.style.transformOrigin='top left';
  element.style.transform=`scale(${scale})`;
  element.style.marginLeft=`${Math.max(0,(innerWidth-360*scale)/2)}px`;
}
window.addEventListener('resize',fit);
fit();
class Boundary extends Component {
  state = { failed:false };
  static getDerivedStateFromError() { return { failed:true }; }
  componentDidCatch() { pause(true); send('error'); }
  render() { return this.state.failed ? null : this.props.children; }
}
window.addEventListener('message', event => {
  if (event.source !== parent || (hostOrigin && event.origin !== hostOrigin) || event.data?.scope !== 'lifeos-game' || event.data?.token !== token) return;
  const { type, translations, paused } = event.data;
  if (type === 'init' && Object.hasOwn(games,id)) {
    setGameTranslations(translations);
    document.documentElement.lang = event.data.locale || 'tr';
    if (!initialized) {
      root = createRoot(document.getElementById('game'));
      initialized = true;
    }
    const Game = games[id];
    // A dedicated root prevents unrelated LifeOS renders from restarting games.
    root.render(<Boundary><Game onComplete={complete} /></Boundary>);
    pause(Boolean(paused));
    send('ready');
  } else if (type === 'pause') pause(true);
  else if (type === 'resume') pause(false);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { pause(true); send('paused'); }
});
window.addEventListener('pagehide', () => clock.dispose());
window.addEventListener('error', () => { pause(true); send('error'); });
window.addEventListener('unhandledrejection', () => { pause(true); send('error'); });
send('boot');
