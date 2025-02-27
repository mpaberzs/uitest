import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

const webpackConfig = (env: any) => ({
  target: 'web',
  entry: './src/index.tsx',
  devtool: 'source-map',
  ...(env.production || !env.development ? {} : { devtool: 'eval-source-map' }),
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  output: {
    // FIXME: __dirname didn't work
    // path: path.join(__dirname, "/build"),
    path: path.resolve(process.cwd(), 'build'),
    filename: 'index.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
        exclude: /dist/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.PRODUCTION': env.production || !env.development,
      // "process.env.NAME": JSON.stringify(require("./package.json").name),
      // "process.env.VERSION": JSON.stringify(require("./package.json").version)
    }),
    new ForkTsCheckerWebpackPlugin({
      // eslint: {
      //     files: "./src/**/*.{ts,tsx,js,jsx}" // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
      // }
    }),
  ],
  devServer: {
    historyApiFallback: true,
  },
});

export default webpackConfig;
