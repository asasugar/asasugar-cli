#!/usr/bin/env node

const fs = require('fs')

const program = require('commander') //可以解析用户输入的命令
const download = require('download-git-repo') //拉取github上的文件
const chalk = require('chalk') //改变输出文字的颜色
const inquirer = require('inquirer')
const ora = require('ora') //小图标（loading、succeed、warn等）
const package = require('../package')
program
  .version(package.version)
  .option('-i, init', '初始化j8项目')
  .parse(process.argv)

program.parse(process.argv)

const question = [{
    type: 'list',
    message: `请选择项目类型? `,
    name: 'type',
    choices: ['MPA(多页应用)', 'Vue', 'React']
  },
  {
    type: 'list',
    message: `请选择终端? `,
    name: 'terminal',
    when: answers => answers.type === 'Vue',
    choices: ['PC端', '移动端']
  },
  {
    type: 'input',
    message: `项目名称: `,
    name: 'name',
    default: 'my-project'
  },
  {
    type: 'input',
    message: `项目描述: `,
    name: 'description',
    default: 'Description'
  },
  {
    type: 'input',
    message: `初始版本: `,
    name: 'version',
    default: '0.0.1'
  },
  {
    type: 'input',
    message: `server端口: `,
    name: 'port',
    default: '8080'
  },
  {
    type: 'confirm',
    message: `使用pug(jade)模版引擎? `,
    name: 'template',
    when: answers => answers.type === 'MPA(多页应用)',
    default: true
  }
]

if (program.init) {
  console.info('')
  inquirer.prompt(question).then(function (answers) {
    let downloadUrl
    if (answers.type === 'MPA(多页应用)') {
      // MPA
      downloadUrl = answers.template ?
        'xxj95719/multi-page-app' :
        'xxj95719/multi-page-app#html'
    } else if (answers.type === 'Vue') {
      // Vue
      if (answers.terminal === 'PC端') downloadUrl = 'xxj95719/vue-spa'
      else downloadUrl = 'xxj95719/vue-spa#vue-spa-mobile'
    } else if (answers.type === 'React') {
      // React
      downloadUrl = 'xxj95719/react-spa'
    }
    const spinner = ora('正在从github下载...').start()
    download(downloadUrl, answers.name, function (err) {
      if (!err) {
        spinner.clear()
        console.info('')
        console.info(
          chalk.green('-----------------------------------------------------')
        )
        console.info('')
        spinner.succeed(['项目创建成功,请继续进行以下操作:'])
        console.info('')
        console.info(chalk.cyan(` -  cd ${answers.name}`))
        console.info(chalk.cyan(` -  npm install / yarn`))
        console.info(chalk.cyan(` -  npm run dev / yarn dev`))
        console.info('')
        console.info(chalk.gray(`devServer: http://localhost:${answers.port}`))
        console.info('')
        console.info(
          chalk.gray('参考文档: https://github.com/xxj95719/j8-cli/')
        )
        console.info('')
        console.info(
          chalk.green('-----------------------------------------------------')
        )
        console.info('')

        fs.readFile(
          `${process.cwd()}/${answers.name}/package.json`,
          (err, data) => {
            if (err) throw err
            let _data = JSON.parse(data.toString())
            _data.name = answers.name
            _data.description = answers.description
            _data.version = answers.version
            _data.port = answers.port
            let str = JSON.stringify(_data, null, 4)
            fs.writeFile(
              `${process.cwd()}/${answers.name}/package.json`,
              str,
              function (err) {
                if (err) throw err
                process.exit()
              }
            )
          }
        )
      } else {
        spinner.warn([
          '发生错误，请在https://github.com/xxj95719/j8-cli/issues，Issues留言'
        ])
        process.exit()
      }
    })
  })
}