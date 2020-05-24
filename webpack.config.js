const path = require("path");
const dist = path.join(__dirname, "dist");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const webpack = require('webpack');

const unif = {
  entry: "./src/Editor/Editor.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [
          /node_modules/,
          /lib/,
          /dist/,
        ],
      },
      {
        test: /\.grf$/,
        use: "raw-loader",
        exclude: [
          /node_modules/,
          /lib/,
          /dist/,
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  optimization: {
    minimize: false,
  },
  devServer: {
    contentBase: dist,
    overlay: true,
    port: 1621,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Unification",
      filename: "index.html",
    }),
    new MonacoWebpackPlugin(),
  ],
  // devtool: 'source-map'
};

const lib = {
  entry: "./src/lib.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [
          /node_modules/,
          /lib/,
          /dist/,
          /TRSs/,
          /cli/
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  optimization: {
    minimize: true,
  },
  output: {
    filename: "grf.js",
    path: dist,
    library: "grf",
    libraryTarget: "umd",
    globalObject: "globalThis",
  },
  // devtool: 'source-map'
};

const grfc = {
  entry: "./cli/grfc.ts",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [
          /node_modules/,
          /lib/,
          /dist/,
          /TRSs/,
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
  ],
  optimization: {
    minimize: true,
  },
  output: {
    filename: "grfc.js",
  },
  // devtool: 'source-map'
};

// module.exports = [unif];
// module.exports = [lib, grfc];
module.exports = [grfc];
