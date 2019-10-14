const path = require('path');

module.exports = {
	entry: './assets/javascripts/piper-client/client.js',
	devtool: 'source-map',
	mode: 'production',

	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},

	module: {
		rules: [
			// babel minifier
			{

				test: /\.js$/,
				exclude: /(node_modules)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],

						},
					},

					{ loader: 'eslint-loader' },
				]
			},
		],
	},
};
