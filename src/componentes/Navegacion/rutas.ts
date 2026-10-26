import { Href } from 'expo-router';

import { NombreIcono } from '@/componentes/Icono/Icono';

export type Ruta = {
  nombre: string;
  href: Href;
  ruta: string;
  titulo: string;
  icono: NombreIcono;
  iconoActivo: NombreIcono;
};

// Páginas principales: aparecen en la barra de tabs y en el menú lateral.
export const rutasPrincipales: Ruta[] = [
  { nombre: 'index', href: '/', ruta: '/', titulo: 'Inicio', icono: 'home-outline', iconoActivo: 'home' },
  { nombre: 'lineas', href: '/lineas', ruta: '/lineas', titulo: 'Líneas', icono: 'bus-outline', iconoActivo: 'bus' },
  { nombre: 'paradas', href: '/paradas', ruta: '/paradas', titulo: 'Paradas', icono: 'location-outline', iconoActivo: 'location' },
  { nombre: 'avisos', href: '/avisos', ruta: '/avisos', titulo: 'Avisos', icono: 'notifications-outline', iconoActivo: 'notifications' },
];

export const rutasCuenta: Ruta[] = [
  { nombre: 'login', href: '/login', ruta: '/login', titulo: 'Iniciar sesión', icono: 'log-in-outline', iconoActivo: 'log-in' },
  { nombre: 'registro', href: '/registro', ruta: '/registro', titulo: 'Crear cuenta', icono: 'person-add-outline', iconoActivo: 'person-add' },
];

export const rutaAjustes: Ruta = {
  nombre: 'ajustes',
  href: '/ajustes',
  ruta: '/ajustes',
  titulo: 'Ajustes',
  icono: 'settings-outline',
  iconoActivo: 'settings',
};

const todas = [...rutasPrincipales, ...rutasCuenta, rutaAjustes];

export function tituloDeRuta(pathname: string): string {
  return todas.find((r) => r.ruta === pathname)?.titulo ?? 'Paran';
}
