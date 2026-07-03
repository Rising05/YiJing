import LiquidGlassCard from '../components/LiquidGlassCard'
import PageShell from './PageShell'

export default function TermsPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-black">用户协议</h1>
      <LiquidGlassCard className="mt-5">
        <div className="p-4 text-sm leading-7 text-ink/66">
          用户应仅上传合法学习内容，不得利用本产品生成违法、侵权、低俗或违反中国大陆法律法规的内容。重新生成会消耗次数，具体计费规则后续补充。
        </div>
      </LiquidGlassCard>
    </PageShell>
  )
}
