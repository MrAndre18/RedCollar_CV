import type { YMap, YMapTheme } from '@yandex/ymaps3-types'

import { IMapConfig, TThemes, customThemes, mapConfig } from '../config'
import { PopupMarkerComponent } from './MarkerBalloonComponent'

class MapComponent {
  private map: YMap
  private config: IMapConfig

  constructor(mapElement: HTMLElement) {
    this.config = JSON.parse(JSON.stringify(mapConfig))

    this.overrideConfigFromDataAttributes(mapElement)

    this.initMap(mapElement)
  }

  /** Переопределяет настройки карты на основе data-атрибутов элемента
   * @param mapElement HTML элемент карты
   */
  private overrideConfigFromDataAttributes(mapElement: HTMLElement): void {
    const center: number[] = mapElement.dataset?.mapCenter?.split(',').map(el => +el) || [],
      zoom: number = +mapElement.dataset?.mapZoom,
      theme: string = mapElement.dataset?.mapTheme

    if (center.length) this.config.location.center = [center[0], center[1]]

    if (zoom > 0) this.config.location.zoom = zoom

    if (theme) this.config.theme = theme as TThemes
  }

  private addThemeLayer(): void {
    const theme = this.config.theme ?? 'light'

    // Если это "blue", "grayscale" и т. п. (ключ есть в customThemes)
    if (theme in customThemes) {
      this.map.addChild(
        new ymaps3.YMapDefaultSchemeLayer({
          visible: true,
          customization: customThemes[theme]
        })
      )
    } else {
      // Считаем, что это одна из стандартных тем YMaps3 (light, dark, ...)
      this.map.addChild(
        new ymaps3.YMapDefaultSchemeLayer({
          visible: true,
          theme: theme as YMapTheme // здесь подходит "light", "dark", "smoothLight" и т.д.
        })
      )
    }

    this.map.addChild(new ymaps3.YMapDefaultFeaturesLayer({ visible: true }))
  }

  private addMarkers = (mapElement: HTMLElement): void => {
    const markersDataSelector = mapElement.dataset?.mapMarkers
    const markersDataEl = document.querySelector(
      `input[name=${markersDataSelector}]`
    ) as HTMLInputElement

    if (!markersDataEl) return

    const markersData = JSON.parse(markersDataEl.value)

    const markers = new PopupMarkerComponent(this.map, markersData)
  }

  private initControllers(mapElement: HTMLElement): void {
    const mapID = mapElement.dataset.map,
      decreaseZoom = document.querySelector(`[data-map-decrease=${mapID}]`),
      increaseZoom = document.querySelector(`[data-map-increase=${mapID}]`)

    if (!decreaseZoom || !increaseZoom) return

    decreaseZoom.addEventListener('click', () => {
      this.map.update({ location: { zoom: this.map.zoom - 0.5 } })
    })

    increaseZoom.addEventListener('click', () => {
      this.map.update({ location: { zoom: this.map.zoom + 0.5 } })
    })
  }

  /** Инициализирует карту с заданными настройками
   * @param mapElement HTML элемент карты
   */
  private initMap(mapElement: HTMLElement): void {
    const { theme, ...restConfig } = this.config

    this.map = new ymaps3.YMap(mapElement, restConfig)

    this.addThemeLayer()

    this.addMarkers(mapElement)

    this.initControllers(mapElement)
  }

  /** Возвращает экземпляр карты */
  public getMap(): YMap {
    return this.map
  }
}

export { MapComponent }
