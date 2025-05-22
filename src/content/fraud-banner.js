console.log("Fraud Detector Banner - Minimal Modern loaded");

class FraudDetectorBanner {
  constructor() {
    this.processedEmails = new Set();
    this.init();
  }

  init() {
    // Wait for Gmail to load, then start monitoring
    setTimeout(() => {
      this.scanForEmails();
      this.observeNewEmails();
    }, 2000);
  }

  observeNewEmails() {
    const observer = new MutationObserver(() => {
      this.scanForEmails();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanForEmails() {
    // Look for opened email conversations
    const emailContainers = document.querySelectorAll("[data-message-id]");
    
    emailContainers.forEach(container => {
      const messageId = container.getAttribute("data-message-id");
      
      if (!this.processedEmails.has(messageId)) {
        this.addFraudBanner(container);
        this.processedEmails.add(messageId);
      }
    });
  }

  addFraudBanner(emailContainer) {
    // Check if banner already exists
    if (emailContainer.querySelector(".fraud-detector-banner")) {
      return;
    }

    // Find where to insert - after sender info, before email content
    const insertPoint = this.findInsertionPoint(emailContainer);
    
    if (insertPoint) {
      const banner = this.createMinimalModernBanner();
      insertPoint.insertBefore(banner, insertPoint.firstChild);
    }
  }

  findInsertionPoint(emailContainer) {
    // Look for the email content area where we want to insert the banner
    return emailContainer.querySelector(".ii.gt") || emailContainer;
  }

  createMinimalModernBanner() {
    const banner = document.createElement("div");
    banner.className = "fraud-detector-banner";
    
    // Create header
    const header = document.createElement("div");
    header.className = "fraud-header";
    
    // Create left section
    const left = document.createElement("div");
    left.className = "fraud-left";
    
    // Create shield icon
    const icon = document.createElement("img");
    icon.className = "fraud-icon";
    icon.src = chrome.runtime.getURL("src/assets/icons/icon128.png");
    icon.alt = "Shield";
    
    const title = document.createElement("span");
    title.className = "fraud-title";
    title.textContent = "Fraud Detected";
    
    const hint = document.createElement("span");
    hint.className = "fraud-expand-hint";
    hint.textContent = "Click to view details";
    
    left.appendChild(icon);
    left.appendChild(title);
    left.appendChild(hint);
    
    // Create score
    const score = document.createElement("div");
    score.className = "fraud-score";
    score.textContent = "Risk: 95/100";
    
    header.appendChild(left);
    header.appendChild(score);
    
    // Create expandable content
    const content = document.createElement("div");
    content.className = "fraud-content";
    
    // Create reasons list
    const reasons = document.createElement("ul");
    reasons.className = "fraud-reasons";
    
    const reasonsList = [
      "TESTING MODE: All emails flagged as fraud",
      "Local AI analysis detected suspicious patterns",
      "Potential phishing attempt identified",
      "Sender verification failed"
    ];
    
    reasonsList.forEach(reason => {
      const item = document.createElement("li");
      item.textContent = reason;
      reasons.appendChild(item);
    });
    
    // Create buttons
    const buttons = document.createElement("div");
    buttons.className = "fraud-buttons";
    
    const reportBtn = document.createElement("button");
    reportBtn.className = "fraud-btn fraud-btn-report";
    reportBtn.textContent = "Report";
    
    const dismissBtn = document.createElement("button");
    dismissBtn.className = "fraud-btn fraud-btn-dismiss";
    dismissBtn.textContent = "Dismiss";
    
    buttons.appendChild(reportBtn);
    buttons.appendChild(dismissBtn);
    
    content.appendChild(reasons);
    content.appendChild(buttons);
    
    banner.appendChild(header);
    banner.appendChild(content);
    
    // Add click to expand functionality
    banner.addEventListener("click", (e) => {
      // Dont toggle if click is on buttons
      if (e.target.classList.contains("fraud-btn")) {
        return;
      }
      
      banner.classList.toggle("expanded");
      const hint = banner.querySelector(".fraud-expand-hint");
      
      if (banner.classList.contains("expanded")) {
        if (hint) hint.style.display = "none";
      } else {
        if (hint) hint.style.display = "inline";
      }
    });
    
    // Button event listeners
    reportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Reporting fraud...");
      // TODO: Implement reporting
    });
    
    dismissBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      banner.remove();
    });
    
    return banner;
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new FraudDetectorBanner());
} else {
  new FraudDetectorBanner();
}
