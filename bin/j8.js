#!/usr/bin/env node
const fs = require('fs')

const program = require('commander') //可以解析用户输入的命令
const download = require('download-git-repo') //拉取github上的文件
const chalk = require('chalk') //改变输出文字的颜色
const inquirer = require('inquirer')
const ora = require('ora') //小图标（loading、succeed、warn等）

program
  .version(require('../package').version)
  .option('-i, init', '初始化j8项目')
  .parse(process.argv)

program.parse(process.argv)

const nameQuestion = {
  type: 'input',
  message: `项目名称: `,
  name: 'name',
  default: 'my-j8-project'
}

const versionQuestion = {
  type: 'input',
  message: `初始版本: `,
  name: 'version',
  default: require('../package').version
}

const portQuestion = {
  type: 'input',
  message: `server端口: `,
  name: 'port',
  default: '8080'
}

const templateQuestion = {
  type: 'confirm',
  message: `使用pug(jade)模版引擎? `,
  name: 'template',
  default: true
}

if (program.init) {
  console.info('')
  inquirer
    .prompt([nameQuestion, versionQuestion, portQuestion, templateQuestion])
    .then(function(answers) {
      const spinner = ora('正在从github下载...').start()
      download('xxj95719/multi-page-app', answers.name, function(err) {
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
          console.info(chalk.cyan(` -  npm run dev`))
          console.info('')
          console.info(
            chalk.gray(`devServer: http://localhost:${answers.port}`)
          )
          console.info('')
          console.info(
            chalk.gray('参考文档: https://github.com/xxj95719/multi-page-app')
          )
          console.info('')
          console.info(
            chalk.green('-----------------------------------------------------')
          )
          console.info('')
        } else {
          spinner.warn([
            '发生错误，请在https://github.com/xxj95719/，Issues留言'
          ])
          process.exit()
        }
      })
    })
}
