//Menu bar design
const hamMenu = document.querySelector('.ham-menu');
const offScreenMenu = document.querySelector('.off-screen-menu');
const swimlaneCorrelator = document.getElementById('correlator');
const createDictionary = document.getElementById('dictionary');
const createadvisory = document.getElementById('advisory');

hamMenu.addEventListener('click', () => {
    hamMenu.classList.toggle('active');
    offScreenMenu.classList.toggle('active');
})

swimlaneCorrelator.addEventListener('click', () => {
    chrome.action.setPopup({popup: "index.html"});
    window.close();
})

createDictionary.addEventListener('click', () => {
    chrome.action.setPopup({popup: "dictionary.html"});
    window.close();
})

document.addEventListener("DOMContentLoaded", () => {
    const multiEntryBox = document.getElementById("url"); 

    // Example: Create button click to trigger sent to gpt function
    const createButton = document.getElementById("create");

    createButton.addEventListener("click", () => { 
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "URL", text: multiEntryBox.value });
        });
    });
});