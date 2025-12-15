module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from', // Required for react-native-gifted-chat
    'react-native-reanimated/plugin', // Keep this LAST
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
