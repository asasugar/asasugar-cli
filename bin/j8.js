#!/usr/bin/env node
const fs = require('fs')

const program = require('commander') //可以解析用户输入的命令
const download = require('download-git-repo') //拉取github上的文件
const chalk = require('chalk') //改变输出文字的颜色
const inquirer = require('inquirer')
const ora = require('ora') //小图标（loading、succeed、warn等）
const package = require('../package')
program
  .version(require('../package').version)
  .option('-i, init', '初始化j8项目')
  .parse(process.argv)

program.parse(process.argv)

const nameQuestion = {
  type: 'input',
  message: `项目名称: `,
  name: 'name',
  default: 'my-project'
}
const desQuestion = {
  type: 'input',
  message: `项目描述: `,
  name: 'description',
  default: package.description
}

const versionQuestion = {
  type: 'input',
  message: `初始版本: `,
  name: 'version',
  default: package.version
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
    .prompt([
      nameQuestion,
      desQuestion,
      versionQuestion,
      portQuestion,
      templateQuestion
    ])
    .then(function(answers) {
      const spinner = ora('正在从github下载...').start()
      download(
        answers.template
          ? 'xxj95719/multi-page-app/tree/pug'
          : 'xxj95719/multi-page-app/tree/html',
        answers.name,
        function(err) {
          if (!err) {
            spinner.clear()
            console.info('')
            console.info(
              chalk.green(
                '-----------------------------------------------------'
              )
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
              chalk.gray(
                '参考文档: https://github.com/xxj95719/multi-page-app/tree/' +
                answers.template
                  ? 'pug'
                  : 'html'
              )
            )
            console.info('')
            console.info(
              chalk.green(
                '-----------------------------------------------------'
              )
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
                  function(err) {
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
        }
      )
    })
}
