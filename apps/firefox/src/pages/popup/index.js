import "./index.css";
document.addEventListener("DOMContentLoaded", function () {
	const autoEvaluation = document.getElementById("autoEvaluation");
	const autoFinish = document.getElementById("autoFinish");

	chrome.storage.sync.get(["autoEvaluation"], function (items) {
		if (items.autoEvaluation !== undefined) {
			autoEvaluation.checked = items.autoEvaluation;
		} else {
			autoEvaluation.checked = true;
		}
	});

	chrome.storage.sync.get(["autoFinish"], function (items) {
		if (items.autoFinish !== undefined) {
			autoFinish.checked = items.autoFinish;
		} else {
			autoFinish.checked = false;
		}
	});

	autoEvaluation.addEventListener("change", function () {
		if (autoEvaluation.checked) {
			autoFinish.checked = false;
		} else {
			autoFinish.checked = true;
		}
	});

	autoFinish.addEventListener("change", function () {
		if (autoFinish.checked) {
			autoEvaluation.checked = false;
		} else {
			autoEvaluation.checked = true;
		}
	});

	chrome.storage.sync.get(["ratingSelect"], function (items) {
		var selectElement = document.querySelector("#ratingSelect");
		if (items.ratingSelect !== undefined) {
			selectElement.value = items.ratingSelect;
		} else {
			selectElement.value = "1";
		}
	});

	chrome.storage.sync.get(["skipComments"], function (items) {
		let checkboxElement = document.querySelector("#skipComments");
		if (items.skipComments !== undefined) {
			checkboxElement.checked = items.skipComments;
		} else {
			checkboxElement.checked = true;
		}
	});

	chrome.storage.sync.get(["scrollToConfirmation"], function (items) {
		let checkboxElement = document.querySelector("#scrollToConfirmation");
		if (items.scrollToConfirmation !== undefined) {
			checkboxElement.checked = items.scrollToConfirmation;
		} else {
			checkboxElement.checked = true;
		}
	});
});

async function getCurrentTab() {
	try {
		let queryOptions = { active: true, lastFocusedWindow: true };
		let [tab] = await chrome.tabs.query(queryOptions);
		return tab;
	} catch (error) {
		console.error("Error occurred while getting current tab:", error);
		return null;
	}
}

const sendMessageToTab = async (tabId, action, payload = {}) => {
	return new Promise((resolve, reject) => {
		chrome.tabs.sendMessage(
			tabId,
			{ action, ...payload }, // Pass action and payload together
			(response) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError.message);
				} else {
					resolve(response);
				}
			},
		);
	});
};

const confirm = () => {
	getCurrentTab().then(async (tab) => {
		if (
			tab === null ||
			!tab.url.includes("https://mydtu.duytan.edu.vn/") ||
			tab.url === "https://mydtu.duytan.edu.vn/Signin.aspx" // Skip the login page of MyDTU, because it resolves captcha
		)
			return;

		let selectElement = document.querySelector("#ratingSelect");
		let ratingSelect = parseInt(selectElement.value);

		let checkboxElement = document.querySelector("#skipComments");
		let skipComments = checkboxElement.checked;

		let cbScrollElement = document.querySelector("#scrollToConfirmation");
		let scrollToConfirmation = cbScrollElement.checked;

		const autoEvaluation = document.getElementById("autoEvaluation");
		const autoFinish = document.getElementById("autoFinish");

		chrome.storage.sync.set({ ratingSelect });
		chrome.storage.sync.set({ skipComments });
		chrome.storage.sync.set({ scrollToConfirmation });
		chrome.storage.sync.set({ autoEvaluation: autoEvaluation.checked });
		chrome.storage.sync.set({ autoFinish: autoFinish.checked });

		if (autoEvaluation.checked) {
			sendMessageToTab(tab.id, "AUTO_SUBMIT_EVALUATION", {
				ratingSelect,
				skipComments,
				scrollToConfirmation,
			})
				.then((response) => {
					console.log("Popup received response", response);
				})
				.catch((error) => {
					console.log("Popup could not send message", error);
				});
		} else {
			sendMessageToTab(tab.id, "AUTO_SUBMIT_EVALUATION_AND_PASS_CAPTCHA", {
				ratingSelect,
				skipComments: true,
			})
				.then((response) => {
					console.log("Popup received response", response);
				})
				.catch((error) => {
					console.log("Popup could not send message", error);
				});
		}
	});
};

document.getElementById("comfirmButton").addEventListener("click", confirm);
