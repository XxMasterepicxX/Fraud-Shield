console.log("Fraud Shield Background loaded");

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
    
    return true;
  }
});

console.log("Mock AI Fraud Detector ready");
