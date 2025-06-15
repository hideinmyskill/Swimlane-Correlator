//Menu bar design
const hamMenu = document.querySelector('.ham-menu');
const offScreenMenu = document.querySelector('.off-screen-menu');
const swimlaneCorrelator = document.getElementById('correlator');
const createadvisory = document.getElementById('advisory');
const license = document.getElementById('license');


hamMenu.addEventListener('click', () => {
    hamMenu.classList.toggle('active');
    offScreenMenu.classList.toggle('active');
})

swimlaneCorrelator.addEventListener('click', () => {
    chrome.action.setPopup({popup: "index.html"});
    window.close();
})

//**end of menu bar design */
createadvisory.addEventListener('click', () => {
    chrome.action.setPopup({popup: "advisory.html"});
    window.close();
})

license.addEventListener('click', () => {
    chrome.action.setPopup({popup: "license.html"});
    window.close();
})

document.addEventListener("DOMContentLoaded", () => {
    const multiEntryBox = document.getElementById("ruleTitle");

    // Example: Create button click to trigger sent to gpt function
    const createButton = document.getElementById("create");
    
    createButton.addEventListener("click", () => {
        // chrome.tabs.create({ url: "https://bluenode.int.ctrlgroup.local/record/aCoyMaUQlXXK4xZ3y/" })
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "sendtogpt", text: multiEntryBox.value });
        });
    });

}); 