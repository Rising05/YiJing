import LiquidGlassCard from '../components/LiquidGlassCard'
import PageShell from './PageShell'

export default function PrivacyPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-black">隐私政策</h1>
      <LiquidGlassCard className="mt-5">
        <div className="p-4 text-sm leading-7 text-ink/66">
          忆境仅在用户登录和生成学习内容时收集必要信息。MVP 阶段不申请定位、通讯录、麦克风等权限。AI 生成内容仅供学习辅助，后续正式发布前需替换为法律审核版本。
        </div>
      </LiquidGlassCard>
    </PageShell>
  )
}
