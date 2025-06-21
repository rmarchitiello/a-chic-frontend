const TerserPlugin = require('terser-webpack-plugin');

module.exports = (config, options) => {
  // fallback nel caso configuration sia undefined
  const isProd = process.env.NODE_ENV === 'production' || config.mode === 'production';

  console.log(">> CUSTOM WEBPACK CONFIG ACTIVE <<", {
    mode: config.mode,
    nodeEnv: process.env.NODE_ENV,
    optionsConfiguration: options.configuration
  });

  if (isProd) {
    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              global_defs: {
                ngDevMode: false
              }
            }
          }
        })
      ]
    };
  }

  return config;
};
