const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Notice we removed the { input: "./global.css" } part!
module.exports = withNativeWind(config);
