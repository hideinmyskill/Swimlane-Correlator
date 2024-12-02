chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "copyText") {
        // Relay the copied text to the popup
        console.log("copy text clicked");
        chrome.runtime.sendMessage({ action: "updateMultiEntryBox", text: message.text });
    }
});