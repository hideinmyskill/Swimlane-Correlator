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

createadvisory.addEventListener('click', () => {
    chrome.action.setPopup({popup: "advisory.html"});
    window.close();
})

createDictionary.addEventListener('click', () => {
    chrome.action.setPopup({popup: "dictionary.html"});
    window.close();
})

const apikey = document.getElementById("apikey");

// Load saved content from localStorage when the popup is opened
const savedkey = localStorage.getItem("apikey");
if (savedkey) {
    apikey.value = savedkey;
}

// Save the apikey box content to localStorage on input change
apikey.addEventListener("input", () => {
    localStorage.setItem("apikey", apikey.value);
});

// Example: Create button click to trigger sent to gpt function
const saveButton = document.getElementById("save");
    
saveButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "apikey", text: apikey.value });
    });
});

