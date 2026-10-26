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

## Crear .env

1- Abrir una terminal y ejecutar `ipconfig` , copiar de Adaptador de Ethernet el ipv4
2- en el .env crear EXPO_PUBLIC_API_URL=http://(tu ip):3000
3- testear abriendo en el celular la url/salud ej : http://192.168.18.112:3000/salud .Deberia devolver el estado:ok

Otros recursos:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

- [Expo documentation](https://docs.expo.dev/)
