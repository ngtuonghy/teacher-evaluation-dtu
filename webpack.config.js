const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

var fileExtensions = [
	"jpg",
	"jpeg",
	"png",
	"gif",
	"eot",
	"otf",
	"svg",
	"ttf",
	"woff",
	"woff2",
];

module.exports = {
	entry: {
		popup: path.join(__dirname, "src", "pages", "popup", "index.js"),
		content: path.join(__dirname, "src", "pages", "content", "index.js"),
		background: path.join(__dirname, "src", "pages", "background", "index.js"),
	},
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	optimization: {
		minimizer: [new CssMinimizerPlugin()],
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
					transform: (content, path) => {
						const manifest = JSON.parse(content.toString());
						manifest.version = process.env.npm_package_version;
						return JSON.stringify(manifest, null, 2);
					},
				},
				{ from: "./assets", to: "assets/" },
			],
		}),

		new HtmlWebpackPlugin({
			filename: "popup.html",
			template: "./src/pages/popup/popup.html",
			chunks: ["popup"],
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
			{
				test: /\.(?:js|mjs|cjs)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [["@babel/preset-env", { targets: "defaults" }]],
					},
				},
			},
		],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
		extensions: fileExtensions
			.map((extension) => "." + extension)
			.concat([".js", ".jsx", ".ts", ".tsx", ".css"]),
	},
};
