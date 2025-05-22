/**
 * Universal Platform Handler - For non-Gmail sites
 */
class UniversalPlatform {
  constructor(baseScanner) {
    this.baseScanner = baseScanner;
    this.name = "universal";
  }

  isActive() {
    return !window.location.hostname.toLowerCase().includes("mail.google.com");
  }

  initialize() {
    if (!this.isActive() || !this.baseScanner.protectionEnabled) return;
    
    setTimeout(() => {
      this.scanUniversalContent();
      this.observeUniversalContent();
    }, 2000);
  }

  scanUniversalContent() {
    if (!this.baseScanner.protectionEnabled) return;
    
    const textElements = document.querySelectorAll("p, .message, [role=\"message\"], .post, .comment");
    
    textElements.forEach(element => {
      if (element.textContent.trim().length > 50) {
        this.analyzeUniversalElement(element);
      }
    });
  }

  observeUniversalContent() {
    if (!this.baseScanner.protectionEnabled) return;
    
    const observer = this.baseScanner.createObserver((mutations) => {
      if (!this.baseScanner.protectionEnabled) return;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const textElements = node.querySelectorAll("p, .message, [role=\"message\"], .post");
            textElements.forEach(el => {
              if (el.textContent.trim().length > 50) {
                this.analyzeUniversalElement(el);
              }
            });
          }
        });
      });
    });
  }

  analyzeUniversalElement(element) {
    if (!this.baseScanner.protectionEnabled || element.querySelector(".fraud-universal-warning")) return;
    
    const text = element.textContent.toLowerCase();
    const suspicious = /urgent|verify|suspended|click here|congratulations|won|bitcoin|crypto/.test(text);
    
    if (suspicious) {
      this.showUniversalWarning(element);
    }
  }

  showUniversalWarning(element) {
    const warning = document.createElement("div");
    warning.className = "fraud-universal-warning";
    warning.style.cssText = "background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 8px 12px; margin: 8px 0; font-size: 12px; color: #856404;";
    
    warning.innerHTML = 'Potential fraud detected - <button style="background: none; border: none; color: #007bff; cursor: pointer; text-decoration: underline;">Dismiss</button>';
    
    warning.querySelector("button").addEventListener("click", () => {
      warning.remove();
    });
    
    element.parentNode.insertBefore(warning, element);
  }

  reinitialize() {
    this.initialize();
  }
}

window.UniversalPlatform = UniversalPlatform;
