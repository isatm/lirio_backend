/**
 * Colores de portada que el usuario puede elegir en la app.
 * Es la única fuente de verdad en el servidor: el DTO valida contra esta
 * lista, así que añadir un color a la app implica añadirlo aquí.
 */
export const BANNER_PALETTE = [
  '#A81245',
  '#E8C9CE',
  '#DCC7A8',
  '#F4EEE7',
  '#292724',
  '#6E6B68',
  '#B4654A',
  '#7C7A54',
] as const;

export type BannerColor = (typeof BANNER_PALETTE)[number];
