const webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

const apiSitnaSource = 'node_modules/api-sitna';
const apiSitnaDestiny = 'assets/js/api-sitna';

module.exports = {
  output: {
    publicPath: '/'
  },
  
  resolve: {
    // Evita errores del tipo "Module not found" durante el empaquetamiento
    fallback: {
      assert: false,
      util: false,
      process: require.resolve('process/browser')
    }
  },

  plugins: [
    // Procesado de polyfill
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),

    // Copy api-sitna runtime files into the build output
    new CopyWebpackPlugin({
      patterns: [
        { from: apiSitnaSource, to: apiSitnaDestiny },
      ],
    }),
        // Define la ruta base de la API SITNA para la carga de recursos
    new webpack.DefinePlugin({
      SITNA_BASE_URL: JSON.stringify("/" + apiSitnaDestiny + "/")
    })
  ],
};
