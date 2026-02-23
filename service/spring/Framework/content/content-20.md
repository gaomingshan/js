# 第 20 章：视图解析与渲染

> **学习目标**：掌握 Spring MVC 视图解析和渲染机制  
> **预计时长**：2 小时  
> **难度级别**：⭐⭐⭐ 进阶

---

## 1. 核心概念

**ViewResolver**：视图解析器，将视图名解析为 View 对象  
**View**：视图对象，负责渲染数据

---

## 2. ViewResolver 接口

```java
@FunctionalInterface
public interface ViewResolver {
    
    /**
     * 将视图名解析为 View 对象
     */
    @Nullable
    View resolveViewName(String viewName, Locale locale) throws Exception;
}
```

---

## 3. 常用视图解析器

### 3.1 InternalResourceViewResolver

```java
// JSP 视图解析器
@Bean
public ViewResolver internalResourceViewResolver() {
    InternalResourceViewResolver resolver = new InternalResourceViewResolver();
    resolver.setPrefix("/WEB-INF/views/");
    resolver.setSuffix(".jsp");
    resolver.setViewClass(JstlView.class);
    return resolver;
}

// Controller
@GetMapping("/users")
public String list(Model model) {
    model.addAttribute("users", userService.findAll());
    return "user/list";  // 解析为 /WEB-INF/views/user/list.jsp
}
```

### 3.2 ThymeleafViewResolver

```java
// Thymeleaf 配置
@Bean
public SpringResourceTemplateResolver templateResolver() {
    SpringResourceTemplateResolver resolver = new SpringResourceTemplateResolver();
    resolver.setPrefix("classpath:/templates/");
    resolver.setSuffix(".html");
    resolver.setTemplateMode(TemplateMode.HTML);
    resolver.setCharacterEncoding("UTF-8");
    return resolver;
}

@Bean
public SpringTemplateEngine templateEngine() {
    SpringTemplateEngine engine = new SpringTemplateEngine();
    engine.setTemplateResolver(templateResolver());
    return engine;
}

@Bean
public ThymeleafViewResolver viewResolver() {
    ThymeleafViewResolver resolver = new ThymeleafViewResolver();
    resolver.setTemplateEngine(templateEngine());
    resolver.setCharacterEncoding("UTF-8");
    return resolver;
}
```

### 3.3 ContentNegotiatingViewResolver

```java
// 内容协商视图解析器
@Bean
public ViewResolver contentNegotiatingViewResolver(ContentNegotiationManager manager) {
    ContentNegotiatingViewResolver resolver = new ContentNegotiatingViewResolver();
    resolver.setContentNegotiationManager(manager);
    
    List<ViewResolver> viewResolvers = new ArrayList<>();
    viewResolvers.add(internalResourceViewResolver());
    viewResolvers.add(jsonViewResolver());
    resolver.setViewResolvers(viewResolvers);
    
    return resolver;
}
```

---

## 4. View 接口

```java
public interface View {
    
    /**
     * 渲染视图
     */
    void render(@Nullable Map<String, ?> model, HttpServletRequest request,
            HttpServletResponse response) throws Exception;
}
```

---

## 5. 常用视图类型

### 5.1 JSON 视图

```java
@RestController
@RequestMapping("/api/users")
public class UserRestController {
    
    @GetMapping
    public List<User> list() {
        return userService.findAll();  // 自动转换为 JSON
    }
    
    @GetMapping("/{id}")
    public User get(@PathVariable Long id) {
        return userService.findById(id);  // 自动转换为 JSON
    }
}
```

### 5.2 重定向视图

```java
@PostMapping("/users")
public String createUser(@ModelAttribute User user) {
    userService.save(user);
    return "redirect:/users";  // 重定向到用户列表
}

// 带参数的重定向
@PostMapping("/users")
public String createUser(@ModelAttribute User user, RedirectAttributes redirectAttributes) {
    userService.save(user);
    redirectAttributes.addFlashAttribute("message", "创建成功");
    return "redirect:/users";
}
```

### 5.3 转发视图

```java
@GetMapping("/search")
public String search() {
    return "forward:/users";  // 转发到 /users
}
```

---

## 6. 模型数据传递

### 6.1 Model

```java
@GetMapping("/users")
public String list(Model model) {
    model.addAttribute("users", userService.findAll());
    model.addAttribute("title", "用户列表");
    return "user/list";
}
```

### 6.2 ModelMap

```java
@GetMapping("/users")
public String list(ModelMap model) {
    model.addAttribute("users", userService.findAll());
    return "user/list";
}
```

### 6.3 @ModelAttribute

```java
@Controller
@RequestMapping("/users")
public class UserController {
    
    // 在所有方法执行前调用
    @ModelAttribute("types")
    public List<UserType> populateTypes() {
        return Arrays.asList(UserType.values());
    }
    
    @GetMapping
    public String list(Model model) {
        model.addAttribute("users", userService.findAll());
        // types 已经自动添加到 model
        return "user/list";
    }
}
```

---

## 7. 实际落地场景（工作实战）

### 场景 1：多视图解析器

```java
@Configuration
public class ViewResolverConfig {
    
    @Bean
    @Order(1)
    public ViewResolver jsonViewResolver() {
        return (viewName, locale) -> {
            if (viewName.startsWith("json:")) {
                return new MappingJackson2JsonView();
            }
            return null;
        };
    }
    
    @Bean
    @Order(2)
    public ViewResolver thymeleafViewResolver() {
        ThymeleafViewResolver resolver = new ThymeleafViewResolver();
        resolver.setTemplateEngine(templateEngine());
        return resolver;
    }
}

// 使用
@GetMapping("/users")
public String listHtml(Model model) {
    model.addAttribute("users", userService.findAll());
    return "user/list";  // 使用 Thymeleaf
}

@GetMapping("/users/json")
public String listJson(Model model) {
    model.addAttribute("users", userService.findAll());
    return "json:users";  // 使用 JSON 视图
}
```

### 场景 2：国际化

```java
// 配置
@Bean
public MessageSource messageSource() {
    ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
    messageSource.setBasename("messages");
    messageSource.setDefaultEncoding("UTF-8");
    return messageSource;
}

@Bean
public LocaleResolver localeResolver() {
    SessionLocaleResolver resolver = new SessionLocaleResolver();
    resolver.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
    return resolver;
}

// Controller
@GetMapping("/welcome")
public String welcome(Model model, Locale locale) {
    String message = messageSource.getMessage("welcome.message", null, locale);
    model.addAttribute("message", message);
    return "welcome";
}

// messages_zh_CN.properties
welcome.message=欢迎

// messages_en_US.properties
welcome.message=Welcome
```

---

## 8. 学习自检清单

- [ ] 能够说出 ViewResolver 的作用
- [ ] 能够配置常用视图解析器
- [ ] 能够使用不同类型的视图
- [ ] 能够传递模型数据到视图
- [ ] 能够处理重定向和转发

---

## 9. 参考资料

**Spring 官方文档**：
- [View Technologies](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-view)

**源码位置**：
- `org.springframework.web.servlet.ViewResolver`
- `org.springframework.web.servlet.View`

---

**上一章** ← [第 19 章：HandlerAdapter 适配机制](./content-19.md)  
**下一章** → [第 21 章：Resource 资源抽象](./content-21.md)  
**返回目录** → [学习大纲](../content-outline.md)
