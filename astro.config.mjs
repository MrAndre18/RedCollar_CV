// @ts-check
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'
import fs from 'fs/promises'
import path, { resolve } from 'node:path'
import url from 'node:url'

const isDevBuild = process.env.CI_ENV === 'dev'
const basePath = '/'

const timestamp = Date.now()

const outDir = resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'dist')
const pagesDir = resolve(outDir, 'pages')

fs.mkdir(pagesDir, { recursive: true }).catch(err => {
  console.error('Ошибка при создании папки pages:', err)
})

const removeEmptyDirs = async dirPath => {
  try {
    const files = await fs.readdir(dirPath)

    if (files.length === 0) {
      await fs.rmdir(dirPath)
      console.log(`Удалена пустая папка: ${dirPath}`)
    }
  } catch (error) {
    console.error('Ошибка при удалении пустой папки:', error)
  }
}

const updateBuildScripts = () => ({
  name: 'timestamp-integration',
  hooks: {
    'astro:build:done': async ({ pages }) => {
      try {
        const scriptsToKeep = ['script.js']

        const scriptsDir = path.join(outDir, 'scripts')
        const files = await fs.readdir(scriptsDir)

        for (const file of files) {
          if (!scriptsToKeep.includes(file)) {
            await fs.rm(path.join(scriptsDir, file))
            console.log(`Удален: scripts/${file}`)
          }
        }

        const renderersPath = path.join(outDir, 'renderers.mjs')
        try {
          await fs.access(renderersPath)
          await fs.rm(renderersPath)
          console.log('Удален файл: renderers.mjs')
        } catch {
          console.log('Файл renderers.mjs не найден')
        }

        for (const page of pages) {
          const relativePagePath = path.join(page.pathname, 'index.html')
          const pagePath = path.join(pagesDir, relativePagePath)

          if (!isDevBuild) {
            const pageDir = path.dirname(pagePath)
            await fs.mkdir(pageDir, { recursive: true })
          }

          try {
            const content = await fs.readFile(path.join(outDir, relativePagePath), 'utf-8')

            let updatedContent = content.replace(
              /<script\b[^>]*\bsrc\s*=\s*["'][^"']*["'][^>]*>[\s\S]*?<\/script>\n?/gi,
              ''
            )

            updatedContent = updatedContent.replace(
              /<\/body>/i,
              `<script src="/scripts/script.js?${timestamp}"></script>\n</body>`
            )

            if (updatedContent !== content) {
              if (isDevBuild)
                await fs.writeFile(path.join(resolve(outDir, ''), relativePagePath), updatedContent)
              else await fs.writeFile(pagePath, updatedContent)
              console.log(`Обновлен: ${pagePath}`)
            }

            if (!isDevBuild) {
              const filePathInRoot = path.join(outDir, relativePagePath)
              try {
                await fs.access(filePathInRoot)
                await fs.rm(filePathInRoot)
                console.log(`Удалена страница из корня: ${filePathInRoot}`)
              } catch {
                console.log(`Страница не найдена в корне: ${filePathInRoot}`)
              }
            }
          } catch (error) {
            console.error('Ошибка при обработке страницы:', error)
          }
          if (!isDevBuild) {
            const dirs = await fs.readdir(outDir, { withFileTypes: true })
            for (const dir of dirs) {
              if (dir.isDirectory()) {
                const dirPath = path.join(outDir, dir.name)
                await removeEmptyDirs(dirPath)
              }
            }
          }
        }
      } catch (error) {
        console.error('Ошибка:', error)
      }
    }
  }
})

// https://astro.build/config
export default defineConfig({
  base: basePath,

  devToolbar: {
    enabled: false
  },

  compressHTML: false,

  integrations: [tailwind(), updateBuildScripts()],

  vite: {
    optimizeDeps: {
      include: ['tom-select']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: () => 'script',
          entryFileNames: `scripts/script.js`,
          chunkFileNames: `scripts/[name].js`,
          assetFileNames: assetInfo => {
            if (!assetInfo || !assetInfo.name) return ''
            let extType = assetInfo.name.split('.')[1]

            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'images'
            } else if (extType === 'css') {
              extType = 'styles'
            } else if (extType === 'js') {
              extType = 'scripts'
            }

            return `${extType}/[name][extname]`
          }
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import '@shared/styles/global/config';
            @import '@shared/styles/global/mixins';
          `
        }
      }
    }
  }
})
