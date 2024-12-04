// Helper function to save data to chrome.storage.local
function saveCollectedData(data) {
    chrome.storage.local.get({ collectedData: [] }, (result) => {
        const updatedData = [...result.collectedData, data];
        chrome.storage.local.set({ collectedData: updatedData }, () => {
            console.log("Data saved:", updatedData);
        });
    });
}

// Helper function to sync updated data
function syncCollectedData(data) {
    chrome.storage.local.set({ collectedData: data }, () => {
        console.log("Data synchronized:", data);
    });
}

// listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "copyText") {
        // store data
        saveCollectedData(message.text);
        sendResponse({ success: true });
        chrome.runtime.sendMessage({ action: "updateMultiEntryBox", text: message.text });
        // chrome.runtime.sendMessage({ action: "updateMultiEntryBox", text: message.text });
    } else if (message.action === "getData") {
        chrome.storage.local.get({ collectedData: [] }, (result) => {
            sendResponse({ data: result.collectedData });
        });
        return true; // indicates async response
    } else if (message.action === "syncData") {
        syncCollectedData(message.data); // Sync updated data
        sendResponse({ success: true });
    } else if (message.action === "clearData") {
        chrome.storage.local.set({ collectedData: [] }, () => {
            console.log("Data Cleared.");
            sendResponse({ success: true });
        });
        return true; 
    }
});