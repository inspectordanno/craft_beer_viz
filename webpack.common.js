//run webpack-dev-server --content-base dist
//https://webpack.github.io/docs/configuration.html
const path = require('path');
const webpack = require('webpack');


module.exports = {
	plugins:[
		new webpack.ProvidePlugin({
		  $: "jquery",
		  jQuery: "jquery",
			'window.jQuery': 'jquery'
		})
	],
	entry:[
		'./src/index.js',
		'./src/index.html'
	],
	output:{
		path: path.resolve(__dirname,'dist'),
		filename:'bundle.js'
	},
	module:{
		rules:[
			{
				test: /\.jsx?$/,
				include: path.resolve(__dirname,'src'),
				use:{
					loader:'babel-loader',
					options:{
						presets:['es2015','react','stage-2']
					}
				}
			},
			{
				test: /\.scss$/,
				use:[
					'style-loader',
					'css-loader',
					'sass-loader'
				]
      },
      {
        test: /\.svg/,
        use: {
            loader: 'svg-url-loader',
            // options: {}
        }
      },
			{ test: /\.woff(\d+)?$/, loader: 'url-loader?prefix=font/&limit=5000&mimetype=application/font-woff' },
         	{ test: /\.ttf$/, loader: 'file-loader?prefix=font/' },
         	{ test: /\.eot$/, loader: 'file-loader?prefix=font/' },
         	{ test: /\.svg$/, loader: 'file-loader?prefix=font/' },
         	{ test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff"},
         	{ test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
         	{ test: /\.(png|svg|jpg|gif)$/, loader:"file-loader"},
         	{ test: /\.html$/, loader: 'file-loader?name=[name].[ext]'}
		]
	}
}
