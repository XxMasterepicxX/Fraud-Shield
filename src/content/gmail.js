console.log('ScamDetect Gmail scanner loaded');

class GmailScanner {
  constructor() {
    this.scannedEmails = new Set();
    this.init();
  }

  init() {
    setTimeout(() => {
      this.scanExistingEmails();
      this.observeNewEmails();
    }, 2000);
  }

  observeNewEmails() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.scanEmailElement(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanExistingEmails() {
    const emailRows = document.querySelectorAll('tr.zA');
    emailRows.forEach(row => this.scanEmailRow(row));

    const openEmails = document.querySelectorAll('.ii.gt');
    openEmails.forEach(email => this.scanOpenEmail(email));
  }

  scanEmailElement(element) {
    if (element.matches && element.matches('tr.zA')) {
      this.scanEmailRow(element);
    }

    const openEmail = element.querySelector('.ii.gt');
    if (openEmail) {
      this.scanOpenEmail(openEmail);
    }
  }

  async scanEmailRow(row) {
    try {
      const emailId = this.getEmailId(row);
      if (this.scannedEmails.has(emailId)) return;

      const sender = this.extractSenderFromRow(row);
      const subject = this.extractSubjectFromRow(row);
      const snippet = this.extractSnippetFromRow(row);

      const content = subject + ' ' + snippet;
      
      const result = await this.scanContent(content, sender, 'email');
      
      if (result.isScam) {
        this.addWarningToRow(row, result);
        this.scannedEmails.add(emailId);
      }
    } catch (error) {
      console.error('Error scanning email row:', error);
    }
  }

  async scanOpenEmail(emailElement) {
    try {
      const emailContainer = emailElement.closest('[data-message-id]');

      const messageId = emailContainer.getAttribute('data-message-id');
      if (this.scannedEmails.has(messageId)) return;

      const sender = this.extractSenderFromOpenEmail(emailContainer);
      const content = emailElement.innerText || emailElement.textContent;

      const result = await this.scanContent(content, sender, 'email');
      
      if (result.isScam) {
        this.addWarningToOpenEmail(emailContainer, result);
        this.scannedEmails.add(messageId);
      }
    } catch (error) {
      console.error('Error scanning open email:', error);
    }
  }

  getEmailId(row) {
    return row.getAttribute('id') || 'row-' + Math.random();
  }

  extractSenderFromRow(row) {
    const senderElement = row.querySelector('.yW span[email]');
    return senderElement ? senderElement.getAttribute('email') : '';
  }

  extractSubjectFromRow(row) {
    const subjectElement = row.querySelector('.bog');
    return subjectElement ? subjectElement.textContent : '';
  }

  extractSnippetFromRow(row) {
    const snippetElement = row.querySelector('.y2');
    return snippetElement ? snippetElement.textContent : '';
  }

  extractSenderFromOpenEmail(container) {
    const senderElement = container.querySelector('.go .gD');
    return senderElement ? senderElement.getAttribute('email') : '';
  }

  async scanContent(content, sender, type) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'scanContent',
        content: content,
        sender: sender,
        type: type
      }, resolve);
    });
  }

  addWarningToRow(row, result) {
    if (row.querySelector('.scamdetect-warning')) return;

    const warning = this.createWarning(result, 'platform-gmail');
    
    const firstCell = row.querySelector('td');
    if (firstCell) {
      firstCell.style.position = 'relative';
      firstCell.insertBefore(warning, firstCell.firstChild);
    }
  }

  addWarningToOpenEmail(container, result) {
    if (container.querySelector('.scamdetect-warning')) return;

    const warning = this.createWarning(result, 'platform-gmail');
    container.insertBefore(warning, container.firstChild);
  }

  createWarning(result, platformClass) {
    const warning = document.createElement('div');
    warning.className = 'scamdetect-warning ' + platformClass;
    
    warning.innerHTML = [
      '<div class="scamdetect-header">',
      '<span class="scamdetect-icon">Shield</span>',
      '<span class="scamdetect-title">SCAM DETECTED</span>',
      '</div>',
      '<div class="scamdetect-score">Risk Score: ' + result.riskScore + '/100</div>',
      '<ul class="scamdetect-reasons">',
      result.reasons.map(reason => '<li>' + reason + '</li>').join(''),
      '</ul>',
      '<div class="scamdetect-buttons">',
      '<button class="scamdetect-btn scamdetect-btn-report">Report Scam</button>',
      '<button class="scamdetect-btn scamdetect-btn-dismiss">Dismiss</button>',
      '</div>'
    ].join('');

    warning.querySelector('.scamdetect-btn-report').addEventListener('click', () => {
      console.log('Reporting scam...');
    });

    warning.querySelector('.scamdetect-btn-dismiss').addEventListener('click', () => {
      warning.remove();
    });

    return warning;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new GmailScanner());
} else {
  new GmailScanner();
}
