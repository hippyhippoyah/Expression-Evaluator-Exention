chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "evaluateExpression",
      title: "Evaluate Expression",
      contexts: ["selection"],
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "evaluateExpression") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['math.min.js'], // Load Math.js directly
      }, () => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: loadAndEvaluate,
          args: [info.selectionText],
        });
      });
    }
  });
  
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
  