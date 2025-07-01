import type { YMap } from '@yandex/ymaps3-types'

import { MapComponent } from './components/MapComponent'

const readyMaps: Record<string, YMap> = {}

const getMap = (mapID: string): YMap => readyMaps[mapID]

/*
TODO:
  1. Инициализация карты
  2. Изменение темы карты
  3. Добавление маркеров
  4. Добавление кластеров
  5. Добавление баллунов
*/

const initMaps = async (): Promise<void> => {
  const maps: NodeListOf<HTMLElement> = document.querySelectorAll('[data-map]')

  if (!maps.length) return

  if (typeof ymaps3 === 'undefined') {
    console.error('ymaps3 не загружен.')
    return
  }

  try {
    await ymaps3.ready
  } catch (error) {
    console.error('Ошибка при загрузке ymaps3:', error)
    return
  }

  maps.forEach((mapElement: HTMLElement) => {
    const mapID = mapElement.dataset.map

    if (readyMaps[mapID]) return

    const mapComponent = new MapComponent(mapElement)

    readyMaps[mapID] = mapComponent.getMap()
  })
}

export { initMaps, getMap }
