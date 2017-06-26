const path = require('path')
const runtime = require('babel-plugin-transform-runtime')
const es2015 = require('babel-preset-es2015')

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
			    loader: 'babel-loader',
			    options: {
			        presets: [[es2015]],
			        plugins: [runtime]
			    }
			},{ 
				test: /\.ejs$/, 
				loader: 'ejs-compiled-loader' 
			}

		]
	}
}
module.exports = config;