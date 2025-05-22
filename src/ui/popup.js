document.addEventListener("DOMContentLoaded", function() {
  loadStats();
  
  document.getElementById("scanPage").addEventListener("click", scanCurrentPage);
  document.getElementById("settingsBtn").addEventListener("click", openSettings);
  document.getElementById("protectionToggle").addEventListener("change", toggleProtection);
  
  // Load protection state
  loadProtectionState();
  
  setInterval(loadStats, 3000);
});

function loadStats() {
  document.getElementById("threatsBlocked").textContent = "TESTING MODE";
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      const url = new URL(tabs[0].url);
      let hostname = url.hostname;
      
      // Truncate long hostnames
      if (hostname.length > 16) {
        hostname = hostname.substring(0, 13) + "...";
      }
      
      document.getElementById("currentSite").textContent = hostname;
    }
  });
}

function loadProtectionState() {
  chrome.storage.sync.get(['protectionEnabled'], function(result) {
    const isEnabled = result.protectionEnabled !== false; // Default to true
    document.getElementById("protectionToggle").checked = isEnabled;
    updateProtectionUI(isEnabled);
  });
}

function toggleProtection() {
  const isEnabled = document.getElementById("protectionToggle").checked;
  
  // Save state
  chrome.storage.sync.set({protectionEnabled: isEnabled});
  
  // Update UI
  updateProtectionUI(isEnabled);
  
  // Send message to content script
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "toggleProtection", 
      enabled: isEnabled
    });
  });
}

function updateProtectionUI(isEnabled) {
  const controlRow = document.querySelector(".control-row");
  
  if (isEnabled) {
    controlRow.classList.remove("protection-off");
    document.getElementById("scanPage").disabled = false;
  } else {
    controlRow.classList.add("protection-off");
    document.getElementById("scanPage").disabled = true;
  }
}

function scanCurrentPage() {
  const btn = document.getElementById("scanPage");
  const originalText = btn.textContent;
  
  btn.textContent = "Scanning...";
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = "✓ Complete";
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 800);
  }, 1200);
}

function openSettings() {
  // Simple settings for now
  const settingsInfo = `Fraud Shield Settings

Protection: ${document.getElementById("protectionToggle").checked ? "ON" : "OFF"}
Mode: Testing
Coverage: Universal

Advanced settings coming soon!`;
  
  alert(settingsInfo);
}
