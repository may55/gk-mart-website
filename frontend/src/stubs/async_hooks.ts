// Stub for async_hooks in browser environment
export class AsyncLocalStorage {
  constructor() {
    // Browser stub - no-op implementation
  }

  run(store, callback) {
    return callback();
  }

  getStore() {
    return undefined;
  }

  enterWith(store) {
    // Browser stub - no-op
  }
}

export default {
  AsyncLocalStorage,
};
