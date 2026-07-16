import MoonDiceGame from './components/MoonDiceGame'
import { PageContainer } from '@/components/layout'

export default function MoonDicePage() {
  return (
    <PageContainer maxWidth="4xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">月饼骰子</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            双方轮流摇六颗骰子，按博饼规则判定奖项并对比。
          </p>
        </div>
      </div>
      <MoonDiceGame />
    </PageContainer>
  )
}
