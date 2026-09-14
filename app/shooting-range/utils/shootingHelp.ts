import { trainingModeOptions } from './trainingModes'

export interface HelpSection {
  title: string
  items: string[]
}

export const shootingHelpSections: HelpSection[] = [
  {
    title: '基本操作',
    items: [
      '移动鼠标瞄准，左键射击。',
      '按 ESC 暂停并释放鼠标；在暂停界面点「继续训练」或按 Enter / Space 重新锁定。',
      '训练左上角可结束训练；齿轮图标打开准星设置。',
    ],
  },
  {
    title: '暂停与设置',
    items: [
      '暂停或打开设置时左键和空格不会开枪；调完后再回到游戏。',
      '暂停时可调鼠标灵敏度（慢 / 标准 / 快预设）、后坐力开关与音效音量。',
      '后坐力开启时开火只向上抬枪，然后回落；关闭后准星保持稳定。',
      '音效支持轻柔 / 标准 / 响亮预设，可一键静音。',
      '准星样式、颜色、大小可在设置中自定义。',
    ],
  },
  {
    title: '训练模式',
    items: trainingModeOptions.map(mode => `${mode.name}：${mode.description}`),
  },
  {
    title: '小提示',
    items: [
      '首次命中后「新手提示」会自动淡出。',
      '系统开启「减少动态效果」时，得分飘字、连击提示与枪口闪光会自动减弱。',
      '可在暂停界面手动切换动态效果强度。',
    ],
  },
]
