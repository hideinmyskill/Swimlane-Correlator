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
			color: white;
			border-radius: 5px;
			transition: transform 0.2s ease, box-shadow 0.2s ease;
		`;
		// Add onclick event to copy button
		// Cancels possible existing event actions
		// Copies text to clipboard
		copyButton.addEventListener("click", (event) => {
			event.stopPropagation();
			event.preventDefault();
			
			// Add button animation
			copyButton.style.transform = "scale(0.9)";
			copyButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

			setTimeout(() => {
				copyButton.style.transform = "scale(1)";
				copyButton.style.boxShadow = "none";
			}, 200); // reset after 200ms

			copyTextToExtension(rowText);
			navigator.clipboard.writeText(rowText)
				.then(() => showNotification(rowText + ' copied!'))
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

//Interact with Chat GPT:::
async function getChatGPTResponse(apikey, userInput) {
    const url = "https://api.openai.com/v1/chat/completions";

    const payload = {
        model: "gpt-4o-mini", // Replace with "gpt-4o-mini" if applicable
        messages: [
            {
                role: "system",
                content: "Finish filling in this template for the alert. \"{user input here}\"Severity (Low, Medium) Note: Only use high if it has been confirmed to be an Attack or successful Breach. Intent: (Pick One: System Compromise, Exploitation & Installation, Delivery & Attack, Reconnaissance & Probing, Environmental Awareness) Objective: Description: This alert is triggered when ... Analyst Workflow: (Don't write dot points) Please provide a concise note, one or two sentences, that includes what the analysts should investigate, list a few criteria's for closing as a false positive, and what information to send to the client if further action is required. Write how they can determine if it should be closed as a True Positive. Client Recommended Actions: (Write concise dot points)(These will be client request to help provide missing information to the SOC to help determine if its a false or true positive) Monthly Report Description: (A Description for the alert when the monthly reports get generated Outcome Summary : (Short summary of the alarm for monthly reports)\n\nMake the response in Australian English\nMake the response as json, make the key as the title and the value as your response."
            },
            {
                role: "user",
                content: `${userInput}`
            }
        ],
		response_format: {
			"type": "json_object"
		  },
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        // console.log(data.choices[0].message.content); // Print the response
        return data.choices[0].message.content; // Return the response
    } catch (error) {
        console.error("Error fetching OpenAI response:", error);
        throw error;
    }
}

// interact with the page and put the details fro chat gpt
function enterDetails(message, jresult) {
	const jsonFile = JSON.parse(jresult);
	// const jsonFile = {
	// 	"Recommended severity": "Medium",
	// 	"Note": "Only use high if it has been confirmed to be an Attack or successful Breach.",
	// 	"Intent": "Delivery & Attack",
	// 	"Objective": "Identify potential email-based threats or unauthorized actions on delivered emails.",
	// 	"Description": "This alert is triggered when email messages are removed from the recipient's inbox after being successfully delivered, indicating a possible manipulation or compromise.",
	// 	"Analyst Workflow": "Analysts should investigate the email logs for any unusual activities around the time of delivery, check for user account anomalies, and review security logs for suspicious access patterns. Criteria for closing as a false positive include legitimate account activity changes or policy-enforced email retention settings. If further action is required, provide the client with details of the affected accounts and timestamps of email delivery for their review. Determine closure as a True Positive by identifying evidence of unauthorised access or malicious intent behind the removal actions.",
	// 	"Client Recommended Actions": [
	// 	  "Review email account activity for irregular logins.",
	// 	  "Verify if any email retention policies may have caused the removals.",
	// 	  "Check if users are aware of any legitimate reason for email removals.",
	// 	  "Provide details of any recent changes in account security settings."
	// 	],
	// 	"Monthly Report Description": "This alert relates to instances where delivered emails are subsequently removed from user inboxes, indicating a potential security issue.",
	// 	"Outcome Summary": "Medium severity alert triggered by the removal of delivered emails, leading to investigation of possible email compromises or environmental policy effects."
	//   }
	console.log(jsonFile)
	const ruleName = document.querySelector('input[name="arn00"]');
	ruleName.value = message;
	ruleName.dispatchEvent(new Event('input', { bubbles: true })); // triger an update in angular

	const monthlyDescription = document.querySelector('textarea[name="accfk"]');
	monthlyDescription.value = jsonFile["Monthly Report Description"];
	monthlyDescription.dispatchEvent(new Event('input', { bubbles: true })); // triger an update in angular

	const editors = Array.from(document.getElementsByClassName("editor"));
	editors.forEach((editor, index) => {
		const iframe = editor.querySelector(".tox-edit-area__iframe");
		const editorBody = iframe.contentDocument || iframe.contentWindow.document;
		const tinymceBody = editorBody.querySelector('body');
		console.log("Looping through index", index)
		if (index === 0) {
			tinymceBody.innerHTML = "<p>" + jsonFile['Description'] + "</p>";

		}if (index === 1) {
			let bulletListHTML = '<ul>';
			jsonFile["Client Recommended Actions"].forEach(point => {
				bulletListHTML += `<li>${point}</li>`;
			  });
			  bulletListHTML += '</ul>';
			tinymceBody.innerHTML = bulletListHTML;
		}if (index === 3) {
			tinymceBody.innerHTML = "<p>" + jsonFile["Analyst Workflow"] + "</p>";
		}if (index === 4) {
			tinymceBody.innerHTML = "<p>" + jsonFile["Outcome Summary"] + "</p>";
		} else {
			return;
		}
	});

	// choose an impact based on json
	const impact = document.querySelector('div[name="aubyf"]');
	impact.querySelector(".select2-arrow.ui-select-toggle").click();
	const impactChoicesNumber = impact.querySelector(".ui-select-choices-group").querySelector('ul').id.split('-').pop();
	if (jsonFile["Severity"].toLowerCase() === "low") {
		impact.querySelector(`#ui-select-choices-row-${impactChoicesNumber}-1`).click();
	} else if (jsonFile["Severity"].toLowerCase() === "medium") {
		impact.querySelector(`#ui-select-choices-row-${impactChoicesNumber}-2`).click();
	} else if (jsonFile["Severity"].toLowerCase() === "high") {
		impact.querySelector(`#ui-select-choices-row-${impactChoicesNumber}-3`).click();
	}

	// choose intent based on json
	const intent = document.querySelector('div[name="a78ty"');
	intent.querySelector(".select2-arrow.ui-select-toggle").click();
	const intentChoicesNumber = intent.querySelector(".ui-select-choices-group").querySelector('ul').id.split('-').pop();
	if (jsonFile["Intent"].toLowerCase() === "system compromise") {
		intent.querySelector(`#ui-select-choices-row-${intentChoicesNumber}-0`).click()
	} else if (jsonFile["Intent"].toLowerCase() === "exploitation & installation") {
		intent.querySelector(`#ui-select-choices-row-${intentChoicesNumber}-1`).click()
	} else if (jsonFile["Intent"].toLowerCase() === "delivery & attack") {
		console.log("Delivery Match")
		intent.querySelector(`#ui-select-choices-row-${intentChoicesNumber}-2`).click()
	} else if (jsonFile["Intent"].toLowerCase() === "reconnaissance & probing") {
		intent.querySelector(`#ui-select-choices-row-${intentChoicesNumber}-3`).click()
	} else if (jsonFile["Intent"].toLowerCase() === "environmental awareness") {
		intent.querySelector(`#ui-select-choices-row-${intentChoicesNumber}-4`).click()
	}
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "apikey") {
		chrome.storage.local.set({ apikey: message.text }, function() {
            console.log("API key saved successfully!");
        });
	 }
	if (message.action === "sendtogpt") {
		// enterDetails(message.text);
		chrome.storage.local.get(["apikey"], (result) => {
            const apikey = result.apikey; // Access the stored API key
            // GPT usage
            getChatGPTResponse(apikey, message.text).then(response => {
                // const textbox = document.getElementById('inputTextArea');
                // textbox.value = response;
				enterDetails(message.text,response)
            });
    	});
	 }
});

// Advisory Section...
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => { 
	if (message.action === "URL") {
		console.log(message.text)
	} 
});

console.log("content script loaded");