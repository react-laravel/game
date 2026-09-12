import MoonDiceGame from './components/MoonDiceGame'
import { GameStage } from '@/components/game'

const MOON_DICE_RULES = [
  '双方轮流摇六颗骰子，按博饼规则判定奖项并对比。',
  '每轮双方各摇一次，比较本轮奖项高低。',
  '奖项对应不同金额，累计总分更高者更旺。',
]

export default function MoonDicePage() {
  return (
    <GameStage
      title="月饼骰子"
      rules={MOON_DICE_RULES}
      fill
      contentClassName="px-2 pb-3 sm:px-3"
    >
      <MoonDiceGame />
    </GameStage>
  )
}
