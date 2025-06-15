//Menu bar design
const hamMenu = document.querySelector('.ham-menu');
const offScreenMenu = document.querySelector('.off-screen-menu');
const createDictionary = document.getElementById('dictionary');
const createadvisory = document.getElementById('advisory');
const license = document.getElementById('license');


hamMenu.addEventListener('click', () => {
    hamMenu.classList.toggle('active');
    offScreenMenu.classList.toggle('active');
})

createDictionary.addEventListener('click', () => {
    chrome.action.setPopup({popup: "dictionary.html"});
    window.close();
})

createadvisory.addEventListener('click', () => {
    chrome.action.setPopup({popup: "advisory.html"});
    window.close();
})

license.addEventListener('click', () => {
    chrome.action.setPopup({popup: "license.html"});
    window.close();
})

//***************Menu Bar Design******** */
document.addEventListener('DOMContentLoaded', () => {
    const multiEntryBox = document.getElementById('multiEntryBox');

    // Fetch Saved data from the background script when the pop up opens
    chrome.runtime.sendMessage({ action: "getData" }, (response) => {
        if (response.data) {
            multiEntryBox.value = response.data.join('\n'); // Populate the text box with the collected data 
            localStorage.setItem('multiEntryContent', multiEntryBox.value) // Save to localStorage
        }
    })
    
    // Load saved content from localStorage when the popup is opened
    const savedContent = localStorage.getItem('multiEntryContent');
    if (savedContent) {
        multiEntryBox.value = savedContent;
    }

    // Save the multi-entry box content to localStorage on input change
    multiEntryBox.addEventListener('input', () => {
        if (multiEntryBox.value.trim() === '' ) {
            multiEntryBox.value = ''
            localStorage.removeItem('multiEntryContent'); // Clear the saved content
            chrome.runtime.sendMessage({ action: "clearData"}); // Clear chrome local storage when user clear the textbox
        } else {
            const currentLines = multiEntryBox.value.trim().split('\n'); // Get all current lines
            chrome.runtime.sendMessage({ action: "syncData", data: currentLines }, (response) => {
                if (response.success) {
                    console.log("Data synchronized successfully");
                } else {
                    console.error("failed to synchronized data.")
                }
            });

            // save to local storage aswell
            localStorage.setItem('multiEntryContent', multiEntryBox.value);
        }
    });

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateMultiEntryBox') {
            if (multiEntryBox.value) {
                // Append the received text to the multi-entry box
                multiEntryBox.value += '\n' + message.text;
	    
                // Save the updated content to localStorage
                localStorage.setItem('multiEntryContent', multiEntryBox.value);
            } else {
                // Append the received text to the multi-entry box
                multiEntryBox.value += message.text;
	    
                // Save the updated content to localStorage
                localStorage.setItem('multiEntryContent', multiEntryBox.value);
            }
            
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
