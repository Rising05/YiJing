import LiquidGlassCard from '../components/LiquidGlassCard'
import PageShell from './PageShell'

const termsSections = [
  {
    title: '账号与生成次数',
    items: [
      'MVP 阶段使用测试手机号和固定验证码登录，正式发布前会替换为合规短信或微信登录。',
      '文本记忆宫殿、单词记忆卡片和重新生成每次成功都会消耗 1 次生成额度。',
      '用户必须登录后才能生成内容，未登录状态仅允许预览产品流程。',
    ],
  },
  {
    title: '用户内容规范',
    items: [
      '你应仅上传自己有权使用的学习内容，不得侵犯他人著作权、隐私权、名誉权或其他合法权益。',
      '不得上传或生成违法、侵权、色情低俗、血腥暴力、自伤自杀、违法犯罪、宗教/政治符号或违反中国大陆法律法规的内容。',
      '系统会进行内容安全校验，但用户仍需对自己输入和传播的内容负责。',
    ],
  },
  {
    title: 'AI 学习辅助边界',
    items: [
      'AI 生成的记忆路线、视觉提示、释义和例句仅用于学习辅助，不构成标准答案、考试承诺或专业建议。',
      'AI 结果可能出现遗漏、误解或事实错误，重要内容应结合教材、老师要求或权威资料核对。',
      '产品不提供聊天机器人、真人头像生成、宗教政治表达生成或其他超出 SPEC 的用途。',
    ],
  },
  {
    title: '导出、分享与历史',
    items: [
      'PNG 导出在浏览器本地合成，不额外上传导出图片。',
      '生成历史用于复习、查看详情、收藏、重新生成和手动删除。',
      '背景图默认保存 30 天，用户删除历史或账号时会同步处理相关数据。',
    ],
  },
  {
    title: '账号删除与服务变更',
    items: [
      '你可以在设置页删除账号与历史数据。删除后当前账号、历史记录和本地缓存将不可继续使用。',
      '由于模型供应商、短信服务、微信开放平台和对象存储仍待正式配置，MVP 期间部分能力可能使用 mock 模式。',
      '正式发布前，本协议应补充运营主体、联系方式、争议处理、付费规则和法律审核后的完整条款。',
    ],
  },
]

export default function TermsPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-black">用户协议</h1>
      <p className="mt-2 text-xs font-bold text-ink/48">MVP 草稿，正式发布前需法律审核</p>
      <LiquidGlassCard className="mt-5">
        <div className="space-y-5 p-4 text-sm leading-7 text-ink/66">
          <p>
            欢迎使用忆境。你使用本产品，即表示你理解本产品是面向学习背诵场景的 AI 辅助工具，并同意遵守以下规则。
          </p>
          {termsSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-black text-ink">{section.title}</h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </LiquidGlassCard>
    </PageShell>
  )
}
