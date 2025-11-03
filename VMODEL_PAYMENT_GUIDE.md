# VModel 账户支付问题解决指南

## 🔴 错误：402 Payment Required

如果你看到以下错误：
```
Face swap failed: Invalid VModel response: {"code":402,"message":{"en":"Payment Required","zh":"需要支付"}}
```

这表示你的 VModel 账户**余额不足**。

## ✅ 解决步骤

### 步骤 1：检查账户余额

1. 访问 [VModel.ai](https://vmodel.ai)
2. 登录你的账号
3. 进入 **Account** 或 **Billing** 页面
4. 查看当前账户余额

### 步骤 2：充值账户

1. 在 VModel 网站找到 **Add Credits** 或 **Top Up** 按钮
2. 选择合适的充值金额
3. 完成支付

**新用户提示**：
- 注册时通常会获得 **$10 免费额度**
- 如果没有看到免费额度，可能需要完成邮箱验证
- 查看账户设置中的 "Credits" 或 "Balance" 部分

### 步骤 3：验证 API Token

确保你的 API Token 是正确的：

1. 访问 [API Token 页面](https://vmodel.ai/settings/api-tokens)
2. 确认 Token 是活跃状态
3. 检查 Token 是否以 `vm_` 开头

### 步骤 4：检查环境变量

确保在 Vercel 或本地环境中正确配置了：

```bash
VMODEL_API_TOKEN=vm_你的token
FACESWAP_API=vmodel
```

## 💰 VModel 定价

- **$0.03 / 秒**的视频处理
- **$1 = 33 秒**的处理时间
- **$10 免费额度 = 约 330 秒**

### 实际使用成本

| 视频时长 | 单次成本 | $10 可处理次数 |
|---------|---------|---------------|
| 3 秒 | $0.09 | 约 110 次 |
| 5 秒 | $0.15 | 约 66 次 |
| 10 秒 | $0.30 | 约 33 次 |

## 🔍 常见问题

### Q1: 新用户为什么没有免费额度？

**可能原因**：
- 邮箱未验证
- 需要完成账号设置
- 查看 "Promotions" 或 "Credits" 页面

**解决方法**：
1. 检查邮箱是否有验证邮件
2. 查看账户设置中的 "Credits" 部分
3. 联系 VModel 客服

### Q2: 如何获取更多免费额度？

- 查看 VModel 的推广活动
- 关注官方社交媒体
- 邀请好友注册（如果有推荐计划）

### Q3: 充值后仍然显示错误？

**检查清单**：
1. ✅ API Token 是否正确
2. ✅ 账户余额是否已更新
3. ✅ 环境变量是否已重新部署（Vercel 需要重新部署）
4. ✅ Token 权限是否正确

### Q4: 可以切换到其他 API 吗？

是的！如果 VModel 余额不足，可以临时切换到：

```bash
# 使用 Replicate
FACESWAP_API=replicate
REPLICATE_API_TOKEN=r8_xxx

# 或使用 AIFaceSwap
FACESWAP_API=aifaceswap
AIFACESWAP_API_KEY=xxx
```

## 📞 获取帮助

如果问题仍未解决：

1. **VModel 支持**：
   - 访问 [VModel 帮助中心](https://vmodel.ai/support)
   - 发送邮件到 support@vmodel.ai

2. **检查文档**：
   - [VModel API 文档](https://vmodel.ai/docs)
   - [账户管理](https://vmodel.ai/account)

## ⚡ 快速解决方案

**最快的方法**：

1. 登录 VModel → 充值 $10-20
2. 等待余额更新（通常立即生效）
3. 如果使用 Vercel，重新部署一次（确保环境变量更新）

## 📝 总结

402 错误 = 账户余额不足

**解决步骤**：
1. 登录 VModel 账户
2. 充值余额
3. 确认 API Token 正确
4. 重新测试

充值后，换脸功能应该可以正常使用！

