#!/usr/bin/env node
const path = require('path')
const fs = require('fs')

const program = require('commander') //可以解析用户输入的命令
const download = require('download-git-repo') //拉取github上的文件
const chalk = require('chalk') //改变输出文字的颜色
const ora = require('ora') //小图标（loading、succeed、warn等）

program
  .version('0.0.1')
  .option('-i, init [name]', '初始化j8项目')
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
  default: '0.0.1'
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
      const spinner = ora('正在从github下载x-build').start()
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

          if (answers.template === true) {
            fs.unlinkSync(`${process.cwd()}/${answers.name}/src/index.html`)
          } else {
            fs.unlinkSync(`${process.cwd()}/${answers.name}/index.pug`)
            fs.unlinkSync(`${process.cwd()}/${answers.name}/src/app.pug`)
          }

          fs.readFile(
            `${process.cwd()}/${answers.name}/package.json`,
            (err, data) => {
              if (err) throw err
              let _data = JSON.parse(data.toString())
              _data.name = answers.name
              _data.version = answers.version
              _data.port = answers.port
              _data.template = answers.template ? 'pug' : 'html'
              _data.rem = answers.rem
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
            '发生错误，请在https://github.com/xxj95719/，Issues留言'
          ])
          process.exit()
        }
      })
    })
}
