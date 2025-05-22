/**
 * Main Fraud Shield Coordinator - Initializes everything
 */
console.log("Fraud Shield - Main coordinator loaded");

class FraudShield {
  constructor() {
    this.baseScanner = new BaseScanner();
    this.activePlatform = null;
    this.init();
  }

  async init() {
    await this.baseScanner.initialize();
    this.detectAndInitializePlatform();
  }

  detectAndInitializePlatform() {
    // Initialize Gmail platform
    const gmailPlatform = new GmailPlatform(this.baseScanner);
    this.baseScanner.registerPlatform("gmail", gmailPlatform);
    
    // Initialize Universal platform
    const universalPlatform = new UniversalPlatform(this.baseScanner);
    this.baseScanner.registerPlatform("universal", universalPlatform);
    
    // Determine active platform and initialize
    if (gmailPlatform.isActive()) {
      this.activePlatform = gmailPlatform;
      console.log("Fraud Shield - Gmail platform detected");
    } else {
      this.activePlatform = universalPlatform;
      console.log("Fraud Shield - Universal platform detected");
    }
    
    this.activePlatform.initialize();
  }

  reinitialize() {
    if (this.activePlatform) {
      this.activePlatform.reinitialize();
    }
  }
}

// Initialize Fraud Shield
new FraudShield();
