// 第15章：表单高级控件 - 内容数据
window.htmlContentData_15 = {
    section: {
        title: "表单高级控件",
        icon: "🎛️"
    },
    topics: [
        {
            type: "concept",
            title: "高级表单控件概述",
            content: {
                description: "除了基本的input元素，HTML还提供了更多专门的表单控件，用于特定的输入场景，如多行文本、下拉选择、文件上传等。",
                keyPoints: [
                    "textarea用于多行文本输入",
                    "select和option创建下拉选择",
                    "datalist提供输入建议",
                    "progress和meter显示进度和度量",
                    "output显示计算结果",
                    "fieldset和legend组织表单结构"
                ],
                mdn: "https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element#表单"
            }
        },
        {
            type: "code-example",
            title: "<textarea>多行文本",
            content: {
                description: "textarea用于输入多行文本，如评论、描述等。",
                examples: [
                    {
                        title: "基本textarea",
                        code: `<label for="comment">评论：</label>
<textarea id="comment" 
          name="comment"
          rows="5"
          cols="50"
          placeholder="请输入您的评论..."
          maxlength="500"
          required></textarea>

<small>还可以输入 <span id="remaining">500</span> 字</small>

<script>
const textarea = document.getElementById('comment');
const remaining = document.getElementById('remaining');

textarea.addEventListener('input', () => {
    const max = textarea.maxLength;
    const current = textarea.value.length;
    remaining.textContent = max - current;
});
</script>`,
                        notes: "rows和cols设置默认尺寸"
                    },
                    {
                        title: "textarea属性",
                        code: `<textarea 
    name="description"
    
    <!-- 行数和列数 -->
    rows="10"
    cols="50"
    
    <!-- 最小和最大长度 -->
    minlength="10"
    maxlength="1000"
    
    <!-- 占位符 -->
    placeholder="请详细描述..."
    
    <!-- 必填 -->
    required
    
    <!-- 只读 -->
    readonly
    
    <!-- 禁用 -->
    disabled
    
    <!-- 自动聚焦 -->
    autofocus
    
    <!-- 拼写检查 -->
    spellcheck="true"
    
    <!-- 换行方式 -->
    wrap="soft">
</textarea>

<!-- wrap属性：
     - soft: 提交时不包含换行（默认）
     - hard: 提交时包含换行
-->`,
                        notes: "maxlength限制字符数"
                    },
                    {
                        title: "自动调整高度",
                        code: `<textarea id="auto-textarea"
          placeholder="输入内容，自动调整高度..."
          style="resize: none; overflow: hidden;"></textarea>

<script>
const textarea = document.getElementById('auto-textarea');

function autoResize() {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

textarea.addEventListener('input', autoResize);
autoResize(); // 初始化
</script>

<style>
    #auto-textarea {
        width: 100%;
        min-height: 50px;
        padding: 10px;
        font-family: inherit;
        font-size: inherit;
        line-height: 1.5;
    }
</style>`,
                        notes: "通过JS实现自动高度调整"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<select>下拉选择",
            content: {
                description: "select元素创建下拉选择列表。",
                examples: [
                    {
                        title: "基本select",
                        code: `<label for="country">国家：</label>
<select id="country" name="country" required>
    <option value="">请选择</option>
    <option value="cn">中国</option>
    <option value="us">美国</option>
    <option value="jp">日本</option>
    <option value="uk">英国</option>
</select>

<!-- 默认选中 -->
<select name="color">
    <option value="red">红色</option>
    <option value="blue" selected>蓝色</option>
    <option value="green">绿色</option>
</select>

<!-- 禁用选项 -->
<select name="plan">
    <option value="free">免费版</option>
    <option value="pro">专业版</option>
    <option value="enterprise" disabled>企业版（即将推出）</option>
</select>`,
                        notes: "第一个空option作为提示"
                    },
                    {
                        title: "选项分组",
                        code: `<label for="food">选择食物：</label>
<select id="food" name="food">
    <optgroup label="水果">
        <option value="apple">苹果</option>
        <option value="banana">香蕉</option>
        <option value="orange">橙子</option>
    </optgroup>
    
    <optgroup label="蔬菜">
        <option value="carrot">胡萝卜</option>
        <option value="tomato">西红柿</option>
        <option value="cucumber">黄瓜</option>
    </optgroup>
    
    <optgroup label="肉类" disabled>
        <option value="beef">牛肉</option>
        <option value="pork">猪肉</option>
    </optgroup>
</select>`,
                        notes: "optgroup分组显示选项"
                    },
                    {
                        title: "多选select",
                        code: `<label for="skills">技能（按住Ctrl多选）：</label>
<select id="skills" 
        name="skills"
        multiple
        size="5">
    <option value="html">HTML</option>
    <option value="css">CSS</option>
    <option value="js">JavaScript</option>
    <option value="react">React</option>
    <option value="vue">Vue</option>
    <option value="node">Node.js</option>
</select>

<script>
// 获取选中的值
const skills = document.getElementById('skills');
const selected = Array.from(skills.selectedOptions).map(opt => opt.value);
console.log(selected);
</script>

<style>
    select[multiple] {
        width: 200px;
        padding: 5px;
    }
</style>`,
                        notes: "multiple允许多选，size设置可见行数"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<datalist>输入建议",
            content: {
                description: "datalist为input提供预定义选项列表。",
                examples: [
                    {
                        title: "基本datalist",
                        code: `<label for="browser">浏览器：</label>
<input type="text" 
       id="browser" 
       name="browser"
       list="browsers"
       placeholder="选择或输入...">

<datalist id="browsers">
    <option value="Chrome">
    <option value="Firefox">
    <option value="Safari">
    <option value="Edge">
    <option value="Opera">
</datalist>`,
                        notes: "用户可以选择或自由输入"
                    },
                    {
                        title: "带描述的datalist",
                        code: `<label for="city">城市：</label>
<input type="text" 
       id="city" 
       name="city"
       list="cities">

<datalist id="cities">
    <option value="北京" label="首都">
    <option value="上海" label="直辖市">
    <option value="广州" label="广东省">
    <option value="深圳" label="经济特区">
</datalist>`,
                        notes: "label属性提供额外说明"
                    },
                    {
                        title: "动态datalist",
                        code: `<label for="search">搜索：</label>
<input type="text" 
       id="search" 
       name="search"
       list="suggestions"
       autocomplete="off">

<datalist id="suggestions"></datalist>

<script>
const input = document.getElementById('search');
const datalist = document.getElementById('suggestions');

// 模拟搜索建议
const allItems = [
    'JavaScript教程',
    'Java开发指南',
    'Python入门',
    'React框架',
    'Vue.js实战'
];

input.addEventListener('input', () => {
    const value = input.value.toLowerCase();
    const filtered = allItems.filter(item => 
        item.toLowerCase().includes(value)
    );
    
    datalist.innerHTML = filtered
        .map(item => \`<option value="\${item}">\`)
        .join('');
});
</script>`,
                        notes: "可以动态更新建议列表"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<progress>和<meter>",
            content: {
                description: "progress显示任务进度，meter显示已知范围内的度量值。",
                examples: [
                    {
                        title: "progress进度条",
                        code: `<!-- 不确定进度 -->
<label>加载中...</label>
<progress></progress>

<!-- 确定进度 -->
<label>上传进度：</label>
<progress value="65" max="100">65%</progress>

<!-- 动态更新 -->
<progress id="file-progress" value="0" max="100"></progress>
<span id="progress-text">0%</span>

<script>
const progress = document.getElementById('file-progress');
const text = document.getElementById('progress-text');
let value = 0;

const interval = setInterval(() => {
    value += 10;
    progress.value = value;
    text.textContent = value + '%';
    
    if (value >= 100) {
        clearInterval(interval);
    }
}, 500);
</script>

<style>
    progress {
        width: 300px;
        height: 20px;
    }
    
    /* 自定义样式 */
    progress::-webkit-progress-bar {
        background-color: #f0f0f0;
        border-radius: 10px;
    }
    
    progress::-webkit-progress-value {
        background-color: #4CAF50;
        border-radius: 10px;
    }
</style>`,
                        notes: "不设置value显示不确定进度"
                    },
                    {
                        title: "meter度量",
                        code: `<!-- 基本meter -->
<label>磁盘使用：</label>
<meter value="60" min="0" max="100">60%</meter>

<!-- 带优化、警告、危险值 -->
<label>温度：</label>
<meter value="75" 
       min="0" 
       max="100"
       low="30"
       high="80"
       optimum="50">75°C</meter>

<!-- 不同状态的meter -->
<div>
    <label>优化状态（绿色）：</label>
    <meter value="50" min="0" max="100" 
           low="30" high="70" optimum="50"></meter>
</div>

<div>
    <label>警告状态（黄色）：</label>
    <meter value="80" min="0" max="100" 
           low="30" high="70" optimum="50"></meter>
</div>

<div>
    <label>危险状态（红色）：</label>
    <meter value="95" min="0" max="100" 
           low="30" high="70" optimum="50"></meter>
</div>

<!-- meter vs progress：
     meter: 显示已知范围内的度量（如磁盘使用、评分）
     progress: 显示任务完成进度
-->`,
                        notes: "meter根据值自动显示不同颜色"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<output>输出结果",
            content: {
                description: "output元素显示计算或操作的结果。",
                examples: [
                    {
                        title: "计算器示例",
                        code: `<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
    <input type="number" id="a" value="0"> +
    <input type="number" id="b" value="0"> =
    <output name="result" for="a b">0</output>
</form>

<!-- 更复杂的计算 -->
<form id="calculator">
    <label>
        价格: <input type="number" id="price" value="100" min="0">
    </label>
    <label>
        数量: <input type="number" id="quantity" value="1" min="1">
    </label>
    <label>
        折扣: <input type="range" id="discount" min="0" max="100" value="0">
        <output id="discount-display">0</output>%
    </label>
    <p>
        总价: ¥<output id="total">100</output>
    </p>
</form>

<script>
const form = document.getElementById('calculator');
const price = document.getElementById('price');
const quantity = document.getElementById('quantity');
const discount = document.getElementById('discount');
const discountDisplay = document.getElementById('discount-display');
const total = document.getElementById('total');

function calculate() {
    const p = parseFloat(price.value) || 0;
    const q = parseInt(quantity.value) || 1;
    const d = parseInt(discount.value) || 0;
    
    discountDisplay.value = d;
    const result = p * q * (1 - d / 100);
    total.value = result.toFixed(2);
}

form.addEventListener('input', calculate);
calculate();
</script>`,
                        notes: "output显示动态计算结果"
                    }
                ]
            }
        },
        {
            type: "code-example",
            title: "<fieldset>和<legend>",
            content: {
                description: "fieldset将相关表单控件分组，legend提供组标题。",
                examples: [
                    {
                        title: "基本分组",
                        code: `<form>
    <fieldset>
        <legend>个人信息</legend>
        <label for="name">姓名：</label>
        <input type="text" id="name" name="name">
        
        <label for="age">年龄：</label>
        <input type="number" id="age" name="age">
    </fieldset>
    
    <fieldset>
        <legend>联系方式</legend>
        <label for="email">邮箱：</label>
        <input type="email" id="email" name="email">
        
        <label for="phone">电话：</label>
        <input type="tel" id="phone" name="phone">
    </fieldset>
    
    <button type="submit">提交</button>
</form>

<style>
    fieldset {
        margin-bottom: 20px;
        padding: 15px;
        border: 2px solid #ddd;
        border-radius: 5px;
    }
    
    legend {
        padding: 0 10px;
        font-weight: bold;
        color: #333;
    }
</style>`,
                        notes: "fieldset提供视觉和语义分组"
                    },
                    {
                        title: "禁用fieldset",
                        code: `<fieldset disabled>
    <legend>已禁用的部分</legend>
    <label>
        用户名: <input type="text" name="username">
    </label>
    <label>
        密码: <input type="password" name="password">
    </label>
</fieldset>

<!-- disabled会禁用fieldset内的所有控件 -->`,
                        notes: "禁用fieldset会禁用内部所有控件"
                    },
                    {
                        title: "单选按钮分组",
                        code: `<form>
    <fieldset>
        <legend>选择您的计划</legend>
        <label>
            <input type="radio" name="plan" value="free" checked>
            免费版 - ¥0/月
        </label>
        <label>
            <input type="radio" name="plan" value="pro">
            专业版 - ¥99/月
        </label>
        <label>
            <input type="radio" name="plan" value="enterprise">
            企业版 - ¥999/月
        </label>
    </fieldset>
    
    <fieldset>
        <legend>附加选项</legend>
        <label>
            <input type="checkbox" name="backup">
            数据备份 (+¥20/月)
        </label>
        <label>
            <input type="checkbox" name="support">
            优先支持 (+¥50/月)
        </label>
    </fieldset>
</form>`,
                        notes: "用fieldset组织相关选项"
                    }
                ]
            }
        },
        {
            type: "best-practice",
            title: "高级控件最佳实践",
            content: {
                description: "正确使用高级表单控件：",
                practices: [
                    {
                        title: "textarea设置合理的rows",
                        description: "避免太小或太大。",
                        example: `<!-- ✅ 好：合适的大小 -->
<textarea rows="5" cols="50"></textarea>

<!-- ❌ 不好：太小 -->
<textarea rows="1"></textarea>

<!-- ❌ 不好：太大 -->
<textarea rows="50"></textarea>`
                    },
                    {
                        title: "select提供默认选项",
                        description: "第一个option作为提示。",
                        example: `<!-- ✅ 好 -->
<select name="country" required>
    <option value="">请选择国家</option>
    <option value="cn">中国</option>
</select>

<!-- ❌ 不好：没有提示 -->
<select name="country">
    <option value="cn">中国</option>
</select>`
                    },
                    {
                        title: "datalist增强用户体验",
                        description: "提供建议但允许自由输入。",
                        example: `<input type="text" list="suggestions">
<datalist id="suggestions">
    <option value="常见选项1">
    <option value="常见选项2">
</datalist>`
                    },
                    {
                        title: "合理使用fieldset分组",
                        description: "让表单结构更清晰。",
                        example: `<form>
    <fieldset>
        <legend>账号信息</legend>
        <!-- 账号相关字段 -->
    </fieldset>
    <fieldset>
        <legend>个人资料</legend>
        <!-- 个人信息字段 -->
    </fieldset>
</form>`
                    }
                ]
            }
        },
        {
            type: "checklist",
            title: "高级控件检查清单",
            content: {
                description: "确保高级控件的正确使用：",
                items: [
                    { id: "check15-1", text: "textarea设置了合理的rows和cols" },
                    { id: "check15-2", text: "select提供了默认提示选项" },
                    { id: "check15-3", text: "optgroup合理组织了选项" },
                    { id: "check15-4", text: "datalist的id与input的list匹配" },
                    { id: "check15-5", text: "progress显示了准确的进度" },
                    { id: "check15-6", text: "meter设置了合适的范围值" },
                    { id: "check15-7", text: "output正确关联了输入控件" },
                    { id: "check15-8", text: "fieldset有描述性的legend" },
                    { id: "check15-9", text: "多选select设置了size属性" },
                    { id: "check15-10", text: "测试了所有控件的键盘操作" }
                ]
            }
        }
    ],
    navigation: {
        prev: { title: "表单基础", url: "content.html?chapter=14" },
        next: { title: "HTML5表单新特性", url: "content.html?chapter=16" }
    }
};
