document.addEventListener('DOMContentLoaded', () => {
    const multiEntryBox = document.getElementById('multiEntryBox');

    // Load saved content from localStorage when the popup is opened
    const savedContent = localStorage.getItem('multiEntryContent');
    if (savedContent) {
        multiEntryBox.value = savedContent;
    }

    // Save the multi-entry box content to localStorage on input change
    multiEntryBox.addEventListener('input', () => {
        localStorage.setItem('multiEntryContent', multiEntryBox.value);
    });

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateMultiEntryBox') {
            // Append the received text to the multi-entry box
            multiEntryBox.value += message.text + '\n';
	    

            // Save the updated content to localStorage
            localStorage.setItem('multiEntryContent', multiEntryBox.value);
        }
    });

      // Listen for messages from the background to clear data in multientry box
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'clearData') {
            multiEntryBox.value = '';

	    // Save the updated content to localStorage
            localStorage.setItem('multiEntryContent', multiEntryBox.value);

        }
    });

    // Activate button click to trigger injectButtons function
    const activateButton = document.getElementById('activateButton');
    activateButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'injectButtons' });
        });
    });

    // Paste button trigger the paste function
    const pasteButton = document.getElementById('pasteButton');
    pasteButton.addEventListener('click', () => {
       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'pasteContents', text: multiEntryBox.value });
       });
    });

});
