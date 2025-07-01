import Accordion from 'accordion-js'
import 'accordion-js/dist/accordion.min.css'

let accordionInstances = []

const accordionInit = () => {
  const accordionEls = [...document.querySelectorAll('[data-accordion-container]')]

  if (!accordionEls.length) return

  const baseOptions = {
    duration: 500,
    showMultiple: true,
    elementClass: 'accordion',
    triggerClass: 'accordion__trigger',
    activeClass: 'active',
    panelClass: 'accordion__content'
  }

  for (const element of accordionEls) {
    const options = {
      ...baseOptions,
      showMultiple: element.dataset.multiple === 'true'
    }

    const instance = new Accordion(element, options)
    accordionInstances.push(instance)

    const accordionItems = element.querySelectorAll('[data-accordion]')

    accordionItems.forEach((item, itemIndex) => {
      item.dataset.expanded === 'true' && instance.open(itemIndex)
    })
  }
}

accordionInit()
