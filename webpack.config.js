const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');

module.exports = env => {

    var mode = env.production? 'production' : 'development';
    console.log("mode:", mode);
    var devMode = (mode !== 'production');
    console.log("devMode:", devMode);
    var plugins = [];
    
    // Add ActionSheetIOS shim for web
    plugins.push(new webpack.NormalModuleReplacementPlugin(
        /react-native\/Libraries\/ActionSheetIOS\/ActionSheetIOS\.js/,
        path.resolve(__dirname, 'web/ActionSheetIOS.web.js')
    ));
    
    if (!devMode) {
        plugins.push(new CleanWebpackPlugin());
        plugins.push(new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'web/index.html',
            hash: true
        }));
        plugins.push(new CompressionWebpackPlugin());
    }

    const webpack5esmInteropRule = {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false
      }
    };

    return {

        entry: ["@babel/polyfill", "./web/entry.js"],
        output: {
            path: path.join(__dirname, 'web/build'),
            filename: "bundle.js"
        },
        mode: mode,  // webpack v4
        module: {
            rules: [
                webpack5esmInteropRule,
                {
                    test:/\.(js|jsx|ts|tsx)$/,
                    include: [
                        /MyFliwer*/,
                        /MyFliwer[\\\/]node_modules[\\\/]react-native-material-ui*/,
                        /MyFliwer[\\\/]node_modules[\\\/]react-native-calendars*/,
                        path.resolve(__dirname, 'web'),
                    ],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', { targets: "defaults" }],
                                ['@babel/preset-react', { runtime: 'automatic' }]
                            ],
                            plugins: ['@babel/plugin-proposal-class-properties'],
                            compact: false
                        }
                    }
                },
                {
                    test: /(\.ttf|\.otf|\.woff)$/,
                    include: [
                        path.resolve(__dirname, "node_modules/react-native-vector-icons"),
                        path.resolve(__dirname, "node_modules/react-native-elements"),
                        path.resolve(__dirname, "./MyFliwer/assets/fonts/")
                    ],
                    use: {
                        loader: "url-loader"
                    }
                },
                {
                    test: /.(gif|jpe?g|png|svg)$/,
                    use: {
                      loader  : 'url-loader',
                      options: {
                        name: "[name].[ext]",
                        esModule: false,
                        limit: false
                      }
                    }
                },
                {
                    test: /\.mp4$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "[name].[ext]",
                                outputPath: "video"
                            }
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    include: [
                        path.resolve(__dirname, "node_modules/react-datepicker"),
                        path.resolve(__dirname, "node_modules/react-alice-carousel"),
                        path.resolve(__dirname, "node_modules/react-phone-input-2"),
                        path.resolve(__dirname, "./MyFliwer/app")
                    ],
    //                use: ['style-loader', 'css-loader'],  // webpack v3
                    use: [ // webpack v4
                        //{ loader: MiniCssExtractPlugin.loader },
                        { loader: 'style-loader' },
                        { loader: 'css-loader' }
                    ]
               }
            ]
        },
        resolve: {
            alias: {
                "react-native": path.resolve(__dirname, "web/react-native-web-with-shims.js"),
                "react-native-svg": "svgs",
                "react-native-maps": "react-native-web-maps",
                "victory-native": "victory",
                "react-native-actionsheet": path.resolve(__dirname, "web/react-native-actionsheet.web.js"),
                react: path.resolve("./node_modules/react")
            },
            extensions:['.web.js', '.js','.jsx']
        },

        // https://webpack.js.org/configuration/devtool/
    //    devtool: devMode ? 'eval-cheap-module-source-map' : 'source-map',
        devtool: devMode ? 'eval' : 'source-map',
        devServer: {
            devMiddleware: {
                publicPath: "/",
            },
            static: path.join(__dirname, 'web/build'),
            host: '0.0.0.0',
            port: 8082, // webpack v4
            headers: { "Access-Control-Allow-Origin": "*" },
            allowedHosts: 'all',
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                    runtimeErrors: (error) => {
                        // Don't show generic "Script error" messages
                        if (error.message && error.message.includes('Script error')) {
                            return false;
                        }
                        return true;
                    }
                }
            }
        },
        plugins: plugins

    };

};
