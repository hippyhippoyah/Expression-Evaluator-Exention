chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "evaluateExpression",
      title: "Evaluate Expression",
      contexts: ["selection"],
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "evaluateExpression") {
      evaluateExpression(info.selectionText, tab);
    }
  });
  
  chrome.commands.onCommand.addListener((command) => {
    if (command === "evaluate-selected-text") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: getSelectedText, // Inject function to get selected text
        }, (results) => {
          const selectedText = results[0].result;
          if (selectedText) {
            evaluateExpression(selectedText, tabs[0]);
          }
        });
      });
    }
  });
  
  function evaluateExpression(selectedText, tab) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['math.min.js'], // Load Math.js directly
    }, () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: loadAndEvaluateWithToast, // Inject the evaluation and toast function
        args: [selectedText],
      });
    });
  }
  
  function loadAndEvaluateWithToast(selectedText) {
    function showToast(message) {
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.right = '20px';
      toast.style.padding = '10px 20px';
      toast.style.backgroundColor = '#333';
      toast.style.color = '#fff';
      toast.style.fontSize = '16px';
      toast.style.borderRadius = '5px';
      toast.style.zIndex = 10000;
      document.body.appendChild(toast);
  
      setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease';
        toast.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 500);
      }, 3000); 
    }
  
    try {
      const result = math.evaluate(selectedText);
      navigator.clipboard.writeText(result.toString()).then(() => {
        showToast(`Result: ${result} copied to clipboard!`);
      }).catch(err => {
        console.error('Could not copy text: ', err);
        showToast('Failed to copy result.');
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      showToast(`Error: ${error.message}`);
    }
  }
  
  function getSelectedText() {
    return window.getSelection().toString();
  }
  