const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Use __dirname (lowercase) for correct path resolving on Windows/CommonJS
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
