import { EventEmitter } from 'events';

// Lightweight in-memory event bus for SSE-style fan-out
const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export const EVENTS = {
  NOTIFICATION: 'notification',
  MESSAGE: 'message'
};

export function emitRealtimeEvent(event, payload) {
  emitter.emit(event, payload);
}

export function subscribe(event, handler) {
  emitter.on(event, handler);
  return () => emitter.off(event, handler);
}

export default emitter;
