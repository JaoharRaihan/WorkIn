module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Updated plugin path for react-native-reanimated with SDK 54
      // Note: Using worklets plugin as recommended for newer versions
      'react-native-reanimated/plugin',
    ],
  };
};
