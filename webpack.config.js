const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');


const getEntry = function (globPath, pathDir) {
	let files = glob.sync(globPath);
	let entries = {},
			entry, dirname, basename, pathname, extname;

	for (let i = 0; i < files.length; i++) {
		entry = files[i];
		dirname = path.dirname(entry);
		extname = path.extname(entry);
		basename = path.basename(entry, extname);
		pathname = path.join(dirname, basename);
		pathname = pathDir ? pathname.replace(pathDir, '') : pathname;
		// console.log(2, pathname, entry);
		entries[pathname] = './' + entry;
	}
	return entries;
}

let htmls = getEntry('./src/*.html', 'src\\');
let entries = {};
let HtmlPlugin = [];
let pathDir = '';
if (process.env.NODE_ENV === 'development'){
	pathDir = '/dist';
}
for (let key in htmls) {
	entries[key] = htmls[key].replace('.html', '.js')
	HtmlPlugin.push(new HtmlWebpackPlugin({
		filename: (key == 'index' ? pathDir+'index.html' : pathDir+key + '.html'), 
		template: htmls[key],
		cache: true,
		inject: true,
		// chunks: [key]
	}));
}

module.exports = {
	entry: __dirname + '/src/main.js',
	output: {
		path: __dirname+'/dist',
		filename: 'js/bundle.js?[chunkhash]',
		chunkFilename: 'js/[id].js?[chunkhash]'
	},
	module: {
		rules: [{
				test: /\.html$/,
				use: [{
					loader: 'html-loader',
					options: {
						// root: '/',
						minimize: false,
						interpolate: 'require'
					}
				}],
			},{
				// 开启es6编译
				test: /\.js$/,
				include: /src/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},{
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'file-loader',
				options: {
					name: 'img/[name].[ext]?[hash]'
				}
			}
		]
	},
	plugins: HtmlPlugin,
	devServer: {
		compress: true,
		historyApiFallback: true, // 不跳转
		inline: true, // 实时刷新
		hot: true,
		// noInfo: true,
	}
}



if (process.env.NODE_ENV === 'production') {
	console.log('build');
	// module.exports.output.publicPath = './';
	let ExtractTextPlugin = require("extract-text-webpack-plugin");
	module.exports.module.rules = (module.exports.module.rules || []).concat([
		{
			test: /\.css$/,
			use: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: "css-loader?minimize"  // 默认不开启css的压缩，使用minimize参数进行压缩配置
			})
		},{
			test: /\.scss$/,
			use: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: "css-loader?minimize!sass-loader"  // 默认不开启css的压缩，使用minimize参数进行压缩配置
			})
		},
	]);
	module.exports.plugins = (module.exports.plugins || []).concat([
		new CleanWebpackPlugin(['dist', 'build'], {
			// root: ROOT_PATH,
			verbose: true,
			dry: false,
			//exclude: ["dist/1.chunk.js"]
		}),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
			compress: {
				warnings: false
			}
		}),
		new ExtractTextPlugin("css/[name].css?[contenthash]"),
		// new webpack.LoaderOptionsPlugin({
		// 	minimize: true
		// })
	])
}else if(process.env.NODE_ENV === 'development'){
	console.log('dev');
	module.exports.devtool = '#eval-source-map';
	module.exports.module.rules = (module.exports.module.rules || []).concat([
		{
			test: /\.css$/,
			loader: ['style-loader','css-loader'] // 添加对样式表的处理
		},
		{
			test: /\.scss$/,
			loader: ['style-loader','css-loader','sass-loader'] // 添加对样式表的处理
		},
	]);
	module.exports.plugins = (module.exports.plugins || []).concat([
		new webpack.HotModuleReplacementPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			compress: {
				warnings: false
			}
		}),
		new webpack.NamedModulesPlugin()
	]);
}