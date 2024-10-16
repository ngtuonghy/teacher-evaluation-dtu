import { GoogleGenerativeAI } from "@google/generative-ai";

function initModel(apiKey) {
	const key = apiKey || "AIzaSyBLKNgAbOdeNg2ffIWVV3SaTZSIQdK4-bM";
	const genAI = new GoogleGenerativeAI(key);
	const model = genAI.getGenerativeModel({
		model: "gemini-1.5-flash",
	});
	return model;
}
export { initModel };
