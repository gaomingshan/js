/**
 * 包管理工具
 * 包含多种题型：单选、多选、代码输出、判断、代码补全
 */
window.quizData_Advanced12PackageManagement = {
  "config": {
    "title": "包管理工具",
    "icon": "📦",
    "description": "掌握npm、yarn、pnpm等包管理工具的使用和原理",
    "primaryColor": "#f59e0b",
    "bgGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  },
  "questions": [
    // ========== 1. 单选题：package.json基础 ==========
    {
      "type": "single-choice",
      "difficulty": "easy",
      "tags": ["package.json"],
      "question": "package.json中，dependencies和devDependencies的区别是什么？",
      "options": [
        "dependencies是生产环境依赖，devDependencies是开发环境依赖",
        "完全相同，只是分类不同",
        "dependencies会被打包，devDependencies不会",
        "dependencies自动安装，devDependencies需要手动安装"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "依赖类型对比：",
        "sections": [
          {
            "title": "dependencies（生产依赖）",
            "content": "应用运行时必需的依赖",
            "code": "{\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"axios\": \"^1.4.0\",\n    \"lodash\": \"^4.17.21\"\n  }\n}\n\n// 安装\nnpm install axios\n// 或\nnpm install axios --save"
          },
          {
            "title": "devDependencies（开发依赖）",
            "content": "只在开发阶段需要的依赖，生产环境不需要",
            "code": "{\n  \"devDependencies\": {\n    \"webpack\": \"^5.88.0\",\n    \"eslint\": \"^8.45.0\",\n    \"jest\": \"^29.6.0\",\n    \"@types/react\": \"^18.2.0\"\n  }\n}\n\n// 安装\nnpm install webpack --save-dev\n// 或\nnpm install webpack -D"
          },
          {
            "title": "peerDependencies（同伴依赖）",
            "content": "需要宿主环境提供的依赖，常用于插件",
            "code": "// 插件的package.json\n{\n  \"peerDependencies\": {\n    \"react\": \">=16.8.0\"\n  }\n}\n\n// 表示：使用此插件的项目必须安装react>=16.8.0"
          },
          {
            "title": "optionalDependencies（可选依赖）",
            "content": "安装失败不影响整体安装",
            "code": "{\n  \"optionalDependencies\": {\n    \"fsevents\": \"^2.3.2\" // macOS特定依赖\n  }\n}"
          },
          {
            "title": "生产环境安装",
            "code": "// 只安装dependencies\nnpm install --production\n// 或\nNODE_ENV=production npm install\n\n// devDependencies不会被安装"
          }
        ]
      },
      "source": "依赖管理"
    },

    // ========== 2. 多选题：语义化版本 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["版本号"],
      "question": "关于语义化版本（Semver），以下哪些说法是正确的？",
      "options": [
        "^1.2.3 表示兼容1.x.x，不会升级到2.0.0",
        "~1.2.3 只允许修订号更新，不更新次版本号",
        "1.2.3 - 2.3.4 表示大于等于1.2.3且小于等于2.3.4",
        "* 或 x 表示任意版本",
        ">=1.2.7 <1.3.0 可以简写为~1.2.7",
        "主版本号为0时（0.x.x）被视为不稳定版本"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "语义化版本规则：",
        "sections": [
          {
            "title": "版本格式：主版本号.次版本号.修订号",
            "content": "MAJOR.MINOR.PATCH",
            "points": [
              "MAJOR：不兼容的API修改",
              "MINOR：向下兼容的功能新增",
              "PATCH：向下兼容的问题修正"
            ]
          },
          {
            "title": "版本范围符号",
            "code": "// ^ 符号：兼容某个版本\n\"^1.2.3\" // >=1.2.3 <2.0.0\n\"^0.2.3\" // >=0.2.3 <0.3.0 (0.x特殊处理)\n\"^0.0.3\" // >=0.0.3 <0.0.4 (0.0.x更特殊)\n\n// ~ 符号：约等于\n\"~1.2.3\" // >=1.2.3 <1.3.0\n\"~1.2\"   // >=1.2.0 <1.3.0\n\"~1\"     // >=1.0.0 <2.0.0\n\n// * 或 x：任意\n\"*\"      // >=0.0.0\n\"1.x\"    // >=1.0.0 <2.0.0\n\"1.2.x\"  // >=1.2.0 <1.3.0\n\n// 范围\n\"1.2.3 - 2.3.4\" // >=1.2.3 <=2.3.4\n\">=1.2.3 <2.0.0\" // 明确范围\n\n// || 或\n\"^1.0.0 || ^2.0.0\" // 1.x.x或2.x.x"
          },
          {
            "title": "^ vs ~ 对比",
            "code": "// ^ 更新到兼容版本（推荐）\n\"^1.2.3\"\n// 可更新到: 1.2.4, 1.3.0, 1.9.9\n// 不更新到: 2.0.0\n\n// ~ 更保守，只更新修订号\n\"~1.2.3\"\n// 可更新到: 1.2.4, 1.2.9\n// 不更新到: 1.3.0, 2.0.0\n\n// 实例\npackage.json: \"lodash\": \"^4.17.0\"\n// npm install 可能安装: 4.17.21\n// npm install 不会安装: 5.0.0"
          },
          {
            "title": "0.x.x版本特殊规则",
            "code": "// 0.x.x被视为不稳定\n\"^0.2.3\" // >=0.2.3 <0.3.0 (不是<1.0.0)\n\"~0.2.3\" // >=0.2.3 <0.3.0\n\n// 原因：0.x版本API可能剧烈变化"
          },
          {
            "title": "最佳实践",
            "code": "// ✅ 推荐：使用^锁定主版本\n{\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"lodash\": \"^4.17.21\"\n  }\n}\n\n// ✅ 锁定确切版本（关键依赖）\n{\n  \"dependencies\": {\n    \"some-critical-lib\": \"1.2.3\"\n  }\n}\n\n// ⚠️ 谨慎：使用*可能导致破坏性更新\n{\n  \"dependencies\": {\n    \"some-lib\": \"*\" // 不推荐\n  }\n}"
          }
        ]
      },
      "source": "语义化版本"
    },

    // ========== 3. 代码输出题：npm scripts执行 ==========
    {
      "type": "code-output",
      "difficulty": "medium",
      "tags": ["npm scripts"],
      "question": "package.json中配置了以下scripts，执行npm run build会运行哪些命令？",
      "code": "{\n  \"scripts\": {\n    \"prebuild\": \"echo pre\",\n    \"build\": \"echo build\",\n    \"postbuild\": \"echo post\",\n    \"test\": \"echo test\"\n  }\n}",
      "options": [
        "pre, build, post",
        "build",
        "pre, build, post, test",
        "build, post"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "npm scripts生命周期钩子：",
        "sections": [
          {
            "title": "pre和post钩子",
            "content": "npm会自动执行pre*和post*钩子",
            "code": "// package.json\n{\n  \"scripts\": {\n    \"prebuild\": \"echo 构建前\",\n    \"build\": \"webpack\",\n    \"postbuild\": \"echo 构建后\"\n  }\n}\n\n// 执行 npm run build\n// 1. prebuild  → echo 构建前\n// 2. build     → webpack\n// 3. postbuild → echo 构建后"
          },
          {
            "title": "常用钩子",
            "code": "{\n  \"scripts\": {\n    // install相关\n    \"preinstall\": \"echo 安装前\",\n    \"install\": \"node install.js\",\n    \"postinstall\": \"echo 安装后\",\n    \n    // publish相关\n    \"prepublishOnly\": \"npm run build\",\n    \"prepublish\": \"npm run test\",\n    \"publish\": \"npm publish\",\n    \"postpublish\": \"echo 发布完成\",\n    \n    // test相关\n    \"pretest\": \"eslint .\",\n    \"test\": \"jest\",\n    \"posttest\": \"echo 测试完成\"\n  }\n}"
          },
          {
            "title": "串行和并行执行",
            "code": "{\n  \"scripts\": {\n    // 串行执行（&&）\n    \"build\": \"npm run clean && npm run compile\",\n    \n    // 并行执行（&）\n    \"dev\": \"npm run watch-css & npm run watch-js\",\n    \n    // 使用npm-run-all\n    \"build:all\": \"npm-run-all clean build:*\",\n    \"build:css\": \"sass src:dist\",\n    \"build:js\": \"webpack\",\n    \n    // 并行\n    \"watch:all\": \"npm-run-all --parallel watch:*\",\n    \"watch:css\": \"sass --watch src:dist\",\n    \"watch:js\": \"webpack --watch\"\n  }\n}"
          },
          {
            "title": "传递参数",
            "code": "{\n  \"scripts\": {\n    \"test\": \"jest\",\n    \"test:watch\": \"npm run test -- --watch\"\n    //                                ^^ -- 后面的参数会传给test脚本\n  }\n}\n\n// 命令行\nnpm run test -- --coverage\n// 实际执行: jest --coverage"
          },
          {
            "title": "环境变量",
            "code": "{\n  \"scripts\": {\n    // 设置环境变量\n    \"build:prod\": \"NODE_ENV=production webpack\",\n    \"build:dev\": \"NODE_ENV=development webpack\",\n    \n    // 跨平台（使用cross-env）\n    \"build\": \"cross-env NODE_ENV=production webpack\"\n  }\n}"
          }
        ]
      },
      "source": "npm scripts"
    },

    // ========== 4. 判断题：package-lock.json ==========
    {
      "type": "true-false",
      "difficulty": "easy",
      "tags": ["package-lock"],
      "question": "package-lock.json应该提交到版本控制系统（如Git）中",
      "correctAnswer": "A",
      "explanation": {
        "title": "package-lock.json的作用：",
        "sections": [
          {
            "title": "正确！应该提交",
            "content": "package-lock.json锁定了依赖的确切版本，确保团队成员和CI环境安装相同版本的依赖",
            "points": [
              "锁定依赖版本树",
              "提升安装速度",
              "确保一致性",
              "记录依赖来源"
            ]
          },
          {
            "title": "为什么需要lock文件",
            "code": "// package.json\n{\n  \"dependencies\": {\n    \"lodash\": \"^4.17.0\"\n  }\n}\n\n// 没有lock文件：\n// 开发者A安装时：lodash@4.17.20\n// 开发者B两周后安装：lodash@4.17.21\n// 可能导致行为不一致\n\n// 有lock文件：\n// 所有人安装的都是lock中指定的4.17.20"
          },
          {
            "title": "lock文件对比",
            "code": "// npm → package-lock.json\n// yarn → yarn.lock\n// pnpm → pnpm-lock.yaml\n\n// package-lock.json示例\n{\n  \"name\": \"my-project\",\n  \"version\": \"1.0.0\",\n  \"lockfileVersion\": 2,\n  \"packages\": {\n    \"node_modules/lodash\": {\n      \"version\": \"4.17.21\",\n      \"resolved\": \"https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz\",\n      \"integrity\": \"sha512-...\"\n    }\n  }\n}"
          },
          {
            "title": "更新lock文件",
            "code": "// 更新所有依赖到允许的最新版本\nnpm update\n\n// 更新特定包\nnpm update lodash\n\n// 忽略lock文件重新安装\nnpm install --force\n\n// 根据package.json重新生成lock\nrm package-lock.json\nnpm install"
          },
          {
            "title": "CI/CD中使用",
            "code": "// ✅ CI环境：使用npm ci\nnpm ci\n// 特点：\n// - 严格按照lock文件安装\n// - 如果package.json和lock不匹配，报错\n// - 速度更快\n// - 会删除node_modules重新安装\n\n// ❌ 不推荐在CI中使用npm install\nnpm install\n// 可能修改lock文件"
          }
        ]
      },
      "source": "package-lock"
    },

    // ========== 5. 多选题：npm vs yarn vs pnpm ==========
    {
      "type": "multiple-choice",
      "difficulty": "hard",
      "tags": ["包管理器对比"],
      "question": "以下哪些是pnpm相比npm和yarn的优势？",
      "options": [
        "节省磁盘空间（硬链接共享依赖）",
        "安装速度更快",
        "默认使用严格的依赖隔离",
        "不需要package.json",
        "天然支持monorepo",
        "完全向后兼容npm"
      ],
      "correctAnswer": ["A", "B", "C", "E"],
      "explanation": {
        "title": "包管理器对比：",
        "sections": [
          {
            "title": "pnpm的核心优势",
            "points": [
              "硬链接节省空间：所有版本的包只存储一份",
              "速度快：并行安装+内容寻址存储",
              "严格：只能访问dependencies中声明的包",
              "monorepo友好：workspace支持更好"
            ]
          },
          {
            "title": "1. 存储机制对比",
            "code": "// npm/yarn：扁平化node_modules\nnode_modules/\n  ├── package-a/\n  ├── package-b/\n  └── package-c/  // 所有包都在同一层\n\n// pnpm：内容寻址存储\nnode_modules/\n  ├── .pnpm/\n  │   ├── package-a@1.0.0/\n  │   ├── package-b@2.0.0/\n  │   └── package-c@3.0.0/\n  └── package-a -> .pnpm/package-a@1.0.0/\n\n// 所有项目共享同一个store\n~/.pnpm-store/\n  └── v3/\n      └── files/\n          └── 00/\n              └── hash-of-package/  // 硬链接到这里"
          },
          {
            "title": "2. 依赖隔离",
            "code": "// package.json\n{\n  \"dependencies\": {\n    \"express\": \"^4.0.0\"\n  }\n}\n\n// npm/yarn：幽灵依赖问题\n// 可以使用express依赖的包\nconst bodyParser = require('body-parser'); // ✅ 能用，但不应该\n\n// pnpm：严格隔离\nconst bodyParser = require('body-parser'); // ❌ 报错\n// 必须显式声明依赖"
          },
          {
            "title": "3. 速度对比（安装lodash）",
            "code": "// 首次安装\nnpm:  ~10s\nyarn: ~8s\npnpm: ~5s\n\n// 有缓存\nnpm:  ~5s\nyarn: ~3s\npnpm: ~1s  // 硬链接，几乎瞬间\n\n// monorepo（100个包）\nnpm:  ~5min\nyarn: ~3min\npnpm: ~1min"
          },
          {
            "title": "4. 命令对比",
            "code": "// 安装依赖\nnpm install\nyarn\npnpm install\n\n// 添加依赖\nnpm install lodash\nyarn add lodash\npnpm add lodash\n\n// 删除依赖\nnpm uninstall lodash\nyarn remove lodash\npnpm remove lodash\n\n// 全局安装\nnpm install -g typescript\nyarn global add typescript\npnpm add -g typescript\n\n// 运行脚本\nnpm run build\nyarn build  // yarn可以省略run\npnpm run build\npnpm build  // pnpm也可以省略"
          },
          {
            "title": "5. Monorepo支持",
            "code": "// pnpm-workspace.yaml\npackages:\n  - 'packages/*'\n  - 'apps/*'\n\n// 项目结构\nroot/\n  ├── packages/\n  │   ├── pkg-a/\n  │   └── pkg-b/\n  ├── apps/\n  │   └── web/\n  └── pnpm-workspace.yaml\n\n// 在workspace中安装\npnpm install\n\n// 为特定包安装依赖\npnpm add lodash --filter pkg-a\n\n// 运行所有包的脚本\npnpm -r run build  // -r = --recursive"
          },
          {
            "title": "选择建议",
            "code": "// npm：\n// ✅ Node.js内置，无需额外安装\n// ✅ 最广泛支持\n// ❌ 速度相对慢\n// ❌ 磁盘占用大\n\n// yarn：\n// ✅ 速度快\n// ✅ 离线模式\n// ✅ 工作区支持\n// ❌ 需要额外安装\n\n// pnpm：\n// ✅ 最快\n// ✅ 最省空间\n// ✅ 严格的依赖管理\n// ✅ monorepo支持最好\n// ❌ 生态相对小\n// ❌ 部分老项目不兼容"
          }
        ]
      },
      "source": "包管理器对比"
    },

    // ========== 6. 代码补全题：自定义npm registry ==========
    {
      "type": "code-completion",
      "difficulty": "medium",
      "tags": ["npm配置"],
      "question": "如何配置项目使用私有npm源？空白处应该填什么？",
      "code": "# 方式1：使用.npmrc文件\n______\n\n# 方式2：命令行设置\nnpm config set registry https://registry.company.com",
      "options": [
        "registry=https://registry.company.com",
        "\"registry\": \"https://registry.company.com\"",
        "npm_config_registry=https://registry.company.com",
        "NPM_REGISTRY=https://registry.company.com"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "npm配置管理：",
        "sections": [
          {
            "title": ".npmrc配置文件",
            "code": "// 项目级别：.npmrc（项目根目录）\nregistry=https://registry.company.com\n@company:registry=https://registry.company.com\nsave-exact=true\npackage-lock=true\n\n// 用户级别：~/.npmrc\nregistry=https://registry.npmmirror.com\ninit-author-name=Your Name\ninit-author-email=you@example.com\n\n// 全局级别：/etc/.npmrc（少用）"
          },
          {
            "title": "常用配置",
            "code": "// .npmrc\n# 使用淘宝镜像\nregistry=https://registry.npmmirror.com\n\n# 作用域包使用不同源\n@company:registry=https://npm.company.com\n@myorg:registry=https://registry.myorg.com\n\n# 认证token\n//registry.company.com/:_authToken=your-token-here\n\n# 保存精确版本（不使用^）\nsave-exact=true\n\n# 安装时不生成lock文件\npackage-lock=false\n\n# 使用pnpm\npackage-manager=pnpm@8.0.0"
          },
          {
            "title": "命令行配置",
            "code": "// 查看配置\nnpm config list\nnpm config get registry\n\n// 设置配置\nnpm config set registry https://registry.npmmirror.com\nnpm config set @company:registry https://npm.company.com\n\n// 删除配置\nnpm config delete registry\n\n// 临时使用其他源\nnpm install --registry=https://registry.npmjs.org\n\n// 使用nrm管理多个源\nnpm install -g nrm\nnrm ls              // 列出所有源\nnrm use taobao      // 切换到淘宝源\nnrm test            // 测试所有源速度"
          },
          {
            "title": "私有包发布",
            "code": "// 1. 登录私有源\nnpm login --registry=https://registry.company.com\n\n// 2. 配置package.json\n{\n  \"name\": \"@company/my-package\",\n  \"publishConfig\": {\n    \"registry\": \"https://registry.company.com\"\n  }\n}\n\n// 3. 发布\nnpm publish\n\n// 4. 使用\nnpm install @company/my-package"
          }
        ]
      },
      "source": "npm配置"
    },

    // ========== 7. 判断题：npm link ==========
    {
      "type": "true-false",
      "difficulty": "medium",
      "tags": ["npm link"],
      "question": "npm link可以用于本地开发时链接本地包，而不需要发布到npm",
      "correctAnswer": "A",
      "explanation": {
        "title": "npm link本地开发：",
        "sections": [
          {
            "title": "正确！npm link用于本地联调",
            "content": "在开发本地包时，使用npm link可以在其他项目中测试，无需发布到npm",
            "code": "// 步骤1：在包目录创建全局链接\ncd /path/to/my-package\nnpm link\n// 在全局node_modules中创建符号链接\n\n// 步骤2：在项目中链接该包\ncd /path/to/my-project\nnpm link my-package\n// 在项目node_modules中创建指向全局的链接"
          },
          {
            "title": "完整示例",
            "code": "// 假设开发一个工具包\n// /Users/dev/my-utils/\n// ├── package.json (name: \"my-utils\")\n// └── index.js\n\n// 1. 创建全局链接\ncd /Users/dev/my-utils\nnpm link\n// 输出：/usr/local/lib/node_modules/my-utils -> /Users/dev/my-utils\n\n// 2. 在项目中使用\ncd /Users/dev/my-project\nnpm link my-utils\n// 输出：node_modules/my-utils -> /usr/local/lib/node_modules/my-utils\n\n// 3. 代码中使用\n// my-project/src/index.js\nconst utils = require('my-utils');\nutils.someFunction(); // 实时反映my-utils的修改\n\n// 4. 取消链接\nnpm unlink my-utils  // 在项目中\nnpm unlink           // 在包目录"
          },
          {
            "title": "pnpm link",
            "code": "// pnpm更简单\ncd /path/to/my-package\npnpm link --global\n\ncd /path/to/my-project\npnpm link --global my-package\n\n// 或使用workspace（推荐）\n// pnpm-workspace.yaml\npackages:\n  - 'packages/*'\n  - 'examples/*'\n\n// 自动链接，无需npm link"
          },
          {
            "title": "yarn link",
            "code": "// yarn也支持\ncd /path/to/my-package\nyarn link\n\ncd /path/to/my-project\nyarn link my-package\n\n// 取消链接\nyarn unlink my-package"
          },
          {
            "title": "注意事项",
            "code": "// ⚠️ 链接问题\n// 1. peer dependencies可能不匹配\n// 2. 不同版本的依赖可能冲突\n// 3. TypeScript路径可能需要配置\n\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"paths\": {\n      \"my-utils\": [\"/Users/dev/my-utils/src\"]\n    }\n  }\n}\n\n// ✅ 替代方案：使用相对路径\n// package.json\n{\n  \"dependencies\": {\n    \"my-utils\": \"file:../my-utils\"\n  }\n}\n\n// npm install会创建符号链接"
          }
        ]
      },
      "source": "npm link"
    },

    // ========== 8. 多选题：package.json字段 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["package.json"],
      "question": "以下哪些是package.json中的重要字段？",
      "options": [
        "main - 入口文件",
        "module - ES6模块入口",
        "exports - 条件导出",
        "type - 模块类型（module/commonjs）",
        "source - 源代码路径",
        "engines - 指定Node.js版本"
      ],
      "correctAnswer": ["A", "B", "C", "D", "F"],
      "explanation": {
        "title": "package.json关键字段：",
        "sections": [
          {
            "title": "1. 入口字段",
            "code": "{\n  // CommonJS入口\n  \"main\": \"dist/index.js\",\n  \n  // ES6 Module入口\n  \"module\": \"dist/index.esm.js\",\n  \n  // TypeScript声明文件\n  \"types\": \"dist/index.d.ts\",\n  \"typings\": \"dist/index.d.ts\", // 别名\n  \n  // 浏览器入口\n  \"browser\": \"dist/index.browser.js\"\n}"
          },
          {
            "title": "2. exports字段（现代）",
            "code": "{\n  \"exports\": {\n    // 默认导出\n    \".\": {\n      \"import\": \"./dist/index.esm.js\",\n      \"require\": \"./dist/index.cjs.js\",\n      \"types\": \"./dist/index.d.ts\"\n    },\n    // 子路径导出\n    \"./utils\": {\n      \"import\": \"./dist/utils.esm.js\",\n      \"require\": \"./dist/utils.cjs.js\"\n    },\n    // 条件导出\n    \"./feature\": {\n      \"node\": \"./dist/feature.node.js\",\n      \"browser\": \"./dist/feature.browser.js\",\n      \"default\": \"./dist/feature.js\"\n    }\n  }\n}\n\n// 使用\nimport pkg from 'my-package';           // index.esm.js\nimport utils from 'my-package/utils';   // utils.esm.js\nimport feature from 'my-package/feature'; // feature.browser.js（浏览器环境）"
          },
          {
            "title": "3. type字段",
            "code": "{\n  // 指定模块类型\n  \"type\": \"module\"  // 或 \"commonjs\"（默认）\n}\n\n// type: \"module\"\n// ├── .js文件按ES6 Module处理\n// ├── .cjs文件按CommonJS处理\n// └── 必须使用import/export\n\n// type: \"commonjs\"（默认）\n// ├── .js文件按CommonJS处理\n// ├── .mjs文件按ES6 Module处理\n// └── 可以使用require/module.exports"
          },
          {
            "title": "4. engines字段",
            "code": "{\n  \"engines\": {\n    \"node\": \">=16.0.0\",\n    \"npm\": \">=8.0.0\",\n    \"pnpm\": \">=7.0.0\"\n  },\n  \n  // 强制引擎版本检查\n  \"engineStrict\": true\n}\n\n// 用户安装时，如果版本不匹配会警告或报错"
          },
          {
            "title": "5. bin字段",
            "code": "{\n  // 单个命令\n  \"bin\": \"bin/cli.js\",\n  \n  // 或多个命令\n  \"bin\": {\n    \"my-cli\": \"bin/cli.js\",\n    \"my-tool\": \"bin/tool.js\"\n  }\n}\n\n// npm install -g后\n// 会在/usr/local/bin创建符号链接\n// 可以直接运行：my-cli"
          },
          {
            "title": "6. files字段",
            "code": "{\n  // 指定发布时包含的文件\n  \"files\": [\n    \"dist\",\n    \"src\",\n    \"README.md\"\n  ]\n}\n\n// 默认总是包含：\n// - package.json\n// - README\n// - LICENSE\n\n// 默认总是排除：\n// - node_modules\n// - .git"
          },
          {
            "title": "7. 其他重要字段",
            "code": "{\n  \"name\": \"my-package\",\n  \"version\": \"1.0.0\",\n  \"description\": \"包描述\",\n  \"keywords\": [\"工具\", \"助手\"],\n  \"author\": \"Your Name <you@example.com>\",\n  \"license\": \"MIT\",\n  \n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"https://github.com/user/repo.git\"\n  },\n  \n  \"bugs\": {\n    \"url\": \"https://github.com/user/repo/issues\"\n  },\n  \n  \"homepage\": \"https://github.com/user/repo#readme\",\n  \n  \"private\": true,  // 防止意外发布\n  \n  \"workspaces\": [   // monorepo工作区\n    \"packages/*\"\n  ]\n}"
          }
        ]
      },
      "source": "package.json字段"
    },

    // ========== 9. 代码补全题：发布npm包 ==========
    {
      "type": "code-completion",
      "difficulty": "medium",
      "tags": ["npm发布"],
      "question": "首次发布npm包的完整流程，空白处填什么命令？",
      "code": "# 1. 登录npm\n______\n\n# 2. 发布包\nnpm publish\n\n# 3. 查看已发布的包\nnpm view my-package",
      "options": [
        "npm login",
        "npm auth",
        "npm signin",
        "npm register"
      ],
      "correctAnswer": "A",
      "explanation": {
        "title": "npm包发布流程：",
        "sections": [
          {
            "title": "完整发布流程",
            "code": "// 1. 确保有npm账号\n// https://www.npmjs.com 注册\n\n// 2. 登录npm\nnpm login\n// 或指定registry\nnpm login --registry=https://registry.npmjs.org\n\n// 3. 检查package.json\n{\n  \"name\": \"my-unique-package-name\",\n  \"version\": \"1.0.0\",\n  \"description\": \"包描述\",\n  \"main\": \"dist/index.js\",\n  \"files\": [\"dist\"],\n  \"keywords\": [\"工具\"],\n  \"license\": \"MIT\"\n}\n\n// 4. 构建项目\nnpm run build\n\n// 5. 测试包\nnpm pack\n// 生成.tgz文件，可以在其他项目测试\n// npm install /path/to/package.tgz\n\n// 6. 发布\nnpm publish\n\n// 7. 验证\nnpm view my-package"
          },
          {
            "title": "发布作用域包",
            "code": "// package.json\n{\n  \"name\": \"@username/package-name\",\n  \"version\": \"1.0.0\"\n}\n\n// 公开发布作用域包（默认私有）\nnpm publish --access public\n\n// 私有包（需要付费）\nnpm publish --access restricted"
          },
          {
            "title": "版本管理",
            "code": "// 查看当前版本\nnpm version\n\n// 升级版本\nnpm version patch  // 1.0.0 -> 1.0.1\nnpm version minor  // 1.0.0 -> 1.1.0\nnpm version major  // 1.0.0 -> 2.0.0\n\n// 指定版本\nnpm version 1.2.3\n\n// 预发布版本\nnpm version prepatch  // 1.0.0 -> 1.0.1-0\nnpm version preminor  // 1.0.0 -> 1.1.0-0\nnpm version premajor  // 1.0.0 -> 2.0.0-0\n\n// 发布测试版本\nnpm publish --tag beta\n// 用户安装：npm install my-package@beta"
          },
          {
            "title": "发布前检查",
            "code": "{\n  \"scripts\": {\n    // 发布前自动运行\n    \"prepublishOnly\": \"npm run test && npm run build\",\n    \n    // 构建\n    \"build\": \"tsc\",\n    \n    // 测试\n    \"test\": \"jest\",\n    \n    // 版本更新时运行\n    \"version\": \"npm run build && git add -A dist\",\n    \n    // 发布后运行\n    \"postpublish\": \"git push && git push --tags\"\n  }\n}"
          },
          {
            "title": "取消发布",
            "code": "// 24小时内可以取消发布\nnpm unpublish my-package@1.0.0\n\n// 完全删除包（慎用）\nnpm unpublish my-package --force\n\n// 废弃包（推荐）\nnpm deprecate my-package@1.0.0 \"请使用2.0.0版本\"\n\n// 用户安装时会看到警告"
          },
          {
            "title": "发布检查清单",
            "code": "// ✅ 发布前确认\n// 1. package.json配置正确\n// 2. README.md写清楚\n// 3. LICENSE文件存在\n// 4. .npmignore或files字段配置\n// 5. 所有测试通过\n// 6. 构建成功\n// 7. 版本号符合语义化\n// 8. CHANGELOG.md更新\n\n// .npmignore\nsrc/\ntest/\n*.test.js\n.git\n.DS_Store\nnode_modules/\ntsconfig.json\n.eslintrc.js"
          }
        ]
      },
      "source": "npm发布"
    },

    // ========== 10. 多选题：最佳实践 ==========
    {
      "type": "multiple-choice",
      "difficulty": "medium",
      "tags": ["最佳实践"],
      "question": "以下哪些是npm/yarn/pnpm的最佳实践？",
      "options": [
        "提交package-lock.json到版本控制",
        "使用^或~而不是锁定确切版本",
        "CI环境使用npm ci而不是npm install",
        "定期运行npm audit修复安全漏洞",
        "全局安装所有开发工具",
        "使用.npmrc配置私有源"
      ],
      "correctAnswer": ["A", "C", "D", "F"],
      "explanation": {
        "title": "包管理最佳实践：",
        "sections": [
          {
            "title": "1. 版本控制",
            "code": "// ✅ 提交lock文件\ngit add package-lock.json yarn.lock pnpm-lock.yaml\ngit commit -m \"chore: update dependencies\"\n\n// ✅ .gitignore\nnode_modules/\n.npm/\n.yarn/\n.pnpm-store/\n\n// ⚠️ 不要忽略lock文件\n# ❌ 不要这样\n# package-lock.json\n# yarn.lock"
          },
          {
            "title": "2. CI/CD配置",
            "code": "// ✅ CI脚本\n// .github/workflows/ci.yml\n- name: Install dependencies\n  run: npm ci  # 不是npm install\n\n// npm ci特点：\n// - 严格按照lock文件\n// - 删除node_modules重新安装\n// - lock和package.json不匹配会报错\n// - 速度更快\n\n// yarn\nyarn install --frozen-lockfile\n\n// pnpm\npnpm install --frozen-lockfile"
          },
          {
            "title": "3. 安全审计",
            "code": "// 检查漏洞\nnpm audit\n\n// 自动修复\nnpm audit fix\n\n// 强制修复（可能有破坏性变更）\nnpm audit fix --force\n\n// 生成报告\nnpm audit --json > audit-report.json\n\n// package.json\n{\n  \"scripts\": {\n    \"postinstall\": \"npm audit\",\n    \"precommit\": \"npm audit\"\n  }\n}"
          },
          {
            "title": "4. 依赖管理",
            "code": "// ✅ 推荐：使用^（兼容版本）\n{\n  \"dependencies\": {\n    \"react\": \"^18.2.0\"  // 允许18.x.x\n  }\n}\n\n// ⚠️ 谨慎：锁定版本（除非必要）\n{\n  \"dependencies\": {\n    \"some-lib\": \"1.2.3\"  // 精确版本\n  }\n}\n\n// 更新依赖\nnpm outdated           // 查看过时的包\nnpm update            // 更新到允许的最新版本\nnpm update lodash     // 更新特定包\n\n// 检查未使用的依赖\nnpx depcheck"
          },
          {
            "title": "5. 开发工具安装",
            "code": "// ❌ 避免全局安装开发工具\nnpm install -g webpack eslint\n\n// ✅ 项目本地安装\nnpm install --save-dev webpack eslint\n\n// 使用npx运行\nnpx webpack\nnpx eslint .\n\n// 或npm scripts\n{\n  \"scripts\": {\n    \"build\": \"webpack\",\n    \"lint\": \"eslint .\"\n  }\n}\n\n// 全局安装的例外\n// - npm本身: npm install -g npm\n// - 版本管理: npm install -g n nvm\n// - 脚手架: npm install -g create-react-app"
          },
          {
            "title": "6. 性能优化",
            "code": "// 使用镜像源\n// .npmrc\nregistry=https://registry.npmmirror.com\n\n// 离线模式（yarn）\nyarn install --offline\n\n// 并行安装（pnpm默认）\npnpm install\n\n// 使用缓存\nnpm cache verify  // 验证缓存\nnpm cache clean --force  // 清理缓存（少用）"
          },
          {
            "title": "7. monorepo配置",
            "code": "// pnpm-workspace.yaml\npackages:\n  - 'packages/*'\n  - 'apps/*'\n  - '!**/test/**'\n\n// 根package.json\n{\n  \"name\": \"my-monorepo\",\n  \"private\": true,\n  \"workspaces\": [\n    \"packages/*\",\n    \"apps/*\"\n  ]\n}\n\n// 安装所有包的依赖\npnpm install\n\n// 为特定包添加依赖\npnpm add lodash --filter @myorg/pkg-a\n\n// 运行所有包的脚本\npnpm -r run build"
          }
        ]
      },
      "source": "最佳实践"
    }
  ],
  "navigation": {
    "prev": {
      "title": "模块系统",
      "url": "12-module-system.html"
    },
    "next": {
      "title": "构建工具",
      "url": "../advanced/13-build-tools.html"
    }
  }
};
