const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const common = require("../../webpack.base.js"); // Nhập cấu hình chung
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
	...common,
	entry: {
		popup: path.join(__dirname, "src", "pages", "popup", "index.js"),
		content: path.join(__dirname, "src", "pages", "content", "index.js"),
		background: path.join(__dirname, "src", "pages", "background", "index.js"),
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: "[name].bundle.css",
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "src/manifest.json",
					to: "manifest.json",
					force: true,
					transform: (content) => {
						const manifest = JSON.parse(content.toString());
						manifest.version = process.env.npm_package_version;
						return JSON.stringify(manifest, null, 2);
					},
				},
				{ from: "../../packages/shared/assets/", to: "assets/" },
			],
		}),
		new HtmlWebpackPlugin({
			filename: "popup.html",
			template: "../../packages/shared/popup/popup.html",
			chunks: ["popup"],
		}),
	],
};
