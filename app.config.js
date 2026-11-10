// Completa app.json con datos que no se suben al repositorio.
// GOOGLE_MAPS_API_KEY sale de .env.local (en la computadora) o de las variables de EAS (en el build).
module.exports = ({ config }) => {
  const claveMapas = process.env.GOOGLE_MAPS_API_KEY;
  if (!claveMapas) return config;
  return {
    ...config,
    plugins: [...(config.plugins ?? []), ['react-native-maps', { androidGoogleMapsApiKey: claveMapas }]],
  };
};
