const path = require('path')

const config = {
	entry:'',
	output: {
		path: __dirname+'/dev/js',
		filename: '[name].js?v=[hash]'
	},
	devtool: 'cheap-module-source-map',
	module: {
		loaders: [
		    {
			    test: /\.js$/,
			    exclude: /(node_modules)/,
			    loader: 'babel-loader'
			},{ 
				test: /\.ejs$/, 
				loader: 'ejs-compiled-loader' 
			}

		]
	}
}
module.exports = config;