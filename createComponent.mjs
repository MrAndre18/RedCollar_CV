#!/usr/bin/env node
import fs from 'fs'
import inquirer from 'inquirer'
import path from 'path'

const command = process.env.npm_lifecycle_event ?? 'shared'

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
        `❌ Ошибка: Название папки "${part}" должно быть в нижнем регистре и в формате kebab-case (например, "component-name").`
      )
      process.exit(1)
    }
  }
}

const createComponent = componentPath => {
  if (!componentPath || typeof componentPath !== 'string') {
    console.error(
      '\x1b[31m%s\x1b[0m',
      '❌ Ошибка: Путь к компоненту должен быть непустой строкой. Проверьте входные данные.'
    )
    process.exit(1)
  }
  const cleanedPath = componentPath.trim()
  const parts = cleanedPath.split(/[\\/]/).filter(p => p.length > 0)
  validateParts(parts)
  if (parts.length < 1) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      '❌ Ошибка: Недостаточно параметров. Укажите имя компонента, например "component-name" или "ui/component-name".'
    )
    process.exit(1)
  }
  const folderName = parts.pop()
  if (!folderName) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Ошибка: Имя компонента не может быть пустым.')
    process.exit(1)
  }
  const targetFolder = path.join('src', command, ...parts, folderName)
  if (fs.existsSync(targetFolder)) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `❌ Ошибка: Папка "${targetFolder}" уже существует. Переименуйте компонент или удалите существующую папку.`
    )
    process.exit(1)
  }
  try {
    fs.mkdirSync(targetFolder, { recursive: true })
    console.log('\x1b[32m%s\x1b[0m', `✅ Успешно создана директория: "${targetFolder}"`)
  } catch (err) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `❌ Ошибка: Не удалось создать директорию "${targetFolder}". Подробности: ${err.message}`
    )
    process.exit(1)
  }
  try {
    const scssFileName = `${folderName}.scss`
    const scssContent = styleTemplate(folderName)
    const scssFilePath = path.join(targetFolder, scssFileName)
    fs.writeFileSync(scssFilePath, scssContent)
    const componentNamePascal = kebabToPascal(folderName)
    const astroFileName = `${componentNamePascal}.astro`
    const astroContent = astroTemplate(folderName, componentNamePascal)
    const astroFilePath = path.join(targetFolder, astroFileName)
    fs.writeFileSync(astroFilePath, astroContent)
    console.log(
      '\x1b[32m%s\x1b[0m',
      `✅ Файлы успешно созданы:\n  - Стили: "${scssFilePath}"\n  - Компонент: "${astroFilePath}"`
    )
  } catch (err) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `❌ Ошибка: Не удалось создать файлы в директории "${targetFolder}". Подробности: ${err.message}`
    )
    process.exit(1)
  }
}

const main = async () => {
  const args = process.argv.slice(2)
  if (!args.length) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'componentPath',
        message:
          'Введите путь для создания нового компонента (например, "ui/component-name" или "component-name"):',
        validate: input => input.trim().length > 0 || 'Пожалуйста, введите непустой путь.'
      }
    ])
    createComponent(answer.componentPath)
  } else {
    createComponent(args[0])
  }
}

await main()
