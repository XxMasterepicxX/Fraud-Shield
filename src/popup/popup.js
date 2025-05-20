document.addEventListener('DOMContentLoaded', function() {
  loadStats();
  
  document.getElementById('scanNow').addEventListener('click', scanCurrentPage);
  document.getElementById('settings').addEventListener('click', openSettings);
  
  setInterval(loadStats, 5000);
});

function loadStats() {
  chrome.runtime.sendMessage({ action: 'getStats' }, (stats) => {
    if (stats) {
      document.getElementById('threatsBlocked').textContent = stats.threatsBlocked || 0;
      document.getElementById('emailsScanned').textContent = stats.emailsScanned || 0;
      document.getElementById('messagesScanned').textContent = stats.messagesScanned || 0;
    }
  });
}

function scanCurrentPage() {
  const btn = document.getElementById('scanNow');
  const originalText = btn.textContent;
  
  btn.textContent = 'Scanning...';
  btn.disabled = true;
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    
    if (currentTab.url.includes('mail.google.com')) {
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          if (window.gmailScanner) {
            window.gmailScanner.scanExistingEmails();
          }
        }
      });
    } else if (currentTab.url.includes('outlook')) {
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          if (window.outlookScanner) {
            window.outlookScanner.scanExistingEmails();
          }
        }
      });
    } else if (currentTab.url.includes('facebook.com') || currentTab.url.includes('messenger.com')) {
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          if (window.facebookScanner) {
            window.facebookScanner.scanExistingMessages();
          }
        }
      });
    } else if (currentTab.url.includes('twitter.com') || currentTab.url.includes('x.com')) {
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          if (window.twitterScanner) {
            window.twitterScanner.scanExistingTweets();
          }
        }
      });
    } else if (currentTab.url.includes('linkedin.com')) {
      chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          if (window.linkedinScanner) {
            window.linkedinScanner.scanExistingContent();
          }
        }
      });
    }
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      
      loadStats();
    }, 2000);
  });
}

function openSettings() {
  alert('Settings panel coming soon!\n\nCurrently in testing mode - all content is flagged as potential scams.');
}

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('btn')) {
    e.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
      e.target.style.transform = '';
    }, 100);
  }
});
