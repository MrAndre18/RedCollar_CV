import type { YMap, YMapMarker } from '@yandex/ymaps3-types'

import mapMarkerSVG from '/images/svg/map-marker.svg?raw'

export interface IContactItem {
  href: string
  target?: string
  children?: {
    icon?: string
    text: string
  }
}

export interface IMarkerData {
  id?: string
  coords: string // строка вида "65.330356, 55.466866"
  title?: string
  subtitle?: string
  address?: string
  contacts?: IContactItem[]
  regions?: string
}

const parseCoords = (coordsStr: string): [number, number] => {
  const arr = coordsStr.split(',').map(v => parseFloat(v.trim()))
  return arr.length === 2 ? [arr[0], arr[1]] : [0, 0]
}

/**
 * Класс PopupMarkerComponent
 * - Принимает массив "markerData"
 * - Для каждого элемента создаёт YMapMarker
 * - В balloon.content подставляет HTML из шаблона <template>, заполняя поля
 */
class PopupMarkerComponent {
  private map: YMap
  private markerData: IMarkerData[]
  private markers: any[] = []
  private template: HTMLTemplateElement
  private currentOpenBalloon: HTMLElement | null = null

  /**
   * @param map экземпляр YMap
   * @param markerData массив данных о маркерах
   * @param balloonTemplateSelector селектор <template>, например "#balloonTmpl", "[data-map-template]" и т.д.
   */
  constructor(map: YMap, markerData: IMarkerData[]) {
    this.map = map
    this.markerData = markerData

    this.init()
  }

  /**
   * Инициализируем маркеры: создаём YMapMarker для каждого item.
   */
  private init(): void {
    this.template = document.querySelector('[data-map-template]')

    this.markerData.forEach(dataItem => {
      const marker = this.createMarker(dataItem)
      this.map.addChild(marker)
      this.markers.push(marker)
    })

    this.markers.forEach((marker: YMapMarker) => {
      marker.element.addEventListener('click', e => {
        e.stopPropagation()
        this.handleMarkerClick(marker)
      })
    })
  }

  /**
   * Создаём YMapMarker с balloon.content = HTML, полученным из шаблона.
   */
  private createMarker(dataItem: IMarkerData): any {
    const coords = parseCoords(dataItem.coords)

    if (!coords.length) return

    const markerElement = document.createElement('button')

    markerElement.innerHTML = mapMarkerSVG
    markerElement.classList.add('map__marker')
    markerElement.dataset.mapMarker = ''

    // Создаем маркер
    const marker = new ymaps3.YMapMarker({ coordinates: coords }, markerElement)
    const balloonEl = this.createBalloon(dataItem)
    balloonEl.style.display = 'none'
    marker.element.appendChild(balloonEl)

    markerElement.addEventListener('click', e => {
      e.stopPropagation()

      const target = e.target as HTMLElement,
        closeBtn = balloonEl.querySelector('[data-map-template=close]')

      if (
        target === balloonEl ||
        (balloonEl.contains(target) && target !== closeBtn && !closeBtn.contains(target))
      )
        return

      this.toggleBalloon(balloonEl)
    })

    return marker
  }

  private handleMarkerClick(marker: YMapMarker) {
    this.markers.forEach((m: YMapMarker) => {
      m.element.classList.remove('active')

      if (m !== marker) {
        m.update({ zIndex: 0 })
      }
    })

    marker.update({ zIndex: 1 })
  }

  private createBalloon(data: IMarkerData): HTMLElement {
    const templateClone = this.template.content.cloneNode(true) as HTMLElement,
      templateContent: HTMLElement = templateClone.querySelector('[data-map-template=container]')

    if (!templateContent) return

    data.title
      ? (templateContent.querySelector('[data-map-template=title]').innerHTML = data.title)
      : templateContent.querySelector('[data-map-template=title]').remove()
    data.subtitle
      ? (templateContent.querySelector('[data-map-template=subtitle]').innerHTML = data.subtitle)
      : templateContent.querySelector('[data-map-template=subtitle]').remove()
    data.address
      ? (templateContent.querySelector('[data-map-template=address]').innerHTML = data.address)
      : templateContent.querySelector('[data-map-template=address]').remove()

    if (data.contacts) {
      const linkTemplate: HTMLLinkElement = templateContent.querySelector(
          '[data-map-template=contacts-link]'
        ),
        linkTemplateClone = linkTemplate.cloneNode(true) as HTMLLinkElement

      templateContent.querySelector('[data-map-template=contacts]').innerHTML = ''

      data.contacts.forEach(contact => {
        const link = linkTemplateClone.cloneNode(true) as HTMLLinkElement
        link.href = contact.href
        link.target = contact.target

        const linkIcon: HTMLImageElement = link.querySelector(
            '[data-map-template=contacts-link-img]'
          ),
          linkText: HTMLElement = link.querySelector('[data-map-template=contacts-link-text]')
        linkIcon.src = contact.children.icon
        linkText.textContent = contact.children.text

        templateContent.querySelector('[data-map-template=contacts]').appendChild(link)
      })
    } else {
      templateContent.querySelector('[data-map-template=contacts]').remove()
    }

    if (data.regions) {
      const regionsLink: HTMLLinkElement = templateContent.querySelector(
        '[data-map-template=regions]'
      )
      regionsLink.href = data.regions
    } else {
      templateContent.querySelector('[data-map-template=regions]').remove()
    }

    return templateContent
  }

  private toggleBalloon(balloonEl: HTMLElement) {
    // Если уже открыт какой-то другой
    if (this.currentOpenBalloon && this.currentOpenBalloon !== balloonEl) {
      this.hideBalloon(this.currentOpenBalloon)
    }

    if (balloonEl.style.display === 'none') {
      // Открываем
      balloonEl.style.display = ''
      this.currentOpenBalloon = balloonEl
    } else {
      // Скрываем
      this.hideBalloon(balloonEl)
      this.currentOpenBalloon = null
    }
  }

  private hideBalloon(balloonEl: HTMLElement) {
    balloonEl.style.display = 'none'
  }
}

export { PopupMarkerComponent }
