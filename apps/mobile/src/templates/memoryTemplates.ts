import type { Anchor, ContentType, MemoryTemplate } from '../types'

function anchors(names: string[], pattern: Array<[number, number]>): Anchor[] {
  return names.map((name, index) => ({
    key: `a${index + 1}`,
    name,
    description: `${name} 附近的清晰留白区域`,
    x: pattern[index][0],
    y: pattern[index][1],
  }))
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

const word30: Array<[number, number]> = Array.from({ length: 30 }, (_, index) => {
  const col = index % 3
  const row = Math.floor(index / 3)
  return [0.2 + col * 0.3, 0.12 + row * 0.08] as [number, number]
})

function template(
  id: string,
  name: string,
  category: MemoryTemplate['category'],
  maxPoints: number,
  scenePrompt: string,
  bestFor: ContentType[],
  pointNames: string[],
  pattern: Array<[number, number]>,
  routePattern: MemoryTemplate['routePattern'],
): MemoryTemplate {
  return {
    id,
    name,
    category,
    maxPoints,
    scenePrompt,
    bestFor,
    anchors: anchors(pointNames, pattern),
    routePattern,
  }
}

export const memoryTemplates: MemoryTemplate[] = [
  template('study_room_9', '书房九点模板', 'general', 9, '明亮现代书房，书桌、书架、窗台、台灯、地毯，画面干净有留白', ['modern_text'], ['左上书架', '中央窗户', '右上挂画', '左侧书桌', '中央台灯', '右侧扶手椅', '左下地毯', '中央书本', '右下绿植'], grid9, 'left_to_right'),
  template('classroom_9', '教室九点模板', 'academic', 9, '清爽教室，黑板无文字，课桌、讲台、窗户和书包，学习氛围', ['modern_text', 'vocabulary'], ['左上窗户', '中央黑板', '右上时钟', '左侧课桌', '中央讲台', '右侧书包', '左下地面', '中央课本', '右下椅子'], grid9, 'left_to_right'),
  template('ancient_cottage_9', '古风小屋九点模板', 'ancient', 9, '古风小屋，竹帘、木桌、灯笼、庭院、山水意象，无文字书法', ['ancient_text'], ['左上竹帘', '中央窗景', '右上灯笼', '左侧木桌', '中央茶盏', '右侧屏风', '左下蒲团', '中央地面', '右下盆景'], grid9, 'clockwise'),
  template('palace_hall_12', '宫殿大厅十二点模板', 'ancient', 12, '明亮宫殿大厅，柱子、台阶、帷幔、器物，庄重但不出现文字和符号', ['ancient_text', 'modern_text'], ['左上柱子', '中央穹顶', '右上帷幔', '左侧台阶', '左中器物', '右中器物', '右侧廊柱', '左下地砖', '中央大厅', '右下台阶', '前景左侧', '前景右侧'], grid12, 'center_out'),
  template('street_path_8', '街道路线模板', 'process', 8, '安静街道路线，路口、橱窗、长椅、树、路灯，无文字招牌', ['modern_text'], ['入口', '左侧橱窗', '右侧树下', '路灯', '中央路口', '长椅', '远处建筑', '出口'], grid9.slice(0, 8), 'path'),
  template('museum_gallery_12', '博物馆展厅模板', 'general', 12, '现代博物馆展厅，展台、玻璃柜、雕塑和柔和灯光，无文字说明牌', ['modern_text', 'vocabulary'], ['左上灯光', '中央雕塑', '右上展墙', '左侧展柜', '左中展台', '右中展台', '右侧展柜', '左下地面', '中央通道', '右下展柜', '前景左', '前景右'], grid12, 'left_to_right'),
  template('airport_15', '机场模板', 'vocabulary', 15, '现代机场大厅，柜台、行李、安检、登机口、传送带，无文字标牌', ['vocabulary'], ['柜台', '行李车', '安检口', '护照区', '候机座', '登机口', '传送带', '手提箱', '屏幕留白', '玻璃窗', '入口', '队列区', '闸机', '地面', '远景'], [...grid12, [0.18, 0.88], [0.5, 0.9], [0.82, 0.88]], 'path'),
  template('restaurant_12', '餐厅模板', 'vocabulary', 12, '温暖餐厅场景，餐桌、菜单板无文字、餐具、厨房窗口，干净明亮', ['vocabulary'], ['左上灯', '中央餐桌', '右上厨房窗', '左侧餐具', '左中座位', '右中饮品', '右侧柜台', '左下餐盘', '中央地面', '右下椅子', '前景左', '前景右'], grid12, 'clockwise'),
  template('campus_12', '校园模板', 'vocabulary', 12, '清爽校园庭院，教学楼、操场、长椅、书包、树荫，无文字标语', ['vocabulary'], ['左上树冠', '中央教学楼', '右上天空', '左侧长椅', '左中书包', '右中跑道', '右侧自行车', '左下草地', '中央路面', '右下球场', '前景左', '前景右'], grid12, 'path'),
  template('blank_word_card_30', '空白信息卡模板', 'vocabulary', 30, '简洁学习信息卡背景，柔和渐变、细分区域、充足留白，无文字无数字', ['vocabulary'], Array.from({ length: 30 }, (_, index) => `词卡位置${index + 1}`), word30, 'top_to_bottom'),
]

export function getTemplate(id: string) {
  return memoryTemplates.find((item) => item.id === id) ?? memoryTemplates[0]
}
