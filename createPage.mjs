#!/usr/bin/env node
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'

const command = process.env.npm_lifecycle_event ?? 'pages'

const pageTemplate = folderName => `---
import Layout from "@widgets/layout/Layout.astro"
---

<Layout pageName="${folderName}">
  <div></div>
</Layout>
`

const styleTemplate = folderName => `.${folderName} {
  position: static;
}
`

const astroTemplate = (folderName, componentNamePascal) => `---
interface Props {
  class?: string
}

const { class: className, ...props } = Astro.props as Props

export { ${componentNamePascal} }
---

<div class:list={['${folderName}', className]} {...props}>
  <slot></slot>
</div>

<style>
  @import './${folderName}.scss';
</style>
`

const kebabToPascal = str =>
  str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')

const validateParts = parts => {
  for (const part of parts) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part)) {
      console.error(
        '\x1b[31m%s\x1b[0m',
        `❌ Ошибка: Название папки "${part}" должно быть в нижнем регистре и в формате kebab-case (например, "about-page").`
      )
      process.exit(1)
    }
  }
}

const createPage = pagePath => {
  if (!pagePath || typeof pagePath !== 'string') {
    console.error('\x1b[31m%s\x1b[0m', '❌ Ошибка: Путь к странице должен быть непустой строкой.')
    process.exit(1)
  }
  const cleanedPath = pagePath.trim()
  const parts = cleanedPath.split(/[\\/]/).filter(p => p.length > 0)
  validateParts(parts)
  if (parts.length < 1) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      '❌ Ошибка: Укажите имя страницы, например "about" или "ui/about".'
    )
    process.exit(1)
  }
  // Для шаблона используем последнюю часть пути
  const folderName = parts[parts.length - 1]
  const targetFolder = path.join('src', 'pages', ...parts)
  if (fs.existsSync(targetFolder)) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Ошибка: Страница "${targetFolder}" уже существует.`)
    process.exit(1)
  }
  try {
    fs.mkdirSync(targetFolder, { recursive: true })
    console.log('\x1b[32m%s\x1b[0m', `✅ Создана директория страницы: "${targetFolder}"`)
  } catch (err) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `❌ Ошибка при создании директории "${targetFolder}": ${err.message}`
    )
    process.exit(1)
  }
  try {
    const indexFilePath = path.join(targetFolder, 'index.astro')
    fs.writeFileSync(indexFilePath, pageTemplate(folderName))
    console.log('\x1b[32m%s\x1b[0m', `✅ Файл страницы создан: "${indexFilePath}"`)
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Ошибка при создании index.astro: ${err.message}`)
    process.exit(1)
  }
  try {
    const componentsFolder = path.join(targetFolder, '_components')
    fs.mkdirSync(componentsFolder, { recursive: true })
    console.log('\x1b[32m%s\x1b[0m', `✅ Создана папка _components: "${componentsFolder}"`)
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Ошибка при создании папки _components: ${err.message}`)
    process.exit(1)
  }
}

const createPageComponent = (pagePath, componentName) => {
  if (!pagePath || typeof pagePath !== 'string') {
    console.error('\x1b[31m%s\x1b[0m', '❌ Ошибка: Путь к странице должен быть непустой строкой.')
    process.exit(1)
  }
  if (!componentName || typeof componentName !== 'string') {
    console.error('\x1b[31m%s\x1b[0m', '❌ Ошибка: Имя компонента должно быть непустой строкой.')
    process.exit(1)
  }
  const cleanedPagePath = pagePath.trim()
  const pageParts = cleanedPagePath.split(/[\\/]/).filter(p => p.length > 0)
  validateParts(pageParts)
  if (pageParts.length < 1) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Ошибка: Укажите корректный путь к странице.')
    process.exit(1)
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(componentName)) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `❌ Ошибка: Имя компонента "${componentName}" должно быть в нижнем регистре и в формате kebab-case.`
    )
    process.exit(1)
  }
  const targetPageFolder = path.join('src', 'pages', ...pageParts)
  if (!fs.existsSync(targetPageFolder)) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `❌ Ошибка: Страница "${targetPageFolder}" не существует. Сначала создайте страницу.`
    )
    process.exit(1)
  }
  const componentsFolder = path.join(targetPageFolder, '_components')
  if (!fs.existsSync(componentsFolder)) {
    try {
      fs.mkdirSync(componentsFolder, { recursive: true })
      console.log('\x1b[32m%s\x1b[0m', `✅ Создана папка _components в "${targetPageFolder}".`)
    } catch (err) {
      console.error('\x1b[31m%s\x1b[0m', `❌ Ошибка при создании папки _components: ${err.message}`)
      process.exit(1)
    }
  }
  const targetFolder = path.join(componentsFolder, componentName)
  if (fs.existsSync(targetFolder)) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `❌ Ошибка: Компонент "${componentName}" уже существует в "${targetPageFolder}".`
    )
    process.exit(1)
  }
  try {
    fs.mkdirSync(targetFolder, { recursive: true })
    console.log('\x1b[32m%s\x1b[0m', `✅ Создана директория компонента: "${targetFolder}"`)
  } catch (err) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `❌ Ошибка при создании директории "${targetFolder}": ${err.message}`
    )
    process.exit(1)
  }
  try {
    const scssFilePath = path.join(targetFolder, `${componentName}.scss`)
    fs.writeFileSync(scssFilePath, styleTemplate(componentName))
    const componentNamePascal = kebabToPascal(componentName)
    const astroFilePath = path.join(targetFolder, `${componentNamePascal}.astro`)
    fs.writeFileSync(astroFilePath, astroTemplate(componentName, componentNamePascal))
    console.log(
      '\x1b[32m%s\x1b[0m',
      `✅ Компонент создан:\n   - Стили: "${scssFilePath}"\n   - Компонент: "${astroFilePath}"`
    )
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Ошибка при создании файлов компонента: ${err.message}`)
    process.exit(1)
  }
}

