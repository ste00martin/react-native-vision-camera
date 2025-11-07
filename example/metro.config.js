const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const path = require('path')
const escape = require('escape-string-regexp');
const pak = require('../package/package.json')

const root = path.resolve(__dirname, '..')
const modules = Object.keys({ ...pak.peerDependencies })

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [root],

  watcher: {
    healthCheck: {
      enabled: true,
    },
  },

  // We need to make sure that only one version is loaded for peerDependencies
  // So we block them at the root, and alias them to the versions in example's node_modules
  resolver: {
    blockList: modules.map(
      (m) =>
        new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
    ),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name)
      return acc
    }, {
      // Add additional dependencies that need to be resolved from example's node_modules
      'react-native-gesture-handler': path.join(__dirname, 'node_modules', 'react-native-gesture-handler'),
    }),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
}

const mergedConfig = mergeConfig(getDefaultConfig(__dirname), config)

// Ensure projectRoot and watchFolders are explicitly set
mergedConfig.projectRoot = __dirname
mergedConfig.watchFolders = [root]

// Reset cache on startup to avoid stale cache issues
mergedConfig.resetCache = true

module.exports = mergedConfig
