import { YMapCenterZoomLocation, YMapProps, YMapTheme } from '@yandex/ymaps3-types'

import themes from '../themes'

/**
 * Объект, содержащий все кастомные темы.
 */
export const customThemes: Record<string, any> = themes

type TCustomTheme = keyof typeof themes

export type TThemes = TCustomTheme | YMapTheme

/**
 * Интерфейс настройки карты.
 */
export interface IMapConfig extends Omit<YMapProps, 'theme'> {
  location: YMapCenterZoomLocation
  theme?: TThemes
}

/**
 * Объект, содержащий настройки карты по умолчанию.
 */
export const mapConfig: IMapConfig = {
  className: 'custom-map',
  location: {
    center: [37.617698, 55.755864], // Москва
    zoom: 10
  },
  camera: { tilt: 0 * (Math.PI / 180), azimuth: 0 * (Math.PI / 180) },
  mode: 'vector',
  behaviors: ['drag', 'dblClick', 'oneFingerZoom'],
  margin: [0, 0, 0, 0],
  theme: 'grayscale'
}

export interface IDefaultConfig {
  map: IMapConfig
}

export const defaultConfig: IDefaultConfig = {
  map: mapConfig
}
