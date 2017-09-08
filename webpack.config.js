var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var DashboardPlugin = require('webpack-dashboard/plugin');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var StringReplacePlugin = require("string-replace-webpack-plugin");
var loaderUtils = require("loader-utils");
var CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var ENV = process.env.NODE_ENV;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'production';

/**
 * OS Platform
 * Decide browser name for open browser automatic
 */
var isWin = /^win/.test(process.platform);
var isOSX = /^darwin/.test(process.platform);
var browserName = isWin ? 'chrome' : isOSX ? 'google chrome' : 'google-chrome';

var basePlugins = [
    new StringReplacePlugin(),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        filename: isProd ? 'scripts/common.[hash].js' : 'scripts/common.js'
    }),
    new HtmlWebpackPlugin({
        template: './src/index.html',
        minify: isProd ? {
            removeComments: true,
            collapseBooleanAttributes: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true
        } : {},
        inject: false
    }),
    new ExtractTextPlugin({
        filename: isProd ? "css/[name].[contenthash].bundle.css" : "css/[name].bundle.css",
        allChunks: true
    }),
    new CopyWebpackPlugin([{ from: './src/mock', to: 'mock' }, {from: './src/images', to: 'images'}])
];

var devPlugins = [
    new webpack.HotModuleReplacementPlugin(),
    new OpenBrowserPlugin({
        url: 'http://localhost:8384/www/',
        browser: browserName
    })
];

var prodPlugins = [
    new webpack.DefinePlugin({
        "process.env": {
            // This has effect on the react lib size
            "NODE_ENV": JSON.stringify("production")
        }
    }),
    new webpack.optimize.UglifyJsPlugin({
        minimize: true
    })
];

