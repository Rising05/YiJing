export interface AiAnchor {
  key: string
  name: string
  description: string
  x: number
  y: number
}

export interface AiTemplate {
  id: string
  name: string
  scenePrompt: string
  maxPoints: number
  anchors: AiAnchor[]
}

const grid9: Array<[number, number]> = [
  [0.22, 0.2],
  [0.5, 0.18],
  [0.78, 0.2],
  [0.2, 0.44],
  [0.5, 0.46],
  [0.8, 0.44],
  [0.22, 0.72],
  [0.5, 0.75],
  [0.78, 0.72],
]

const grid12: Array<[number, number]> = [
  [0.2, 0.16],
  [0.5, 0.14],
  [0.8, 0.16],
  [0.18, 0.34],
  [0.42, 0.35],
  [0.68, 0.35],
  [0.84, 0.48],
  [0.2, 0.58],
  [0.5, 0.58],
  [0.78, 0.64],
  [0.34, 0.8],
  [0.66, 0.8],
]

const word30: Array<[number, number]> = Array.from({ length: 30 }, (_, index) => [
  0.2 + (index % 3) * 0.3,
  0.12 + Math.floor(index / 3) * 0.08,
])

function anchors(names: string[], positions: Array<[number, number]>): AiAnchor[] {
  return names.map((name, index) => ({
    key: `a${index + 1}`,
    name,
    description: `${name} 附近的清晰留白区域`,
    x: positions[index][0],
    y: positions[index][1],
  }))
}

export const aiTemplates: AiTemplate[] = [
  {
    id: 'study_room_9',
    name: '书房九点模板',
    scenePrompt: '明亮现代书房，书桌、书架、窗台、台灯、地毯，画面干净有留白',
    maxPoints: 9,
    anchors: anchors(['左上书架', '中央窗户', '右上挂画', '左侧书桌', '中央台灯', '右侧扶手椅', '左下地毯', '中央书本', '右下绿植'], grid9),
  },
  {
    id: 'ancient_cottage_9',
    name: '古风小屋九点模板',
    scenePrompt: '古风小屋，竹帘、木桌、灯笼、庭院、山水意象，无文字书法',
    maxPoints: 9,
    anchors: anchors(['左上竹帘', '中央窗景', '右上灯笼', '左侧木桌', '中央茶盏', '右侧屏风', '左下蒲团', '中央地面', '右下盆景'], grid9),
  },
  {
    id: 'palace_hall_12',
    name: '宫殿大厅十二点模板',
    scenePrompt: '明亮宫殿大厅，柱子、台阶、帷幔、器物，庄重但不出现文字和符号',
    maxPoints: 12,
    anchors: anchors(['左上柱子', '中央穹顶', '右上帷幔', '左侧台阶', '左中器物', '右中器物', '右侧廊柱', '左下地砖', '中央大厅', '右下台阶', '前景左侧', '前景右侧'], grid12),
  },
  {
    id: 'airport_15',
    name: '机场模板',
    scenePrompt: '现代机场大厅，柜台、行李、安检、登机口、传送带，无文字标牌',
    maxPoints: 15,
    anchors: anchors(['柜台', '行李车', '安检口', '护照区', '候机座', '登机口', '传送带', '手提箱', '屏幕留白', '玻璃窗', '入口', '队列区', '闸机', '地面', '远景'], [...grid12, [0.18, 0.88], [0.5, 0.9], [0.82, 0.88]]),
  },
  {
    id: 'blank_word_card_30',
    name: '空白信息卡模板',
    scenePrompt: '简洁学习信息卡背景，柔和渐变、细分区域、充足留白，无文字无数字',
    maxPoints: 30,
    anchors: anchors(Array.from({ length: 30 }, (_, index) => `词卡位置${index + 1}`), word30),
  },
]

export function getAiTemplate(templateId: string) {
  return aiTemplates.find((template) => template.id === templateId) ?? aiTemplates[0]
}
