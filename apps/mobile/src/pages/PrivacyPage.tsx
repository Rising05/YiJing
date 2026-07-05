import LiquidGlassCard from '../components/LiquidGlassCard'
import PageShell from './PageShell'

const privacySections = [
  {
    title: '我们收集的信息',
    items: [
      '登录信息：MVP 阶段使用测试手机号和固定验证码，正式发布前会替换为短信或微信登录。',
      '学习内容：你主动输入的古文诗词、现代文本、英语单词或短语，用于生成记忆宫殿和单词卡片。',
      '生成记录：标题、类型、生成时间、结构化记忆点、背景图地址和收藏状态，用于历史查看和重新生成。',
      '本机数据：前端会在本机保存登录状态、生成历史缓存和导出的 PNG，不会把导出图片额外上传。',
    ],
  },
  {
    title: '信息如何使用',
    items: [
      '完成登录、生成、重新生成、历史查看、收藏、导出和删除账号等核心流程。',
      '在后端 mock 或真实 AI 模式下，对输入内容进行长度、数量、格式和内容安全校验。',
      '统计生成次数并扣减额度，避免未登录或额度不足时继续生成。',
      '排查产品错误和改善学习体验，但 MVP 不做广告画像或个性化营销。',
    ],
  },
  {
    title: '保存与删除',
    items: [
      '背景图默认保存 30 天，可随历史记录删除或由清理任务删除。',
      '你可以在历史页删除单条记录，也可以在设置页删除账号与历史数据。',
      '删除账号会删除当前账号、生成记录、历史数据，并处理关联背景图。',
      '本机缓存可在设置页清除，不会影响已经保存在后端的账号数据。',
    ],
  },
  {
    title: '权限与第三方服务',
    items: [
      'MVP 不默认申请定位、通讯录、麦克风、相机、短信、通知或跟踪权限。',
      'AI 文本生成 API Key、通义万相 API Key 和对象存储密钥只允许保存在后端环境变量中。',
      '正式接入短信、微信登录、LLM、通义万相或对象存储后，应在本页补充对应服务商、用途和数据流向。',
    ],
  },
  {
    title: '未成年人和内容安全',
    items: [
      '产品面向中小学生和大学生，未成年人应在监护人知情和指导下使用。',
      '不得上传违法、侵权、色情低俗、血腥暴力、自伤自杀、违法犯罪、宗教/政治符号或违反中国大陆法律法规的内容。',
      'AI 生成内容仅用于学习辅助，可能存在错误，重要学习内容应由用户自行核对。',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-black">隐私政策</h1>
      <p className="mt-2 text-xs font-bold text-ink/48">MVP 草稿，正式发布前需法律审核</p>
      <LiquidGlassCard className="mt-5">
        <div className="space-y-5 p-4 text-sm leading-7 text-ink/66">
          <p>
            忆境仅围绕登录、生成学习内容、保存历史和导出结果收集必要信息。我们不会在用户登录或同意前采集非必要设备信息。
          </p>
          {privacySections.map((section) => (
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
