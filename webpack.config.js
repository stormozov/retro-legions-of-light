import { relative, resolve, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

export default (env, argv) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const publicPath = argv.mode === 'production' ? '' : '/';

  return {
    output: {
      path: resolve(__dirname, 'dist'),
      publicPath: publicPath,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
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
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: { publicPath: publicPath },
            },
            'css-loader'
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
