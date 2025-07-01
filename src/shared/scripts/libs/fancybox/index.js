import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import { scrollManager } from '@shared/scripts/libs/lenis/lenis'

import './fancybox.scss'

const fancyboxInit = () => {
  Fancybox.bind('[data-fancybox]', {
    Toolbar: false,
    idle: false,
    closeButton: 'top',
    Images: {
      zoom: false
    },
    Thumbs: {
      type: 'classic'
    },
    keyboard: {
      ArrowRight: 'next',
      ArrowLeft: 'prev',
      Escape: 'close'
    },
    Carousel: {
      Navigation: false
    },
    on: {
      initCarousel: fancybox => {
        const slidesCount = fancybox.userSlides.length

        scrollManager.disableScroll()

        const controlsTemplate = document.querySelector('[data-fancybox-controls-template]')
        if (!controlsTemplate) return

        const controls = controlsTemplate.content
          .cloneNode(true)
          .querySelector('[data-fancybox-controls]')

        fancybox.container.appendChild(controls)

        const closeBtn = controls.querySelector('[data-fancybox-button="close"]')
        const prevBtn = controls.querySelector('[data-fancybox-button="prev"]')
        const nextBtn = controls.querySelector('[data-fancybox-button="next"]')

        closeBtn.addEventListener('click', () => fancybox.close())

        if (slidesCount <= 1) {
          prevBtn.style.display = 'none'
          nextBtn.style.display = 'none'
        } else {
          prevBtn.addEventListener('click', () => fancybox.prev())
          nextBtn.addEventListener('click', () => fancybox.next())
        }

        const handleGlobalKeyDown = e => {
          if (e.key === 'Escape') {
            e.stopPropagation()
            e.preventDefault()
            fancybox.close()
          }
        }

        window.addEventListener('keydown', handleGlobalKeyDown)

        fancybox.on('close', () => {
          window.removeEventListener('keydown', handleGlobalKeyDown)
          scrollManager.enableScroll()
        })
      },
      close: () => {
        scrollManager.enableScroll()
      }
    }
  })
}

const fancyboxDestroy = () => {
  Fancybox.unbind('[data-fancybox]')
  Fancybox.close()
}

export { fancyboxInit, fancyboxDestroy }
