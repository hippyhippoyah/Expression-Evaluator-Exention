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
          function: getSelectedText, 
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
        function: loadAndEvaluate,
        args: [selectedText],
      });
    });
  }
  
  function loadAndEvaluate(selectedText) {
    try {
      const result = math.evaluate(selectedText);
      navigator.clipboard.writeText(result.toString()).then(() => {
        console.log(`Result copied to clipboard: ${result}`);
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
  
  function getSelectedText() {
    return window.getSelection().toString();
  }
  