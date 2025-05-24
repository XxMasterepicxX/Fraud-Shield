/**
 * Universal Platform Handler - Toast notification system
 */
class UniversalPlatform {
  constructor(baseScanner) {
    this.baseScanner = baseScanner;
    this.name = "universal";
    this.toastContainer = null;
    this.activeToasts = new Map();
  }

  isActive() {
    // Testing mode - active on all non-Gmail/Discord sites
    return !window.location.hostname.includes("mail.google.com") && 
           !window.location.hostname.includes("discord.com");
  }

  initialize() {
    if (!this.isActive() || !this.baseScanner.protectionEnabled) return;
    
    console.log("Ìª°Ô∏è Fraud Shield: Universal platform initializing...");
    
    this.createToastContainer();
    
    // Show immediate test toast
    setTimeout(() => {
      console.log("Ìª°Ô∏è Showing initial toast...");
      this.showToast('high', 'Ìª°Ô∏è Fraud Shield Active', 'Protection enabled. Monitoring for suspicious content.');
      
      // Show another after 3 seconds
      setTimeout(() => {
        this.showToast('medium', 'Testing Mode Active', 'Fraud warnings will appear periodically for testing.');
      }, 3000);
      
      // Start random warnings
      this.startTestingMode();
    }, 500);
  }

  createToastContainer() {
    if (this.toastContainer) return;
    
    console.log("Ìª°Ô∏è Creating toast container...");
    
    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'fraud-shield-toast-container';
    this.toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 380px;
      pointer-events: none;
    `;
    document.body.appendChild(this.toastContainer);
  }

  startTestingMode() {
    let testCount = 0;
    const showRandomToast = () => {
      if (!this.baseScanner.protectionEnabled || testCount > 10) return;
      
      const risks = ['low', 'medium', 'high'];
      const risk = risks[Math.floor(Math.random() * risks.length)];
      
      const messages = {
        low: {
          title: 'Suspicious Content Detected',
          message: 'Found potentially misleading information on this page.'
        },
        medium: {
          title: 'Potential Fraud Warning', 
          message: 'This page contains patterns commonly used in scam attempts.'
        },
        high: {
          title: 'Ì∫® High Risk Alert',
          message: 'Multiple fraud indicators detected. Exercise extreme caution.'
        }
      };
      
      const msg = messages[risk];
      console.log(`Ìª°Ô∏è Showing ${risk} risk toast...`);
      this.showToast(risk, msg.title, msg.message);
      testCount++;
      
      // Schedule next toast
      setTimeout(showRandomToast, 8000 + Math.random() * 7000);
    };
    
    setTimeout(showRandomToast, 5000);
  }

  showToast(riskLevel, title, message) {
    const toast = document.createElement('div');
    const toastId = Date.now();
    toast.className = 'fraud-toast';
    toast.dataset.risk = riskLevel;
    
    const colors = {
      low: { bg: '#fff4e5', border: '#ffa726', icon: '#f57c00', text: '#e65100' },
      medium: { bg: '#fff3e0', border: '#ff7043', icon: '#f4511e', text: '#d84315' },
      high: { bg: '#ffebee', border: '#ef5350', icon: '#e53935', text: '#c62828' }
    };
    
    const color = colors[riskLevel];
    
    toast.innerHTML = `
      <div class="fraud-toast-header">
        <div class="fraud-toast-icon" style="background: ${color.icon};">!</div>
        <div class="fraud-toast-title" style="color: ${color.text};">${title}</div>
        <div class="fraud-toast-close">√ó</div>
      </div>
      <div class="fraud-toast-message">${message}</div>
      <div class="fraud-toast-expand">Click for details ‚ñº</div>
      <div class="fraud-toast-details">
        <div class="fraud-toast-detail-title">Fraud Analysis:</div>
        <ul>
          <li>Pattern matching: ${Math.floor(60 + Math.random() * 35)}% confidence</li>
          <li>Risk factors detected: ${Math.floor(2 + Math.random() * 5)}</li>
          <li>Similar to known scams: ${Math.random() > 0.5 ? 'Yes' : 'Partial match'}</li>
        </ul>
        <div class="fraud-toast-actions">
          <button class="fraud-toast-btn fraud-toast-report">Report</button>
          <button class="fraud-toast-btn fraud-toast-dismiss">Dismiss</button>
        </div>
      </div>
    `;
    
    toast.style.cssText = `
      background: ${color.bg};
      border: 2px solid ${color.border};
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 320px;
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    `;
    
    // Add event listeners
    const closeBtn = toast.querySelector('.fraud-toast-close');
    const expandArea = toast.querySelector('.fraud-toast-expand');
    const details = toast.querySelector('.fraud-toast-details');
    const reportBtn = toast.querySelector('.fraud-toast-report');
    const dismissBtn = toast.querySelector('.fraud-toast-dismiss');
    
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeToast(toast, toastId);
    });
    
    toast.addEventListener('click', () => {
      const isExpanded = toast.classList.contains('expanded');
      if (isExpanded) {
        toast.classList.remove('expanded');
        expandArea.innerHTML = 'Click for details ‚ñº';
      } else {
        toast.classList.add('expanded');
        expandArea.innerHTML = 'Click to collapse ‚ñ≤';
      }
    });
    
    reportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Ìª°Ô∏è Fraud reported');
      this.removeToast(toast, toastId);
    });
    
    dismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeToast(toast, toastId);
    });
    
    this.toastContainer.appendChild(toast);
    this.activeToasts.set(toastId, toast);
    
    // Auto-remove low risk toasts after 15 seconds
    if (riskLevel === 'low') {
      setTimeout(() => {
        if (this.activeToasts.has(toastId)) {
          this.removeToast(toast, toastId);
        }
      }, 15000);
    }
  }

  removeToast(toast, toastId) {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      toast.remove();
      this.activeToasts.delete(toastId);
    }, 300);
  }

  reinitialize() {
    // Remove existing container
    if (this.toastContainer) {
      this.toastContainer.remove();
      this.toastContainer = null;
    }
    this.activeToasts.clear();
    this.initialize();
  }
}

window.UniversalPlatform = UniversalPlatform;
