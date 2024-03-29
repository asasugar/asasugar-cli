#!/usr/bin/env node

const fs = require('fs');
const program = require('commander'); //可以解析用户输入的命令
const { download } = require('obtain-git-repo'); //拉取远端上的文件
const chalk = require('chalk'); //改变输出文字的颜色
const inquirer = require('inquirer');
const ora = require('ora'); //小图标（loading、succeed、warn等）
const package = require('../package');

program
  .version(package.version)
  .option('-i, init', '初始化项目')
  .parse(process.argv);

program.parse(process.argv);

const question = [
  {
    type: 'list',
    message: `请选择项目类型? `,
    name: 'type',
    choices: ['Vue', 'React', 'MPA(多页应用)', 'npm包开发'],
  },
  {
    type: 'list',
    message: `请选择终端? `,
    name: 'terminal',
    when: (answers) => answers.type === 'Vue',
    choices: ['PC端Vue3', 'PC端Vue2', '移动端Vue2'],
  },
  {
    type: 'input',
    message: `项目名称: `,
    name: 'name',
    default: 'my-project',
  },
  {
    type: 'input',
    message: `项目描述: `,
    name: 'description',
    default: 'Description',
  },
  {
    type: 'input',
    message: `初始版本: `,
    name: 'version',
    default: '0.0.1',
  },
  {
    type: 'input',
    message: `server端口: `,
    name: 'port',
    default: '8080',
    when: (answers) => answers.type !== 'npm包开发',
  },
  {
    type: 'confirm',
    message: `使用pug(jade)模版引擎? `,
    name: 'template',
    when: (answers) => answers.type === 'MPA(多页应用)',
    default: true,
  },
  {
    type: 'input',
    message: `设置github项目远程地址: `,
    name: 'address',
    when: (answers) => answers.type === 'npm包开发',
    default: 'https://github.com/asasugar/pnpm-plugin',
  },
];

if (program.init) {
  console.info('');
  inquirer.prompt(question).then(function (answers) {
    if (fs.existsSync(answers.name)) {
      ora().warn('发生错误，项目已存在');
      process.exit();
    } else {
      let downloadUrl;
      if (answers.type === 'npm包开发') {
        downloadUrl = 'asasugar/pnpm-plugin';
      } else if (answers.type === 'MPA(多页应用)') {
        // MPA
        downloadUrl = answers.template
          ? 'asasugar/multi-page-app'
          : 'asasugar/multi-page-app#html';
      } else if (answers.type === 'Vue') {
        // Vue
        if (answers.terminal === 'PC端Vue3') downloadUrl = 'asasugar/vue-spa';
        else if (answers.terminal === 'PC端Vue2')
          downloadUrl = 'asasugar/vue-spa#vue2-spa';
        else downloadUrl = 'asasugar/vue-spa#vue-spa-mobile';
      } else if (answers.type === 'React') {
        // React
        downloadUrl = 'asasugar/react-spa';
      }
      const spinner = ora('正在从远端下载...').start();
      download(downloadUrl, answers.name, function (err) {
        if (!err) {
          spinner.clear();
          console.info('');
          console.info(
            chalk.green('-----------------------------------------------------')
          );
          console.info('');
          spinner.succeed(['项目创建成功,请继续进行以下操作:']);
          console.info('');
          console.info(chalk.cyan(` -  cd ${answers.name}`));
          console.info(chalk.cyan(` -  npm install / yarn`));
          console.info(chalk.cyan(` -  npm run dev / yarn dev`));
          console.info('');
          console.info(
            chalk.gray(`devServer: http://localhost:${answers.port}`)
          );
          console.info('');
          console.info(
            chalk.gray('参考文档: https://github.com/asasugar/as-cli/')
          );
          console.info('');
          console.info(
            chalk.green('-----------------------------------------------------')
          );
          console.info('');

          fs.readFile(
            `${process.cwd()}/${answers.name}/package.json`,
            (err, data) => {
              if (err) throw err;
              let _data = JSON.parse(data.toString());
              _data.name = answers.name;
              _data.description = answers.description;
              _data.version = answers.version;
              _data.port = answers.port;
              if (answers.type === 'npm包开发') {
                _data.homepage = `${answers.address}#readme`;
                _data.bugs = {
                  "url": `${answers.address}/issues`
                };
                _data.repository = {
                  "type": "git",
                  "url": `git+${answers.address}.git`
                }
              }

              let str = JSON.stringify(_data, null, 4);
              fs.writeFile(
                `${process.cwd()}/${answers.name}/package.json`,
                str,
                function (err) {
                  if (err) throw err;
                  process.exit();
                }
              );
            }
          );
        } else {
          spinner.warn([
            '发生错误，请在https://github.com/asasugar/as-cli/issues，Issues留言',
          ]);
          process.exit();
        }
      });
    }
  });
}
