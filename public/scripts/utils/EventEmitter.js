export default class EventEmitter {
  constructor() {
    this.events = new Map();
    this.wrappers = new Map();
  }

  onEvent(eventName, listener) {
    const event = this.events.get(eventName);
    if (event) event.add(listener);
    else this.events.set(eventName, new Set([listener]));
  }

  onEventOnce(eventName, listener) {
    const wrapper = (...args) => {
      this.removeEventListener(eventName, wrapper);
      listener(...args);
    };
    this.wrappers.set(listener, wrapper);
    this.onEvent(eventName, wrapper);
  }

  onEventFirst(eventName, listener) {
    this.events.set(
      eventName,
      new Set([listener, ...this.eventListeners(eventName)]),
    );
  }

  onEventBefore(eventName, listener, nextListener) {
    const listeners = [...this.eventListeners(eventName)];
    const nextListenerIndex = listeners.indexOf(nextListener);
    const listenersBefore = listeners.slice(0, nextListenerIndex);
    const listenersAfter = listeners.slice(nextListenerIndex);
    this.events.set(
      eventName,
      new Set([...listenersBefore, listener, ...listenersAfter]),
    );
  }

  emitEvent(eventName, ...args) {
    const event = this.events.get(eventName);
    if (!event) return;
    event.forEach((listener) => listener(...args));
  }

  eventNames() {
    return [...this.events.keys()];
  }

  eventListeners(eventName) {
    const event = this.events.get(eventName);
    return event ? new Set(event) : new Set();
  }

  eventListenersCount(eventName) {
    const event = this.events.get(eventName);
    return event ? event.size : 0;
  }

  removeEventListener(eventName, listener) {
    const event = this.events.get(eventName);
    if (!event) return;

    if (event.has(listener)) event.delete(listener);

    const wrapper = this.wrappers.get(listener);
    if (wrapper) event.delete(wrapper);

    if (event.size === 0) this.clear(eventName);
  }

  clear(eventName) {
    if (eventName) this.events.delete(eventName);
    else this.events.clear();
  }
}
