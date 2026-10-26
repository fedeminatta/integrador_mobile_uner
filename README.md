## Transporte Público

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Configurar api en local con Docker

1- https://github.com/franco-ruisdias-uner/api-proyectos-mobile.git
2- cd api-proyectos-mobile
3- git sparse-checkout set api-transporte-publico

## Comandos Docker

Levantar Docker (dentro de la carpeta de la api)

```bash
  docker compose up -d
```

Ver datos de la api

```bash
  Invoke-RestMethod http://localhost:3000/lineas
```

Otros recursos:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

- [Expo documentation](https://docs.expo.dev/)
