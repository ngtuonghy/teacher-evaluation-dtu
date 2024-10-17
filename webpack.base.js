const path = require("path");

const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const fileExtensions = [
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
	optimization: {
		minimizer: [new CssMinimizerPlugin()],
	},
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
			"@shared": path.resolve(__dirname, "packages/shared"),
		},
		extensions: fileExtensions
			.map((extension) => "." + extension)
			.concat([".js", ".jsx", ".ts", ".tsx", ".css"]),
	},
};
