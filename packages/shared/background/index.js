import { initModel } from "@shared/lib/gemini-ai";
async function decodeCaptcha(file) {
	if (file === undefined) {
		return { success: false, message: "Captcha not found" };
	}
	try {
		const model = initModel();

		const prompt =
			"Reset memory,Only provide the text contained in the captcha image.";

		const image = {
			inlineData: {
				data: file.split(",")[1],
				mimeType: "image/png",
			},
		};
		const result = await model.generateContent([prompt, image]);
		return {
			success: true,
			message: "Captcha solved",
			data: { text: result.response.text() },
		};
	} catch (error) {
		return { success: false, message: "Error occurred while solving captcha" };
	}
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "SOLVE_CAPTCHA") {
		const promise = new Promise((resolve, reject) =>
			chrome.tabs.captureVisibleTab(
				null,
				{ format: "png" },
				async (screenshotDataUrl) => {
					const res = await decodeCaptcha(screenshotDataUrl);
					if (res.success) {
						resolve(res.data.text.replace(/\s+/g, ""));
					} else {
						reject("Error occurred while solving captcha");
					}
				},
			),
		);
		promise.then((captcha) => {
			// console.log("captcha", captcha);
			sendResponse({
				success: true,
				message: "Captcha solved",
				data: { captcha },
			});
		});
		promise.catch((error) => {
			sendResponse({
				success: false,
				message: "Error occurred while solving captcha",
			});
		});
	}

	return true;
});
