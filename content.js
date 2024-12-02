/**
 * Copies the provided text to the clipboard
 * Sends a message to the background script to trigger copy to extension.
 *
 * @param {string} text - The text to be copied to the clipboard and sent to the background script.
 * @returns {void}
 */
function copyTextToExtension(text) {
		navigator.clipboard.writeText(text)
				.then(() => {
						console.log("Text copied to clipboard!");
						chrome.runtime.sendMessage({ action: "copyText", text: text });
				})
				.catch((error) => {
						console.error("Failed to copy text: " + error);
				});
}

/**
 * Displays a temporary notification on the screen with the given message.
 *
 * @param {string} message - The message to display in the notification.
 * @returns {void}
 */
function showNotification(message) {
		const notification = document.createElement('div');
		notification.textContent = message;
		notification.style = `
				position: fixed;
				bottom: 20px;
				right: 20px;
				padding: 10px 20px;
				background: #28a745;
				color: white;
				border-radius: 5px;
				box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
				z-index: 1000;
				font-size: 14px;
				font-weight: bold;
		`
		document.body.appendChild(notification);

		// Remove the notification after 2 seconds
		setTimeout(() => {
				notification.remove();
		}, 2000);
}

function injectButtons() {
	/**
	 * Replaces the default hidden select box in rows of a table with a "Copy" button.
	 * The "Copy" button copies the tracking ID of its respective case to the clipboard and displays a notification.
	 *
	 * @returns {void}
	 */
	function replaceSelectBoxWithCopyButton() {
		const contentRows = Array.from(document.getElementsByClassName("dt-row"));
		contentRows.forEach((row) => {
			const rowText = row.getElementsByClassName("dt-cell-content")[2].textContent
			const copyButton = document.createElement("button");
			copyButton.innerHTML = "📋";
			copyButton.id = "copyButton1";
			copyButton.style = `
				border: none;
				cursor: pointer;
				font-size: 16px;
				margin-left: 2px;
			`;
			// Add onclick event to copy button
			// Cancels possible existing event actions
			// Copies text to clipboard
			copyButton.addEventListener("click", (event) => {
				event.stopPropagation();
				event.preventDefault();
				copyTextToExtension(rowText);
				navigator.clipboard.writeText(rowText)
					.then(() => showNotification('Copied to Clipboard!'))
					.catch((error) => alert("Failed to copy title: " + error));
			});

			// Check if copy button already created
			// If not, replace select-box with copy button
			const copyButtonCheck = row.querySelector("#copyButton1")
			if (copyButtonCheck) {
					console.log("Copy button is already there, not adding...");
			} else {
				row.querySelector('.select-box').replaceWith(copyButton);
			}
		})
	}
	// Call the function to replace select-box elements
	replaceSelectBoxWithCopyButton();
}

/**
 * Pastes all copied case tracking IDs into correlation input field.
 * Simulates pressing the "Enter" key for each line. 
 * Sends a message to clear stored data.
 *
 * @param {string} message - The content to paste, where each line represents a separate value.
 * @returns {void}
 */
function pasteContents(message) {
	// Select the input element
	const inputElement = document.querySelector('input.select2-input');
	if (inputElement) {
		console.log("This is paste button....workinggg");
		const values = message.trim().split('\n');
		values.forEach((value) => {
				console.log("Adding tracking ID: ", value);

			// Set the desired value
			inputElement.value = value;

			// Trigger the input event to update any listeners
			const inputEvent = new Event('input', { bubbles: true });
			inputElement.dispatchEvent(inputEvent);

			// Simulate pressing the "Enter" key
			const enterEvent = new KeyboardEvent('keydown', {
					key: 'Enter',
					code: 'Enter',
					keyCode: 13, // KeyCode for Enter
					which: 13,   // 'which' is for backward compatibility
					bubbles: true
			});
			inputElement.dispatchEvent(enterEvent);
		});
		chrome.runtime.sendMessage({ action: "clearData"});
		showNotification("Tracking ID added");
	 } 
	 else {
		 console.log("Paste Button is not working. open a case and try again");
	 }
}

/**
 * Listener for messages sent to the Chrome runtime. Executes specific actions based on the message's `action` property.
 *
 * @callback MessageListener
 * @param {object} message - The message sent from another part of the extension.
 * @param {string} message.action - The action to perform, e.g., "injectButtons".
 * @param {object} sender - Information about the sender of the message, including its context.
 * @param {function} sendResponse - A callback function to send a response back to the sender.
 * @returns {void}
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.action === "injectButtons") {
				injectButtons(); // Run the function when the message is received
		}
});

/**
 * Listener for messages received by the Chrome runtime. Executes specific actions based on the message's `action` property.
 *
 * @callback MessageListener
 * @param {object} message - The message sent from another part of the extension.
 * @param {string} message.action - The action to perform, e.g., "pasteContents".
 * @param {string} [message.text] - The text to pass to the `pasteContents` function, if applicable.
 * @param {object} sender - The sender of the message, including information about the source of the message.
 * @param {function} sendResponse - A callback to send a response back to the sender.
 * @returns {void}
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.action === 'pasteContents') {
				pasteContents(message.text); // Call the pasteContents function
		}
});

// Confirmation message upon successful load.
console.log("content script loaded")