var webpackConfig = {
    entry: isProd ? {
        app: ["./src/app.tsx"]
    } : {
        // app: ['webpack-dev-server/client?http://0.0.0.0:8384', 'webpack/hot/only-dev-server', './src/app.tsx']
        app: ["react-hot-loader/patch", "./src/app.tsx"]
    },
    output: {
        path: __dirname + "/www",
        publicPath: './',
        filename: isProd ? 'scripts/[name].[hash].bundle.js' : 'scripts/[name].bundle.js',
        chunkFilename: isProd ? 'scripts/[id].[name].[chunkhash].chunk.js' : 'scripts/[id].[name].chunk.js',
        sourceMapFilename: '[file].map',
        pathinfo: isProd ? false : true
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: isProd ? "nosources-source-map" : "eval-source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {   test: /\.tsx?$/,
                // loaders: ["babel-loader", "ts-loader"],
                use: [
                    {
                        loader: StringReplacePlugin.replace({
                                replacements: [
                                    {
                                        pattern: /_import\(/ig,
                                        replacement: function (match, p1, offset, string) {
                                            return 'import(';
                                        }
                                    }
                                ]})
                    },
                    {
                        loader: 'babel-loader'
                    },
                    // {
                    //     loader: 'string-replace-loader',
                    //     options: {
                    //         search: '_import\\(',
                    //         replace: 'import(',
                    //         flags: 'g'
                    //     }
                    // },
                    {
                        loader: 'ts-loader'
                    },
                ],
                include: path.join(__dirname, 'src')
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            // { enforce: "post", test: /\.tsx?$/, loader: 'string-replace-loader',
            //     options: {
            //         search: '_import\\(',
            //         replace: 'import(',
            //         flags: 'g'
            //     }
            // },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            {
                // CSS LOADER
                // Reference: https://github.com/webpack/css-loader
                // Allow loading css through js
                //
                // Reference: https://github.com/postcss/postcss-loader
                // Postprocess your css with PostCSS plugins
                test: /\.css$/,
                // Reference: https://github.com/webpack/extract-text-webpack-plugin
                // Extract css files in production builds
                //
                // Reference: https://github.com/webpack/style-loader
                // Use style-loader in development.
                // include: path.resolve(__dirname, "src/css"),
                // loader: isProd ? 'null' : ExtractTextPlugin.extract({
                //     fallback: 'style',
                //     use: 'css?sourceMap',
                //     publicPath: "../"
                // })
                use: isTest ? 'null' : ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader?sourceMap'],
                    publicPath: "../"
                })
            },
            {
                // ASSET LOADER
                // Reference: https://github.com/webpack/file-loader
                // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
                // Rename the file using the asset hash
                // Pass along the updated reference to your code
                // You can add here any file extension you want to get copied to your output
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|otf|ttf)$/,
                use: [{
                    loader: 'url-loader?limit=100000'
                }]
            },
            {
                test: /\.(ttf)$/,
                use: [{
                    loader: 'file-loader?name=css/font/[hash].[ext]'
                }]
            },
            {
                test: /\.scss$/,
                use: isTest ? ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                                modules: true,
                                localIdentName: '[path]__[name]__[local]__[hash:base64:5]',
                                getLocalIdent: (context, localIdentName, localName, options) => {
                                    console.log("getLocalIdent : " + context + " " + localIdentName +
                                        " " + localName + " " + options);
                                    console.log("getLocalIdent : " + context.resourcePath + " " + context.resource +
                                        " " + options.context);
                                    switch (localName.substr(0, 4)) {
                                        case "ant-":
                                            console.log("ant-: " + localName);
                                            return localName;
                                        default:
                                            if (!options.context)
                                                options.context = context.options && typeof context.options.context === "string" ? context.options.context : context.context;
                                            var request = path.relative(options.context, context.resourcePath);
                                            options.content = options.hashPrefix + request + "+" + localName;
                                            localIdentName = localIdentName.replace(/\[local\]/gi, localName);
                                            var hash = loaderUtils.interpolateName(context, localIdentName, options);
                                            return hash.replace(new RegExp("[^a-zA-Z0-9\\-_\u00A0-\uFFFF]", "g"), "-").replace(/^((-?[0-9])|--)/, "_$1");
                                    }
                                }
                            }
                        },
                        {loader: 'sass-loader'}],
                    publicPath: "../"
                }) : ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                                modules: true,
                                localIdentName: '[path]__[name]__[local]__[hash:base64:5]',
                                getLocalIdent: (context, localIdentName, localName, options) => {
                                    console.log("getLocalIdent : " + context + " " + localIdentName +
                                        " " + localName + " " + options);
                                    console.log("getLocalIdent : " + context.resourcePath + " " + context.resource +
                                        " " + options.context);
                                    switch (localName.substr(0, 4)) {
                                        case "ant-":
                                            console.log("ant-: " + localName);
                                            return localName;
                                        default:
                                            if (!options.context)
                                                options.context = context.options && typeof context.options.context === "string" ? context.options.context : context.context;
                                            var request = path.relative(options.context, context.resourcePath);
                                            options.content = options.hashPrefix + request + "+" + localName;
                                            localIdentName = localIdentName.replace(/\[local\]/gi, localName);
                                            var hash = loaderUtils.interpolateName(context, localIdentName, options);
                                            return hash.replace(new RegExp("[^a-zA-Z0-9\\-_\u00A0-\uFFFF]", "g"), "-").replace(/^((-?[0-9])|--)/, "_$1");
                                    }
                                }
                            }
                        },
                        {loader: 'sass-loader'}],
                    publicPath: "../"
                })
            }

            // {
            //   // HTML LOADER
            //   // Reference: https://github.com/webpack/raw-loader
            //   // Allow loading html through js
            //   test: /\.html$/,
            //   loader: 'raw'
            // }
        ]
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "redux" : "Redux",
        "react-redux": "ReactRedux"
    },
    plugins: isProd ? basePlugins.concat(prodPlugins) : basePlugins.concat(devPlugins),
    devServer: {
        publicPath: "/www/",
        compress: true,
        port: 8384,
        historyApiFallback: {
            index: "/www/index.html"
        },
        hot: true,
        stats: {
            colors: true
        }
    }
    // isProd: isProd,
    // isTest: isTest
};

module.exports = webpackConfig;
