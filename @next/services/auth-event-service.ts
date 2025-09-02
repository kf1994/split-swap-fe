export enum AuthEventType {
  UNAUTHORIZED = "UNAUTHORIZED"
}

class AuthEventEmitter {
  private listeners: Record<string, Array<() => void>> = {}

  public subscribe(event: AuthEventType, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
    return () => {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }

  public emit(event: AuthEventType) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback())
    }
  }
}

export const authEventService = new AuthEventEmitter()