const getAllPages = (dir, base = '') => {
  let pages = []
  if (!fs.existsSync(dir)) return pages
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    if (item.isDirectory()) {
      const subDir = path.join(dir, item.name)
      const relativePath = path.join(base, item.name)
      const indexPath = path.join(subDir, 'index.astro')
      if (fs.existsSync(indexPath)) {
        pages.push(relativePath)
      }
      pages = pages.concat(getAllPages(subDir, relativePath))
    }
  }
  return pages
}

const main = async () => {
  const args = process.argv.slice(2)

  if (command === 'page-comp') {
    let pagePath, componentName
    if (args.length >= 2) {
      pagePath = args[0]
      componentName = args[1]
    } else {
      // Если не указаны оба параметра, интерактивно выбираем страницу и вводим имя компонента
      const pagesDir = path.join('src', 'pages')
      let pages = getAllPages(pagesDir)
      if (pages.length === 0) {
        console.error(
          '\x1b[31m%s\x1b[0m',
          '❌ Нет существующих страниц. Сначала создайте страницу.'
        )
        process.exit(1)
      }
      const MAX_PAGES = 20
      if (pages.length > MAX_PAGES) {
        const filterAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'filter',
            message: 'Найдено много страниц. Введите часть пути для фильтрации:'
          }
        ])
        pages = pages.filter(page => page.includes(filterAnswer.filter))
        if (pages.length === 0) {
          console.error('\x1b[31m%s\x1b[0m', '❌ Нет страниц, удовлетворяющих фильтру.')
          process.exit(1)
        }
      }
      const pageAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'pagePath',
          message: 'Выберите страницу для добавления компонента:',
          choices: pages
        }
      ])
      pagePath = pageAnswer.pagePath
      const compAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'componentName',
          message: 'Введите имя компонента (в kebab-case):',
          validate: input =>
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input) || 'Неверный формат, попробуйте еще раз.'
        }
      ])
      componentName = compAnswer.componentName
    }
    createPageComponent(pagePath, componentName)
  } else if (command === 'pages') {
    let pagePath
    if (args.length >= 1) {
      pagePath = args[0]
    } else {
      // Если нет параметра, предлагаем ввести путь для создания страницы
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'pagePath',
          message: 'Введите путь для создания новой страницы (например, about/ui):',
          validate: input => input.trim().length > 0 || 'Пожалуйста, введите непустой путь.'
        }
      ])
      pagePath = answer.pagePath
    }
    createPage(pagePath)
  } else {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `❌ Ошибка: Команда "${command}" не поддерживается. Используйте "pages" или "page-comp".`
    )
    process.exit(1)
  }
}

await main()
