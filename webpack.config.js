const path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development", // Change to "production" for optimized builds
  entry: {
    marks: "./src/marks.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "lib"),
    library: "marks",
    libraryTarget: "umd",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(), // Replaces 'make clean'
  ],
  resolve: {
    extensions: [".js"],
  },
  devtool: "source-map",
};
