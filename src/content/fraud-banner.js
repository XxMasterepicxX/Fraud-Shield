console.log("Fraud Detector Banner - Integrated Layout loaded");

class FraudDetectorBanner {
  constructor() {
    this.processedEmails = new Set();
    this.init();
  }

  init() {
    setTimeout(() => {
      this.scanForEmails();
      this.observeNewEmails();
    }, 1500); // Reduced timeout for faster loading
  }

  observeNewEmails() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              node.hasAttribute && node.hasAttribute("data-message-id")) {
            this.addFraudBanner(node);
            this.processedEmails.add(node.getAttribute("data-message-id"));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanForEmails() {
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
    if (emailContainer.querySelector(".fraud-detector-banner")) {
      return;
    }

    // Insert banner at the natural top of email content
    const emailContent = emailContainer.querySelector(".ii.gt");
    if (emailContent) {
      const banner = this.createIntegratedBanner();
      emailContent.insertBefore(banner, emailContent.firstChild);
    }
  }

  createIntegratedBanner() {
    const banner = document.createElement("div");
    banner.className = "fraud-detector-banner";
    
    const header = document.createElement("div");
    header.className = "fraud-header";
    
    const left = document.createElement("div");
    left.className = "fraud-left";
    
    const icon = document.createElement("img");
    icon.className = "fraud-icon";
    icon.src = chrome.runtime.getURL("src/assets/icons/icon128.png");
    icon.alt = "Shield";
    
    const title = document.createElement("span");
    title.className = "fraud-title";
    title.textContent = "FRAUD DETECTED";
    
    const hint = document.createElement("span");
    hint.className = "fraud-expand-hint";
    hint.textContent = "Click to view details";
    
    left.appendChild(icon);
    left.appendChild(title);
    left.appendChild(hint);
    
    const score = document.createElement("div");
    score.className = "fraud-score";
    score.textContent = "RISK: 95/100";
    
    header.appendChild(left);
    header.appendChild(score);
    
    const content = document.createElement("div");
    content.className = "fraud-content";
    
    const reasons = document.createElement("ul");
    reasons.className = "fraud-reasons";
    
    [
      "TESTING MODE: All emails flagged as fraud",
      "Local AI analysis detected suspicious patterns", 
      "Potential phishing attempt identified",
      "Sender verification failed"
    ].forEach(reason => {
      const item = document.createElement("li");
      item.textContent = reason;
      reasons.appendChild(item);
    });
    
    const buttons = document.createElement("div");
    buttons.className = "fraud-buttons";
    
    const reportBtn = document.createElement("button");
    reportBtn.className = "fraud-btn fraud-btn-report";
    reportBtn.textContent = "REPORT FRAUD";
    
    const dismissBtn = document.createElement("button");
    dismissBtn.className = "fraud-btn fraud-btn-dismiss";
    dismissBtn.textContent = "DISMISS";
    
    buttons.appendChild(reportBtn);
    buttons.appendChild(dismissBtn);
    
    content.appendChild(reasons);
    content.appendChild(buttons);
    
    banner.appendChild(header);
    banner.appendChild(content);
    
    banner.addEventListener("click", (e) => {
      if (e.target.classList.contains("fraud-btn")) return;
      
      banner.classList.toggle("expanded");
      const hint = banner.querySelector(".fraud-expand-hint");
      if (hint) {
        hint.style.display = banner.classList.contains("expanded") ? "none" : "inline";
      }
    });
    
    reportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Fraud reported");
    });
    
    dismissBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      banner.remove();
    });
    
    return banner;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new FraudDetectorBanner());
} else {
  new FraudDetectorBanner();
}
