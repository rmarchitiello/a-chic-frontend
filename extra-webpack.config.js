const TerserPlugin = require('terser-webpack-plugin');

module.exports = (config) => {
  config.optimization = {
    ...config.optimization,
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
  return config;
};
