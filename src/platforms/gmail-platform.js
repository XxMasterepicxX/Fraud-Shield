/**
 * Gmail Platform Handler - Keeps existing Gmail functionality exactly the same
 */
class GmailPlatform {
  constructor(baseScanner) {
    this.baseScanner = baseScanner;
    this.scannedEmails = new Set();
    this.currentUrl = window.location.href;
    this.name = "gmail";
  }

  isActive() {
    return window.location.hostname.toLowerCase().includes("mail.google.com");
  }

  initialize() {
    if (!this.isActive() || !this.baseScanner.protectionEnabled) return;
    
    setTimeout(() => {
      this.scanExistingEmails();
      this.observeNewEmails();
      this.observeUrlChanges();
    }, 1500);
  }

  scanCurrentPage() {
    console.log('Fraud Shield: Manual Gmail scan triggered');
    // Remove all existing warnings
    document.querySelectorAll('.fraudshield-warning').forEach(el => el.remove());
    // Clear scanned set
    this.scannedEmails.clear();
    // Rescan
    this.scanExistingEmails();
  }

  scanExistingEmails() {
    if (!this.baseScanner.protectionEnabled) return;
    
    const emailContainers = document.querySelectorAll("[data-message-id]");
    emailContainers.forEach(container => {
      this.addFraudBanner(container);
    });
  }

  observeNewEmails() {
    if (!this.baseScanner.protectionEnabled) return;
    
    const observer = this.baseScanner.createObserver((mutations) => {
      if (!this.baseScanner.protectionEnabled) return;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              node.hasAttribute && node.hasAttribute("data-message-id")) {
            this.addFraudBanner(node);
            this.scannedEmails.add(node.getAttribute("data-message-id"));
          }
        });
      });
    });
  }

  observeUrlChanges() {
    if (!this.baseScanner.protectionEnabled) return;
    
    setInterval(() => {
      if (window.location.href !== this.currentUrl) {
        this.currentUrl = window.location.href;
        setTimeout(() => {
          if (this.baseScanner.protectionEnabled) {
            this.scanExistingEmails();
          }
        }, 500);
      }
    }, 1000);
  }

  addFraudBanner(emailContainer) {
    if (!this.baseScanner.protectionEnabled || emailContainer.querySelector(".fraudshield-warning")) {
      return;
    }

    const emailContent = emailContainer.querySelector(".ii.gt");
    if (emailContent) {
      const banner = this.createBigImprovedBanner();
      emailContent.insertBefore(banner, emailContent.firstChild);
    }
  }

  createBigImprovedBanner() {
    const banner = document.createElement("div");
    banner.className = "fraudshield-warning gmail-conversation";
    
    const header = document.createElement("div");
    header.className = "fraudshield-header";
    
    const left = document.createElement("div");
    left.className = "fraudshield-left";
    
    const icon = document.createElement("img");
    icon.className = "fraudshield-icon";
    icon.src = chrome.runtime.getURL("src/assets/icons/icon128.png");
    icon.alt = "Fraud Shield";
    
    const title = document.createElement("span");
    title.className = "fraudshield-title";
    title.textContent = "FRAUD DETECTED";
    
    const hint = document.createElement("span");
    hint.className = "fraudshield-expand-hint";
    hint.textContent = "Click to view details";
    
    left.appendChild(icon);
    left.appendChild(title);
    left.appendChild(hint);
    
    const score = document.createElement("div");
    score.className = "fraudshield-score";
    score.textContent = "RISK: 95/100";
    
    header.appendChild(left);
    header.appendChild(score);
    
    const content = document.createElement("div");
    content.className = "fraudshield-content";
    
    const reasons = document.createElement("ul");
    reasons.className = "fraudshield-reasons";
    
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
    buttons.className = "fraudshield-buttons";
    
    const reportBtn = document.createElement("button");
    reportBtn.className = "fraudshield-btn fraudshield-btn-report";
    reportBtn.textContent = "REPORT FRAUD";
    
    const dismissBtn = document.createElement("button");
    dismissBtn.className = "fraudshield-btn fraudshield-btn-dismiss";
    dismissBtn.textContent = "DISMISS";
    
    buttons.appendChild(reportBtn);
    buttons.appendChild(dismissBtn);
    
    content.appendChild(reasons);
    content.appendChild(buttons);
    
    banner.appendChild(header);
    banner.appendChild(content);
    
    // Event handlers - exactly the same as before
    banner.addEventListener("click", (e) => {
      if (e.target.classList.contains("fraudshield-btn")) return;
      
      banner.classList.toggle("expanded");
      const hint = banner.querySelector(".fraudshield-expand-hint");
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

  reinitialize() {
    this.initialize();
  }
}

window.GmailPlatform = GmailPlatform;
