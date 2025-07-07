const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    library: {
      name: 'FormValidation',
      type: 'umd',
    },
    globalObject: 'this',
    clean: true,
  },
  resolve: {
    extensions: ['.ts'],
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            unused: true,
            dead_code: true,
            drop_debugger: true,
            drop_console: true,
            pure_funcs: ['console.log'],
          },
          format: {
            comments: false,
          },
          keep_fnames: true,
        },
      }),
    ],
  },
};
