/**
 * Base Scanner Class - Core functionality without platform specifics
 */
class BaseScanner {
  constructor() {
    this.scannedElements = new WeakSet();
    this.observers = new Map();
    this.protectionEnabled = true;
    this.platforms = new Map();
  }

  async initialize() {
    await this.loadSettings();
    this.setupMessageListener();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['protectionEnabled'], (result) => {
        this.protectionEnabled = result.protectionEnabled !== false;
        resolve();
      });
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "toggleProtection") {
        this.protectionEnabled = message.enabled;
        this.handleProtectionToggle();
      } else if (message.action === "scanCurrentPage") {
        this.triggerManualScan();
      }
    });
  }

  triggerManualScan() {
    // Get active platform and trigger its scan
    for (const [name, platform] of this.platforms) {
      if (platform.isActive() && platform.scanCurrentPage) {
        platform.scanCurrentPage();
        break;
      }
    }
  }

  handleProtectionToggle() {
    if (!this.protectionEnabled) {
      this.removeAllWarnings();
    } else {
      this.reinitialize();
    }
  }

  removeAllWarnings() {
    document.querySelectorAll(".fraudshield-warning, .fraud-universal-warning, .fraud-discord-warning").forEach(el => {
      el.remove();
    });
  }

  registerPlatform(name, platformInstance) {
    this.platforms.set(name, platformInstance);
  }

  getPlatform(name) {
    return this.platforms.get(name);
  }

  createObserver(callback, options = {}) {
    const observer = new MutationObserver(callback);
    const observerOptions = {
      childList: true,
      subtree: true,
      ...options
    };
    observer.observe(document.body, observerOptions);
    return observer;
  }

  cleanupObserver(observer) {
    if (observer) {
      observer.disconnect();
    }
  }
}

// Make available globally
window.BaseScanner = BaseScanner;
