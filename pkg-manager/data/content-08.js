/**
 * 第8章：npm scripts脚本
 * 深入理解scripts定义、pre/post钩子、内置变量、跨平台兼容性
 */

window.content = {
    section: {
        title: '第8章：npm scripts脚本',
        icon: '📜'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'npm scripts简介',
            content: {
                description: 'npm scripts是package.json中定义的脚本命令，可以通过npm run执行，是项目自动化的核心工具。',
                keyPoints: [
                    'scripts字段：在package.json中定义命令',
                    'npm run：执行自定义脚本',
                    '内置脚本：start、test、stop等可省略run',
                    '生命周期：pre和post钩子自动执行',
                    'PATH增强：自动添加node_modules/.bin到PATH',
                    '跨平台：需要处理不同操作系统的差异'
                ],
                mdn: 'https://docs.npmjs.com/cli/v9/using-npm/scripts'
            }
        },
        
        {
            type: 'code-example',
            title: 'scripts基础用法',
            content: {
                description: 'scripts是项目自动化的基础，定义常用的开发、构建、测试命令。',
                examples: [
                    {
                        title: '常见scripts配置',
                        code: `{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint src",
    "format": "prettier --write src"
  }
}

# 执行脚本
npm run dev      # 开发服务器
npm run build    # 生产构建
npm test         # 测试（可省略run）
npm run lint     # 代码检查`,
                        notes: '定义统一的项目命令，团队协作必备'
                    },
                    {
                        title: 'scripts传参',
                        code: `{
  "scripts": {
    "test": "jest",
    "dev": "vite --host"
  }
}

# 传递额外参数（使用--）
npm run test -- --watch
# 实际执行：jest --watch

npm run dev -- --port 3000
# 实际执行：vite --host --port 3000

# 不使用--会报错
npm run test --watch  # ❌ npm把--watch当作自己的参数`,
                        notes: '使用--分隔npm参数和脚本参数'
                    },
                    {
                        title: '内置脚本',
                        code: `{
  "scripts": {
    "start": "node server.js",
    "test": "jest",
    "stop": "node scripts/stop.js",
    "restart": "npm stop && npm start"
  }
}

# 内置脚本可以省略run
npm start    # 等同于 npm run start
npm test     # 等同于 npm run test
npm stop     # 等同于 npm run stop
npm restart  # 等同于 npm run restart`,
                        notes: 'start、test、stop可以直接npm xxx'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'pre和post钩子',
            content: {
                description: 'npm scripts支持pre和post前缀，定义在主脚本前后自动执行的钩子脚本，实现自动化流程。',
                mechanism: '执行npm run script时，npm会按顺序执行: prescript → script → postscript。如果任何一个脚本失败（返回非0），后续脚本不会执行。',
                keyPoints: [
                    'pre前缀：在主脚本之前执行',
                    'post前缀：在主脚本之后执行',
                    '自动执行：无需手动调用',
                    '错误中断：任意脚本失败则中断后续执行',
                    '常用场景：prebuild清理、posttest报告',
                    '生命周期钩子：install、publish等也有钩子'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'pre和post钩子示例',
            content: {
                description: 'pre/post钩子可以实现复杂的自动化流程。',
                examples: [
                    {
                        title: '基本钩子用法',
                        code: `{
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "tsc",
    "postbuild": "cp README.md dist/",
    
    "pretest": "npm run lint",
    "test": "jest",
    "posttest": "npm run coverage",
    
    "precommit": "npm test"
  }
}

# 执行npm run build时的顺序：
# 1. npm run prebuild  → 清理dist目录
# 2. npm run build     → TypeScript编译
# 3. npm run postbuild → 复制README

# 执行npm test时的顺序：
# 1. npm run pretest  → 代码检查
# 2. npm run test     → 运行测试
# 3. npm run posttest → 生成覆盖率报告`,
                        notes: 'pre/post自动执行，无需手动调用'
                    },
                    {
                        title: 'install生命周期钩子',
                        code: `{
  "scripts": {
    "preinstall": "node scripts/check-node-version.js",
    "install": "node-gyp rebuild",
    "postinstall": "patch-package",
    
    "prepare": "husky install"  // npm 7+
  }
}

# npm install执行顺序：
# 1. preinstall  → 检查Node版本
# 2. install     → 编译native模块
# 3. postinstall → 应用补丁
# 4. prepare     → 安装git hooks`,
                        notes: 'install钩子在依赖安装时自动执行'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'npm scripts环境变量',
            content: {
                description: 'npm scripts执行时会注入丰富的环境变量，可以在脚本中使用这些变量获取项目信息。',
                mechanism: 'npm读取package.json的所有字段，转换为npm_package_*形式的环境变量；npm配置转换为npm_config_*环境变量；还提供PATH、NODE_ENV等常用变量。',
                keyPoints: [
                    'npm_package_*：package.json中的字段',
                    'npm_config_*：npm配置项',
                    'npm_lifecycle_event：当前执行的脚本名',
                    'NODE_ENV：环境变量（需手动设置）',
                    'PATH：自动包含node_modules/.bin',
                    'npm_execpath：npm的可执行文件路径'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '使用环境变量',
            content: {
                description: 'npm scripts中可以直接使用环境变量，实现动态配置。',
                examples: [
                    {
                        title: '访问package.json字段',
                        code: `// package.json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "info": "node scripts/info.js"
  }
}

// scripts/info.js
console.log('Package:', process.env.npm_package_name);
console.log('Version:', process.env.npm_package_version);
console.log('Script:', process.env.npm_lifecycle_event);

// 执行npm run info输出：
// Package: my-app
// Version: 1.0.0
// Script: info`,
                        notes: 'package.json字段自动转为环境变量'
                    },
                    {
                        title: '跨平台设置NODE_ENV',
                        code: `{
  "scripts": {
    // ❌ Windows不支持
    "build": "NODE_ENV=production webpack",
    
    // ✅ 使用cross-env（推荐）
    "build": "cross-env NODE_ENV=production webpack",
    
    // ✅ 或使用npm配置
    "config": {
      "env": "production"
    },
    "build": "webpack"
  }
}

# 安装cross-env
npm install --save-dev cross-env`,
                        notes: '使用cross-env实现跨平台环境变量'
                    },
                    {
                        title: '动态脚本',
                        code: `{
  "version": "1.0.0",
  "scripts": {
    "build": "node build.js",
    "version": "npm run build && git add -A dist"
  }
}

// build.js
const version = process.env.npm_package_version;
console.log(\`Building version \${version}...\`);

# npm version会自动执行version脚本
npm version patch  # 1.0.0 → 1.0.1
# 1. 更新version
# 2. 执行version脚本（build并git add）
# 3. 创建git commit和tag`,
                        notes: '环境变量实现动态构建'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '跨平台兼容性',
            content: {
                description: 'Windows、macOS、Linux的shell差异导致某些命令不兼容，需要使用跨平台工具确保scripts在所有系统上都能运行。',
                mechanism: 'Windows使用cmd.exe，Unix使用bash，命令和语法有差异。使用跨平台工具（如rimraf、cross-env）可以抹平差异。',
                keyPoints: [
                    'shell差异：Windows用cmd/PowerShell，Unix用bash',
                    '路径分隔符：Windows用\\，Unix用/',
                    '环境变量：Windows用%VAR%，Unix用$VAR',
                    '命令差异：rm、cp等Unix命令Windows不支持',
                    '解决方案：使用跨平台npm包',
                    '常用工具：rimraf、cross-env、npm-run-all'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '跨平台scripts工具',
            content: {
                description: '使用专门的跨平台工具可以确保scripts在所有操作系统上正常工作。',
                examples: [
                    {
                        title: 'rimraf跨平台删除',
                        code: `# 安装rimraf
npm install --save-dev rimraf

{
  "scripts": {
    // ❌ Windows不支持rm命令
    "clean": "rm -rf dist",
    
    // ✅ 使用rimraf（跨平台）
    "clean": "rimraf dist"
  }
}`,
                        notes: 'rimraf在所有平台上都能删除文件/目录'
                    },
                    {
                        title: 'npm-run-all并行/串行执行',
                        code: `# 安装npm-run-all
npm install --save-dev npm-run-all

{
  "scripts": {
    "lint:js": "eslint src",
    "lint:css": "stylelint src",
    "lint:format": "prettier --check src",
    
    // 串行执行（一个接一个）
    "lint": "npm-run-all lint:*",
    // 等同于：npm run lint:js && npm run lint:css && npm run lint:format
    
    // 并行执行（同时执行）
    "lint": "npm-run-all --parallel lint:*",
    
    "build:js": "babel src -d dist",
    "build:css": "sass src:dist",
    "build": "npm-run-all --parallel build:*"
  }
}`,
                        notes: 'npm-run-all简化多任务执行'
                    },
                    {
                        title: 'cpx跨平台复制',
                        code: `# 安装cpx
npm install --save-dev cpx

{
  "scripts": {
    // ❌ Windows的cp命令不同
    "copy": "cp -r src/assets dist/",
    
    // ✅ 使用cpx（支持通配符和监听）
    "copy": "cpx 'src/assets/**/*' dist/assets",
    "copy:watch": "cpx 'src/assets/**/*' dist/assets --watch"
  }
}`,
                        notes: 'cpx支持复制、监听、通配符'
                    },
                    {
                        title: 'mkdirp跨平台创建目录',
                        code: `# 安装mkdirp
npm install --save-dev mkdirp

{
  "scripts": {
    // ❌ Windows的mkdir语法不同
    "mkdir": "mkdir -p dist/js dist/css",
    
    // ✅ 使用mkdirp
    "mkdir": "mkdirp dist/js dist/css"
  }
}`,
                        notes: 'mkdirp递归创建目录'
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'scripts组织最佳实践',
            content: {
                description: '合理组织scripts可以提升项目的可维护性和开发效率。',
                examples: [
                    {
                        title: '典型的scripts配置',
                        code: `{
  "scripts": {
    // 开发相关
    "dev": "vite",
    "dev:https": "vite --https",
    "dev:host": "vite --host",
    
    // 构建相关
    "prebuild": "npm run clean",
    "build": "vite build",
    "build:prod": "cross-env NODE_ENV=production npm run build",
    "build:analyze": "vite build --mode analyze",
    
    // 测试相关
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    
    // 代码质量
    "lint": "npm-run-all --parallel lint:*",
    "lint:js": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:css": "stylelint 'src/**/*.{css,scss}'",
    "lint:format": "prettier --check 'src/**/*.{js,jsx,ts,tsx,json,css,scss}'",
    
    "format": "prettier --write 'src/**/*.{js,jsx,ts,tsx,json,css,scss}'",
    
    // 工具脚本
    "clean": "rimraf dist",
    "typecheck": "tsc --noEmit",
    
    // Git hooks
    "prepare": "husky install",
    "pre-commit": "lint-staged"
  }
}`,
                        notes: '使用命名空间（:）组织相关脚本'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'npm scripts最佳实践',
            content: {
                description: '遵循最佳实践可以让scripts更清晰、更易维护、更可靠。',
                keyPoints: [
                    '命名规范：使用命名空间（dev:xxx, build:xxx）',
                    '跨平台工具：使用rimraf、cross-env等确保兼容性',
                    '并行执行：使用npm-run-all提升速度',
                    '环境变量：使用cross-env设置环境',
                    '钩子利用：合理使用pre/post钩子',
                    '错误处理：使用|| true忽略非关键错误',
                    '文档说明：在README中说明常用scripts',
                    '保持简洁：复杂逻辑抽取到独立脚本文件'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第7章：npm常用命令',
            url: './render.html?subject=pkg-manager&type=content&chapter=07'
        },
        next: {
            title: '第9章：依赖版本管理',
            url: './render.html?subject=pkg-manager&type=content&chapter=09'
        }
    }
};
