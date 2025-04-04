const path = require("path");

module.exports = {
  mode: "development", // Change to "production" for optimized builds
  entry: {
    marks: "./src/marks.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "lib"),
    library: "marks-pane",
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
  resolve: {
    extensions: [".js"],
  },
  devtool: "source-map",
};
