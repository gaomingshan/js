/**
 * 第13章：npm生命周期钩子
 * install/publish/version生命周期、prepare钩子、自动化流程
 */

window.content = {
    section: {
        title: '第13章：npm生命周期钩子',
        icon: '🔄'
    },
    
    topics: [
        {
            type: 'concept',
            title: 'npm生命周期钩子',
            content: {
                description: 'npm在执行命令时会触发一系列生命周期钩子，允许开发者在特定阶段自动执行脚本，实现自动化流程。',
                keyPoints: [
                    '生命周期：npm命令执行的不同阶段',
                    '钩子脚本：pre/post前缀的scripts',
                    '自动触发：无需手动调用',
                    'install周期：依赖安装过程',
                    'publish周期：包发布过程',
                    'version周期：版本更新过程',
                    '自定义钩子：为自定义scripts添加钩子'
                ],
                mdn: 'https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-scripts'
            }
        },
        
        {
            type: 'principle',
            title: 'install生命周期',
            content: {
                description: 'install是最常用的生命周期，在npm install时自动执行，用于构建、编译、初始化等操作。',
                mechanism: 'npm install执行时会按顺序触发preinstall → install → postinstall → prepare等钩子，每个钩子可以执行不同的任务。',
                keyPoints: [
                    'preinstall：安装前执行，检查环境',
                    'install：主安装阶段，编译native模块',
                    'postinstall：安装后执行，构建、补丁',
                    'prepublish：已废弃，不推荐使用',
                    'prepare：npm 7+推荐，代替prepublish',
                    '执行顺序：pre → main → post → prepare'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'install生命周期示例',
            content: {
                description: 'install钩子常用于构建、编译、应用补丁等自动化任务。',
                examples: [
                    {
                        title: '基本install钩子',
                        code: `{
  "scripts": {
    // 安装前检查Node版本
    "preinstall": "node scripts/check-node-version.js",
    
    // 主安装（通常用于native模块）
    "install": "node-gyp rebuild",
    
    // 安装后构建
    "postinstall": "npm run build",
    
    // npm 7+推荐使用prepare
    "prepare": "husky install"
  }
}

// npm install执行顺序：
// 1. 下载依赖包
// 2. preinstall
// 3. install
// 4. postinstall
// 5. prepare`,
                        notes: 'install钩子在每次npm install时执行'
                    },
                    {
                        title: '实际应用场景',
                        code: `{
  "scripts": {
    // 1. patch-package: 应用依赖补丁
    "postinstall": "patch-package",
    
    // 2. husky: 安装Git hooks
    "prepare": "husky install",
    
    // 3. 构建TypeScript
    "postinstall": "npm run build",
    
    // 4. 下载外部资源
    "postinstall": "node scripts/download-assets.js",
    
    // 5. 链接二进制文件
    "postinstall": "node scripts/link-bin.js"
  }
}`,
                        notes: '常见的postinstall用途'
                    },
                    {
                        title: '条件执行钩子',
                        code: `// scripts/postinstall.js
// 只在开发环境执行
if (process.env.NODE_ENV !== 'production') {
  console.log('Running dev setup...');
  // 执行开发环境初始化
}

// package.json
{
  "scripts": {
    "postinstall": "node scripts/postinstall.js"
  }
}

// 或使用cross-env
{
  "scripts": {
    "postinstall": "cross-env-shell \\"if [ $NODE_ENV != 'production' ]; then npm run dev-setup; fi\\""
  }
}`,
                        notes: '根据环境条件执行不同任务'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'publish生命周期',
            content: {
                description: 'publish生命周期在发布包时触发，确保发布前代码已构建、测试通过。',
                mechanism: 'npm publish执行时依次触发prepublishOnly → prepare → prepublish（废弃）→ publish → postpublish，控制发布流程的各个阶段。',
                keyPoints: [
                    'prepublishOnly：仅npm publish时执行（推荐）',
                    'prepare：install和publish都会执行',
                    'prepublish：已废弃，行为混乱',
                    'publish：发布时执行',
                    'postpublish：发布后执行，通知、部署',
                    '区别：prepublishOnly vs prepare'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'publish生命周期示例',
            content: {
                description: 'publish钩子确保发布的包质量，自动化发布流程。',
                examples: [
                    {
                        title: '标准publish流程',
                        code: `{
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint src",
    
    // 仅在npm publish时执行（推荐）
    "prepublishOnly": "npm run lint && npm run test && npm run build",
    
    // install和publish都会执行
    "prepare": "husky install || true",
    
    // 发布后通知
    "postpublish": "node scripts/notify-release.js"
  }
}

// npm publish执行顺序：
// 1. prepublishOnly → 检查、测试、构建
// 2. prepare → 准备工作
// 3. publish → 上传到registry
// 4. postpublish → 发布后操作`,
                        notes: 'prepublishOnly是发布前检查的最佳时机'
                    },
                    {
                        title: 'prepare vs prepublishOnly',
                        code: `{
  "scripts": {
    // prepare会在以下情况执行：
    // - npm install（包括用户安装你的包）
    // - npm publish
    // - git依赖安装
    "prepare": "husky install",
    
    // prepublishOnly仅在以下情况执行：
    // - npm publish（本地发布）
    "prepublishOnly": "npm run build",
    
    // 建议：
    // prepare: 轻量级任务（如Git hooks）
    // prepublishOnly: 重量级任务（如构建、测试）
  }
}`,
                        notes: 'prepare会影响用户安装，要谨慎使用'
                    },
                    {
                        title: 'postpublish自动化',
                        code: `// scripts/post-publish.js
const pkg = require('../package.json');
const https = require('https');

// 发布后通知Slack
function notifySlack() {
  const data = JSON.stringify({
    text: \`📦 \${pkg.name}@\${pkg.version} 已发布到npm!\`
  });
  
  const options = {
    hostname: 'hooks.slack.com',
    path: process.env.SLACK_WEBHOOK_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  
  const req = https.request(options);
  req.write(data);
  req.end();
}

notifySlack();

// package.json
{
  "scripts": {
    "postpublish": "node scripts/post-publish.js"
  }
}`,
                        notes: 'postpublish用于通知、文档部署等'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: 'version生命周期',
            content: {
                description: 'version生命周期在npm version命令时触发，自动化版本更新、构建、标签等流程。',
                mechanism: 'npm version执行时触发preversion → version → postversion，可以在版本更新前后执行测试、构建、推送等操作。',
                keyPoints: [
                    'preversion：版本更新前，运行测试',
                    'version：版本更新后、commit前，构建代码',
                    'postversion：commit后，推送到远程',
                    '自动commit：version自动创建commit和tag',
                    '工作流：test → update → build → commit → push'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: 'version生命周期示例',
            content: {
                description: 'version钩子实现完全自动化的版本发布流程。',
                examples: [
                    {
                        title: '完整version工作流',
                        code: `{
  "scripts": {
    // 1. 版本更新前：确保测试通过
    "preversion": "npm test",
    
    // 2. 版本更新后、commit前：构建并暂存
    "version": "npm run build && git add -A dist",
    
    // 3. commit和tag后：推送并发布
    "postversion": "git push && git push --tags && npm publish"
  }
}

// 执行npm version patch的完整流程：
// 1. preversion: 运行测试
// 2. 更新package.json的version字段
// 3. version: 构建代码，暂存dist
// 4. git commit -m "x.x.x"
// 5. git tag vx.x.x
// 6. postversion: 推送到远程，发布到npm`,
                        notes: '一条命令完成版本更新和发布'
                    },
                    {
                        title: '更新CHANGELOG',
                        code: `{
  "scripts": {
    "preversion": "npm test",
    "version": "npm run build && npm run changelog && git add -A",
    "postversion": "git push && git push --tags && npm publish",
    
    // 生成CHANGELOG
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s"
  }
}

// 需要安装conventional-changelog-cli
// npm install --save-dev conventional-changelog-cli

// 执行后会：
// 1. 基于commit message生成CHANGELOG
// 2. 暂存CHANGELOG.md
// 3. 包含在version的commit中`,
                        notes: '自动更新CHANGELOG'
                    }
                ]
            }
        },
        
        {
            type: 'comparison',
            title: '主要生命周期钩子对比',
            content: {
                description: '理解不同钩子的触发时机和适用场景，选择合适的钩子。',
                items: [
                    {
                        name: 'prepare',
                        pros: [
                            'npm 7+推荐使用',
                            'install和publish都会触发',
                            '适合轻量级任务（Git hooks）',
                            '替代废弃的prepublish'
                        ],
                        cons: [
                            '用户安装时也会执行',
                            '不适合重量级构建',
                            '失败会导致安装失败'
                        ]
                    },
                    {
                        name: 'prepublishOnly',
                        pros: [
                            '仅发布时执行',
                            '适合构建、测试等重任务',
                            '不影响用户安装',
                            '发布前最后检查'
                        ],
                        cons: [
                            'npm 4+才支持',
                            '本地发布专用'
                        ]
                    },
                    {
                        name: 'postinstall',
                        pros: [
                            '安装后自动执行',
                            '适合补丁、构建产物',
                            '灵活性高'
                        ],
                        cons: [
                            '拖慢安装速度',
                            '可能失败导致安装失败',
                            '用户可能禁用（--ignore-scripts）'
                        ]
                    }
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '自定义钩子',
            content: {
                description: '除了内置钩子，自定义scripts也可以添加pre/post钩子。',
                examples: [
                    {
                        title: '自定义scripts的钩子',
                        code: `{
  "scripts": {
    // 自定义deploy脚本
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist",
    "postdeploy": "echo '✅ Deployed successfully!'",
    
    // 自定义release脚本
    "prerelease": "npm run lint && npm test",
    "release": "npm version patch && npm publish",
    "postrelease": "node scripts/notify.js",
    
    // 自定义dev脚本
    "predev": "npm run clean",
    "dev": "vite",
    "postdev": "echo 'Dev server stopped'"
  }
}

// 执行npm run deploy会依次执行：
// 1. predeploy
// 2. deploy
// 3. postdeploy`,
                        notes: '任何自定义scripts都可以有pre/post钩子'
                    }
                ]
            }
        },
        
        {
            type: 'principle',
            title: '钩子失败处理',
            content: {
                description: '钩子脚本失败会中断后续流程，需要正确处理错误和设置容错。',
                mechanism: '钩子脚本返回非0退出码时视为失败，npm会中断当前操作。可以通过|| true等方式实现容错。',
                keyPoints: [
                    '失败中断：钩子失败会中断npm命令',
                    '退出码：非0表示失败',
                    '容错处理：|| true允许失败继续',
                    '条件执行：根据环境决定是否执行',
                    '--ignore-scripts：用户可以跳过钩子',
                    '日志输出：便于调试问题'
                ]
            }
        },
        
        {
            type: 'code-example',
            title: '钩子错误处理',
            content: {
                description: '合理处理钩子错误，避免阻塞用户。',
                examples: [
                    {
                        title: '容错处理',
                        code: `{
  "scripts": {
    // ❌ 失败会中断
    "prepare": "husky install",
    
    // ✅ 允许失败（如用户没有.git目录）
    "prepare": "husky install || true",
    
    // ✅ 条件执行
    "prepare": "node -e \\"if (fs.existsSync('.git')) process.exit(0)\\" && husky install || true",
    
    // ✅ 使用脚本文件处理
    "prepare": "node scripts/prepare.js"
  }
}

// scripts/prepare.js
try {
  if (require('fs').existsSync('.git')) {
    require('child_process').execSync('husky install');
    console.log('✅ Git hooks installed');
  }
} catch (err) {
  console.warn('⚠️ Failed to install git hooks:', err.message);
  // 不抛出错误，允许继续
}`,
                        notes: '关键钩子要有容错机制'
                    },
                    {
                        title: '用户跳过钩子',
                        code: `# 用户可以跳过所有钩子
npm install --ignore-scripts

# CI环境通常跳过钩子
npm ci --ignore-scripts

# 开发者需要考虑这种情况
# 确保核心功能不依赖钩子`,
                        notes: '不要让核心功能依赖钩子'
                    }
                ]
            }
        },
        
        {
            type: 'best-practice',
            title: 'npm生命周期钩子最佳实践',
            content: {
                description: '正确使用生命周期钩子可以大幅提升开发效率和自动化程度。',
                keyPoints: [
                    'prepare用于轻量级：Git hooks等轻量任务',
                    'prepublishOnly用于构建：测试和构建等重任务',
                    'postinstall谨慎使用：避免拖慢用户安装',
                    '容错处理：关键钩子要允许失败',
                    '环境检测：根据环境条件执行',
                    '日志清晰：输出有意义的日志',
                    '文档说明：在README中说明钩子行为',
                    '避免滥用：不要过度依赖钩子'
                ]
            }
        }
    ],
    
    navigation: {
        prev: {
            title: '第12章：npm包开发最佳实践',
            url: './render.html?subject=pkg-manager&type=content&chapter=12'
        },
        next: {
            title: '第14章：npm安全',
            url: './render.html?subject=pkg-manager&type=content&chapter=14'
        }
    }
};
