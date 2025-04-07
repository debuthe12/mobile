module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@store': './src/store',
          '@utils': './src/utils',
          '@assets': './src/assets',
          '@hooks': './src/hooks',
          '@pages': './src/pages',
          '@routes': './src/routes',
          '@services': './src/services',
          '@styles': './src/styles',
          '@types': './src/types',
          '@navigation': './src/navigation',
          '@screens': './src/screens',     
        },
      },
    ],
  ],
};