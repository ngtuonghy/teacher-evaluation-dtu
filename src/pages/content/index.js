import "./index.css";
async function scrollToCaptcha() {
	const captchaImage = document.querySelector('img[alt="Captcha"]');
	if (captchaImage) {
		captchaImage.scrollIntoView({});
		await new Promise((resolve) => setTimeout(resolve, 400));
		return { success: true, message: "Captcha found and scrolled." };
	} else {
		return { success: false, message: "Captcha not found" };
	}
}

const selectAll = (ranked, checkboxValue) => {
	if (checkboxValue === true) {
		var textAreas = document.querySelectorAll("textarea");
		textAreas.forEach(function (textArea) {
			textArea.innerHTML = " ";
		});
	}

	let radioButtons = document.querySelectorAll('input[type="radio"]');
	let groupCounts = {};

	for (let i = 0; i < radioButtons.length; i++) {
		let radioButton = radioButtons[i];
		if (radioButton.name && radioButton.name !== "") {
			if (
				groupCounts[radioButton.name] !== undefined &&
				groupCounts[radioButton.name] !== null
			) {
				groupCounts[radioButton.name] = groupCounts[radioButton.name] + 1;
			} else {
				groupCounts[radioButton.name] = 1;
			}
			if (groupCounts[radioButton.name] === ranked) {
				radioButton.checked = true;
			}
		}
	}
};

function showCaptchaOverlay() {
	const overlay = document.createElement("div");
	overlay.id = "captcha-overlay";

	overlay.innerHTML = `
<div class="message">
  <div class="message__loader"></div> 
  <p class="message__text">Mẹo: Bạn không cần phải thao tác, CAPTCHA đang được xử lý tự động. Vui lòng đợi trong giây lát!</p>
</div>
  `;
	document.body.appendChild(overlay);
}

function hideCaptchaOverlay() {
	const overlay = document.getElementById("captcha-overlay");
	if (overlay) {
		overlay.remove();
	}
}

chrome.runtime.onMessage.addListener((request, sender, response) => {
	const { action, ...payload } = request;
	// console.log("request", request);
	if (action === "AUTO_SUBMIT_EVALUATION_AND_PASS_CAPTCHA") {
		const promise = new Promise(async (resolve, reject) => {
			selectAll(payload.ratingSelect, payload.skipComments);
			scrollToCaptcha().then((result) => {
				if (result.success) {
					showCaptchaOverlay();
					chrome.runtime.sendMessage(
						{
							action: "SOLVE_CAPTCHA",
						},
						(response) => {
							if (response.success) {
								const input = document.querySelector('input[type="text"]');
								if (input) {
									input.value = response.data.captcha;
									const submitButton = document.querySelector(
										'input[type="button"]',
									);
									if (submitButton) {
										resolve({
											success: true,
											message: "Captcha solved and evaluation submitted",
										});
										submitButton.click();
									} else {
										reject({
											success: false,
											message: "Submit button not found",
										});
									}
								} else {
									reject({
										success: false,
										message: "Captcha input not found",
									});
								}
							} else {
								reject({
									success: false,
									message: "Error occurred while solving captcha",
								});
							}
							hideCaptchaOverlay();
						},
					);
				} else {
					reject({ success: false, message: "Captcha not found" });
				}
			});
		});

		promise
			.then((msg) => {
				response(msg);
			})
			.catch((error) => {
				response(error);
			});
	}

	if (action === "AUTO_SUBMIT_EVALUATION") {
		selectAll(payload.ratingSelect, payload.skipComments);
		if (payload.scrollToConfirmation) {
			window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
		}
		response({ success: true, message: "Evaluation submitted" });
	}
	return true;
});
