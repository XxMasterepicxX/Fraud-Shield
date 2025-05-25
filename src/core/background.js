console.log("Fraud Shield Background loaded");

// Check for environment variables
chrome.runtime.onInstalled.addListener(() => {
  console.log("Fraud Shield installed/updated");
  
  // Initialize default settings if not already set
  chrome.storage.sync.get(['protectionEnabled'], function(result) {
    if (result.protectionEnabled === undefined) {
      chrome.storage.sync.set({protectionEnabled: true});
    }
  });
  
  // Check for Mistral API key
  chrome.storage.local.get(['mistralApiKey'], function(result) {
    if (result.mistralApiKey) {
      console.log("Mistral API key found");
    } else {
      console.log("No Mistral API key configured - AI features will use fallback mode");
    }
  });
});

class MockFraudDetector {
  async analyzeFraud(text, platform) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const suspiciousPatterns = [
      /urgent.*action.*required/i,
      /verify.*account.*immediately/i,
      /congratulations.*you.*won/i,
      /click.*here.*now/i,
      /limited.*time.*offer/i,
      /suspended.*account/i,
      /bitcoin|crypto|investment/i,
      /prince.*nigeria/i
    ];
    
    let score = 0;
    const detectedReasons = [];
    
    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(text)) {
        score += 25;
        detectedReasons.push(this.getReasonForPattern(index));
      }
    });
    
    // Random additional detection
    if (Math.random() > 0.8) {
      score += 30;
      detectedReasons.push("AI detected suspicious patterns");
    }
    
    score = Math.min(score, 95);
    
    return {
      isFraud: score > 40,
      score: score,
      reasons: detectedReasons.length > 0 ? detectedReasons : ["Suspicious content detected"],
      platform: platform
    };
  }
  
  getReasonForPattern(index) {
    const reasons = [
      "Urgent action request detected",
      "Account verification phishing",
      "Lottery scam pattern",
      "Suspicious call-to-action",
      "Limited time pressure",
      "Account suspension threat",
      "Cryptocurrency scam",
      "Advance fee fraud"
    ];
    return reasons[index] || "Suspicious content";
  }
}

const fraudDetector = new MockFraudDetector();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzeFraud") {
    fraudDetector.analyzeFraud(message.text, message.platform)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error("Analysis error:", error);
        sendResponse({ isFraud: false, score: 0, reasons: ["Analysis failed"] });
      });
    
    return true; // Keep the message channel open for async response
  }
    // Handle .env file equivalent for API keys
  if (message.action === "getEnvironmentVariable") {
    chrome.storage.local.get([message.name], function(result) {
      sendResponse({ value: result[message.name] || null });
    });
    return true; // Keep the message channel open for async response
  }
  
  // Handle Mistral API key checks
  if (message.action === "checkMistralKey") {
    chrome.storage.local.get(['mistralApiKey'], function(result) {
      sendResponse({
        keyConfigured: !!result.mistralApiKey
      });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (message.action === "reloadMistralConfig") {
    // Broadcast to any tabs that Mistral config has changed
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(tab => {
        try {
          chrome.tabs.sendMessage(tab.id, { 
            action: "mistralConfigUpdated"
          });
        } catch (e) {
          // Ignore errors for inactive tabs
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }
});

console.log("Fraud Shield background service ready");
