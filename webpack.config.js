const webpack = require('webpack');

module.exports = {
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

    // Define la ruta base de la API SITNA para la carga de recursos
    new webpack.DefinePlugin({
      SITNA_BASE_URL: JSON.stringify('assets/js/api-sitna')
    }),

  ]
};
