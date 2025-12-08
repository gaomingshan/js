/**
 * 第5章：npm安装与配置 - 面试题
 * 10道精选面试题：测试对npm安装、版本管理、配置的理解
 */

window.content = {
    section: {
        title: '第5章：npm安装与配置 - 面试题',
        icon: '🔴'
    },
    
    topics: [
        // 简单题 1
        {
            type: 'quiz',
            title: '题目1：npm与Node.js关系',
            content: {
                difficulty: 'easy',
                question: 'npm与Node.js的关系是什么？',
                options: [
                    'npm是独立的包管理器，需要单独安装',
                    'npm是Node.js的内置包管理器，随Node.js一起安装',
                    'npm需要在安装Node.js后手动下载',
                    'npm是浏览器端的包管理器'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm与Node.js',
                    content: 'npm（Node Package Manager）是Node.js的内置包管理器，安装Node.js时会自动安装npm。两者版本独立管理，可以单独升级npm而不影响Node.js。验证安装：node -v 查看Node版本，npm -v 查看npm版本。'
                }
            }
        },
        
        // 简单题 2
        {
            type: 'quiz',
            title: '题目2：版本管理工具作用',
            content: {
                difficulty: 'easy',
                question: 'nvm、n、fnm这类工具的主要作用是什么？',
                options: [
                    '包管理工具',
                    'Node.js版本管理工具',
                    '项目构建工具',
                    'npm镜像源管理工具'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'Node.js版本管理器',
                    content: 'nvm、n、fnm都是Node.js版本管理工具，用于：\n\n1. 安装多个Node版本\n2. 快速切换版本\n3. 测试不同版本兼容性\n\nnvm：最流行，跨平台\nn：tj开发，简单易用，不支持Windows\nfnm：Rust编写，速度快，自动切换\n\n使用场景：多项目需要不同Node版本时必备工具'
                }
            }
        },
        
        // 简单题 3
        {
            type: 'quiz',
            title: '题目3：npm配置查看',
            content: {
                difficulty: 'easy',
                question: '如何查看npm的所有配置？',
                options: [
                    'npm show config',
                    'npm config list',
                    'npm get config',
                    'npm view config'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm配置命令',
                    content: '常用npm配置命令：\n\n查看所有配置：\nnpm config list\n\n查看单项配置：\nnpm config get registry\n\n设置配置：\nnpm config set registry https://registry.npmmirror.com\n\n删除配置：\nnpm config delete registry\n\n配置存储在~/.npmrc文件中'
                }
            }
        },
        
        // 中等题 1
        {
            type: 'quiz',
            title: '题目4：npm配置优先级',
            content: {
                difficulty: 'medium',
                question: 'npm配置的优先级从高到低的正确顺序是？',
                options: [
                    '全局配置 > 用户配置 > 项目配置',
                    '命令行参数 > 项目配置 > 用户配置 > 全局配置',
                    '项目配置 > 用户配置 > 全局配置',
                    '用户配置 > 项目配置 > 全局配置'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'npm配置优先级',
                    content: 'npm配置优先级（从高到低）：\n\n1. 命令行参数：npm install --registry=xxx（最高优先级）\n2. 环境变量：npm_config_registry=xxx\n3. 项目配置：./.npmrc\n4. 用户配置：~/.npmrc\n5. 全局配置：$PREFIX/etc/npmrc\n6. 内置配置：npm默认值\n\n示例：项目.npmrc中设置淘宝源，该项目所有npm命令都使用淘宝源，不影响其他项目。'
                }
            }
        },
        
        // 中等题 2
        {
            type: 'quiz',
            title: '题目5：nvm常用命令',
            content: {
                difficulty: 'medium',
                question: '使用nvm安装Node.js v18.17.0并设为默认版本的命令是？',
                options: [
                    'nvm install 18.17.0 && nvm default 18.17.0',
                    'nvm install 18.17.0 && nvm alias default 18.17.0',
                    'nvm add 18.17.0 && nvm use 18.17.0',
                    'nvm get 18.17.0 && nvm set default 18.17.0'
                ],
                correctAnswer: 1,
                explanation: {
                    title: 'nvm命令详解',
                    content: 'nvm常用命令：\n\n安装版本：\nnvm install 18.17.0\nnvm install --lts  # 最新LTS\n\n切换版本：\nnvm use 18.17.0\n\n设置默认版本：\nnvm alias default 18.17.0\n\n查看版本：\nnvm ls  # 已安装\nnvm ls-remote  # 可用版本\n\n卸载版本：\nnvm uninstall 16.0.0\n\n注意：每次打开新终端需要nvm use激活版本'
                }
            }
        },
        
        // 中等题 3
        {
            type: 'quiz',
            title: '题目6：npm镜像源配置',
            content: {
                difficulty: 'medium',
                question: '如何永久设置npm使用淘宝镜像？',
                options: [
                    'npm config set registry https://registry.npmmirror.com',
                    'npm install --registry https://registry.npmmirror.com',
                    'npm use taobao',
                    'export NPM_REGISTRY=https://registry.npmmirror.com'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'npm镜像源配置',
                    content: 'npm镜像源配置方法：\n\n永久配置（推荐）：\nnpm config set registry https://registry.npmmirror.com\n写入~/.npmrc文件\n\n临时使用：\nnpm install --registry https://registry.npmmirror.com\n仅当次有效\n\n使用nrm工具：\nnpm install -g nrm\nnrm use taobao\nnrm test  # 测试速度\n\n恢复官方源：\nnpm config set registry https://registry.npmjs.org'
                }
            }
        },
        
        // 中等题 4
        {
            type: 'quiz',
            title: '题目7：npm全局路径',
            content: {
                difficulty: 'medium',
                question: 'npm全局包的安装路径由哪个配置项决定？',
                options: [
                    'global-path',
                    'install-dir',
                    'prefix',
                    'global-folder'
                ],
                correctAnswer: 2,
                explanation: {
                    title: 'npm prefix配置',
                    content: 'npm的prefix配置决定全局包安装位置：\n\n查看prefix：\nnpm config get prefix\nnpm prefix -g\n\n修改prefix：\nnpm config set prefix "/usr/local"\n\n路径说明：\n- 全局包：{prefix}/lib/node_modules\n- 可执行文件：{prefix}/bin\n\n默认路径：\n- Mac/Linux: /usr/local\n- Windows: %APPDATA%\\npm\n\n注意：修改后需将{prefix}/bin加入PATH环境变量'
                }
            }
        },
        
        // 困难题 1
        {
            type: 'quiz',
            title: '题目8：npm环境变量',
            content: {
                difficulty: 'hard',
                question: '关于npm环境变量，以下说法错误的是？',
                options: [
                    'npm会将package.json的config字段暴露为环境变量',
                    '环境变量以npm_config_为前缀可覆盖npm配置',
                    'npm_package_开头的变量可访问package.json字段',
                    'npm环境变量只在npm scripts中可用，应用代码无法访问'
                ],
                correctAnswer: 3,
                explanation: {
                    title: 'npm环境变量机制',
                    content: 'npm环境变量详解：\n\n1. npm_package_* 系列\n暴露package.json所有字段\n示例：npm_package_name、npm_package_version\n在scripts和Node.js代码中都可用：process.env.npm_package_name\n\n2. npm_config_* 系列\n暴露npm配置项\n可覆盖.npmrc配置\n优先级高于配置文件\n\n3. package.json的config\n{"config": {"port": "8080"}}\n可通过npm_package_config_port访问\n\n4. 生命周期变量\nnpm_lifecycle_event：当前脚本名\nnpm_lifecycle_script：脚本内容'
                }
            }
        },
        
        // 困难题 2
        {
            type: 'quiz-code',
            title: '题目9：.nvmrc文件作用',
            content: {
                difficulty: 'hard',
                question: '项目中创建.nvmrc文件的作用是什么？',
                code: `// .nvmrc文件内容
18.17.0

// 或者
lts/hydrogen`,
                options: [
                    '指定npm版本，自动安装',
                    '指定Node.js版本，团队成员nvm use时自动切换',
                    '配置npm镜像源',
                    '锁定依赖包版本'
                ],
                correctAnswer: 1,
                explanation: {
                    title: '.nvmrc文件详解',
                    content: '.nvmrc是nvm的项目配置文件：\n\n作用：\n- 指定项目需要的Node.js版本\n- 团队成员统一开发环境\n- 避免版本不一致问题\n\n使用方式：\ncd 项目目录\nnvm use  # 自动读取.nvmrc\nnvm install  # 安装.nvmrc指定版本\n\n自动切换（配置shell）：\n每次进入目录自动切换Node版本\n\n类似工具：\n- fnm：自动检测.node-version\n- volta：支持package.json中的volta字段\n\n最佳实践：结合engines字段使用'
                }
            }
        },
        
        // 困难题 3
        {
            type: 'quiz',
            title: '题目10：npm代理配置',
            content: {
                difficulty: 'hard',
                question: '在公司内网环境下，如何正确配置npm使用代理？',
                options: [
                    'npm config set proxy http://proxy.company.com:8080',
                    'npm config set registry http://proxy.company.com:8080',
                    'export HTTP_PROXY=http://proxy.company.com:8080',
                    'npm install --proxy http://proxy.company.com:8080'
                ],
                correctAnswer: 0,
                explanation: {
                    title: 'npm代理配置',
                    content: 'npm代理配置详解：\n\n配置HTTP代理：\nnpm config set proxy http://proxy.company.com:8080\nnpm config set https-proxy http://proxy.company.com:8080\n\n需要认证的代理：\nnpm config set proxy http://username:password@proxy:8080\n\n环境变量方式：\nexport HTTP_PROXY=http://proxy:8080\nexport HTTPS_PROXY=http://proxy:8080\nexport NO_PROXY=localhost,127.0.0.1\n\n取消代理：\nnpm config delete proxy\nnpm config delete https-proxy\n\n注意：HTTPS代理也使用http://协议'
                }
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第4章面试题：registry与镜像源',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=04'
        },
        next: {
            title: '第6章面试题：package.json详解',
            url: './render.html?subject=pkg-manager&type=quiz&chapter=06'
        }
    }
};
