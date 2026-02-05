# Kael.im 集成需求文档

## 一、背景
- **产品**：Skill Marketplace (作为 kael.im/marketplace 运行)
- **功能**：用户浏览、安装、使用 AI 技能
- **架构**：Marketplace 存技能目录，Kael 存用户安装状态

---

## 二、MVP 需求（先做这 3 个）

### 1. Try 技能（URL 参数支持）
```
需求：支持预填 prompt 参数
URL：https://kael.im/chat?prefill={prompt}
示例：https://kael.im/chat?prefill=I%20just%20added%20the%20%2Femail-composer%20skill%20for%20Kael.%20Can%20you%20demo%20it%20with%20some%20great%20examples%3F
```

### 2. 查询已安装技能（API）
```
GET /api/marketplace/user/installed-skills
认证：使用现有登录 session（同域 cookie）
Response:
{
  "installedSkillIds": ["uuid1", "uuid2", ...]
}
```

### 3. 技能使用事件（Webhook - Marketplace 提供）
```
Kael 发送到：POST https://kael.im/marketplace/api/webhooks/skill-used
Body:
{
  "skillId": "uuid",
  "timestamp": "2026-02-04T10:30:45Z",
  "success": true
}
```

---

## 三、V2 需求（后续迭代）

### 4. 安装技能（重定向）
```
URL：https://kael.im/marketplace/install?skillId={id}&returnUrl={url}
处理：
  1. 验证用户登录（session）
  2. 调 marketplace API 获取技能信息
  3. 写入 user_skill_installations 表
  4. 重定向回 returnUrl
```

### 5. 技能包验证（上传时）
```
POST /api/marketplace/validate-skill
Body：ZIP file (multipart/form-data)
Response:
{
  "valid": true/false,
  "errors": [
    {
      "file": "manifest.json",
      "message": "缺少必填字段：version"  // 用户可读的错误信息
    }
  ],
  "metadata": {  // 用于自动填充表单
    "name": "Email Composer",
    "version": "1.0.0"
  }
}
```

---

## 四、Marketplace 提供的 API

```
GET https://kael.im/marketplace/api/skills/{skillId}/metadata
Response:
{
  "id": "uuid",
  "name": "Email Composer",
  "slug": "email-composer",
  "description": "Professional email assistant",
  "version": "1.0.0",
  "icon": "✉️"
}
```

---

## 五、数据库表（Kael 侧）

```sql
CREATE TABLE user_skill_installations (
  user_id UUID,
  skill_id UUID,
  installed_at TIMESTAMPTZ,
  enabled BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, skill_id)
);
```

---

## 六、测试场景

1. **Try**：点击 → 跳转 chat → 看到预填 prompt
2. **查状态**：页面加载 → 调 API → 显示已安装技能
3. **使用统计**：使用技能 → 发 webhook → 更新计数

4. **安装**：点 Install → 重定向 → 安装 → 返回
5. **验证**：上传 ZIP → 验证 → 显示错误

---

## 七、关键决定

| 问题 | 答案 |
|-----|------|
| 认证方式？ | 同域 session/cookie（不用 Bearer token） |
| Try 需要安装？ | 不需要，只是预填 prompt |
| 统计需要什么？ | 只需要 skillId + timestamp |
| 错误信息格式？ | 用户可读，可直接显示在 UI |

---

## 九、技术细节补充

### 认证说明
- Marketplace 运行在 `kael.im/marketplace` 路径下
- 共享主站的 Better Auth session
- 无需额外的 token 验证

### 数据职责
- **Marketplace 负责**：
  - 技能目录（skills 表）
  - 技能版本（skill_versions 表）
  - 评价系统（reviews 表）
  - 收藏功能（liked_skills 表）

- **Kael.im 负责**：
  - 用户安装记录（user_skill_installations 表）
  - 使用统计（skill_events 表）
  - 运行时数据

