import { relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

export default (env, argv) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const isProduction = argv.mode === 'production';
  const publicPath = isProduction ? '' : '/';
  const cssPlugin = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';

  return {
    output: {
      path: resolve(__dirname, 'dist'),
      publicPath: publicPath,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.tsx', '.ts'],
    },
    module: {
      rules: [
        {
          test: /\.(?:js|ts)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
            },
          ],
        },
        {
          test: /\.(scss|css)$/i,
          use: [
            cssPlugin,
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: (pathData) => {
              const relativePath = relative(resolve(__dirname, 'src'), pathData.filename)
                .replace(/\\/g, '/');
              return `assets/${relativePath}`;
            },
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: (pathData) => {
              const relativePath = relative(resolve(__dirname, 'src'), pathData.filename)
                .replace(/\\/g, '/');
              return `assets/${relativePath}`;
            },
          },
        }
      ],
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: './src/index.html',
        filename: './index.html',
      }),
      new MiniCssExtractPlugin({
        filename: 'styles.css',
      }),
      new CleanWebpackPlugin(),
    ],
    optimization: {
      minimizer: [
        new TerserPlugin(),
        new CssMinimizerPlugin(),
      ],
    },
  };
};
