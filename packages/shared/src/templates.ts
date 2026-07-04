// ============================================================================
// Section 10: Memory Templates — the 10 canonical scene templates
// ============================================================================

import type { MemoryTemplate } from './types.js'

// ---------------------------------------------------------------------------
// Anchor factory helpers
// ---------------------------------------------------------------------------

function a(key: string, name: string, description: string, x: number, y: number) {
  return { key, name, description, x, y }
}

// ---------------------------------------------------------------------------
// Template 1: 书房九点模板 (study_room_9) — 9 points
// ---------------------------------------------------------------------------

const studyRoom9: MemoryTemplate = {
  id: 'study_room_9',
  name: '书房九点',
  category: 'general',
  scenePrompt:
    'A cozy study room with warm lighting, a large wooden desk, bookshelves, a window, a reading chair, a globe, and a clock on the wall. Warm tones, inviting atmosphere.',
  bestFor: ['modern_text', 'ancient_text', 'vocabulary'],
  routePattern: 'clockwise',
  maxPoints: 9,
  anchors: [
    a('sr_door', '门', '书房入口的门', 0.1, 0.5),
    a('sr_desk', '书桌', '中央大书桌', 0.5, 0.5),
    a('sr_bookshelf', '书架', '左侧书架', 0.15, 0.15),
    a('sr_window', '窗户', '右侧窗户', 0.85, 0.2),
    a('sr_chair', '阅读椅', '书桌前的阅读椅', 0.5, 0.75),
    a('sr_lamp', '台灯', '书桌上的台灯', 0.55, 0.4),
    a('sr_globe', '地球仪', '书架旁的地球仪', 0.25, 0.65),
    a('sr_clock', '挂钟', '墙上的挂钟', 0.5, 0.08),
    a('sr_rug', '地毯', '地板上的地毯', 0.7, 0.85),
  ],
}

// ---------------------------------------------------------------------------
// Template 2: 教室九点模板 (classroom_9) — 9 points
// ---------------------------------------------------------------------------

const classroom9: MemoryTemplate = {
  id: 'classroom_9',
  name: '教室九点',
  category: 'general',
  scenePrompt:
    'A bright classroom with rows of desks, a blackboard, a projector screen, bulletin board, and posters on the wall. Clean, organized school atmosphere.',
  bestFor: ['modern_text', 'vocabulary'],
  routePattern: 'left_to_right',
  maxPoints: 9,
  anchors: [
    a('cl_blackboard', '黑板', '前方黑板', 0.5, 0.1),
    a('cl_teacher_desk', '讲台', '讲台桌', 0.5, 0.25),
    a('cl_desk_1', '课桌1', '第一排左侧课桌', 0.2, 0.4),
    a('cl_desk_2', '课桌2', '第一排中间课桌', 0.5, 0.4),
    a('cl_desk_3', '课桌3', '第一排右侧课桌', 0.8, 0.4),
    a('cl_desk_4', '课桌4', '第二排左侧课桌', 0.2, 0.65),
    a('cl_desk_5', '课桌5', '第二排中间课桌', 0.5, 0.65),
    a('cl_desk_6', '课桌6', '第二排右侧课桌', 0.8, 0.65),
    a('cl_screen', '投影幕布', '黑板旁的投影幕布', 0.85, 0.15),
  ],
}

// ---------------------------------------------------------------------------
// Template 3: 古风小屋九点模板 (ancient_cottage_9) — 9 points
// ---------------------------------------------------------------------------

const ancientCottage9: MemoryTemplate = {
  id: 'ancient_cottage_9',
  name: '古风小屋九点',
  category: 'ancient',
  scenePrompt:
    'A traditional Chinese ancient cottage with wooden beams, paper windows, a low table with tea set, ink brush and scrolls, a guqin, folding screen, and lanterns. Serene, classical atmosphere.',
  bestFor: ['ancient_text'],
  routePattern: 'clockwise',
  maxPoints: 9,
  anchors: [
    a('ac_entrance', '门扉', '小屋木门入口', 0.5, 0.85),
    a('ac_table', '矮桌', '中央矮桌与茶具', 0.5, 0.5),
    a('ac_scroll', '卷轴', '桌上展开的书卷', 0.4, 0.45),
    a('ac_brush', '笔墨', '桌上的毛笔与砚台', 0.6, 0.45),
    a('ac_window', '纸窗', '左侧纸窗', 0.1, 0.2),
    a('ac_screen', '屏风', '右侧折叠屏风', 0.85, 0.55),
    a('ac_guqin', '古琴', '墙边的古琴', 0.2, 0.7),
    a('ac_lantern', '灯笼', '悬挂的纸灯笼', 0.75, 0.1),
    a('ac_incense', '香炉', '矮桌旁的香炉', 0.3, 0.55),
  ],
}

// ---------------------------------------------------------------------------
// Template 4: 宫殿大厅十二点模板 (palace_hall_12) — 12 points
// ---------------------------------------------------------------------------

const palaceHall12: MemoryTemplate = {
  id: 'palace_hall_12',
  name: '宫殿大厅十二点',
  category: 'ancient',
  scenePrompt:
    'A grand imperial palace hall with tall red pillars, a dragon throne, ornate ceiling, large bronze urns, hanging silk banners, and marble floor. Majestic, formal atmosphere.',
  bestFor: ['ancient_text', 'modern_text'],
  routePattern: 'clockwise',
  maxPoints: 12,
  anchors: [
    a('ph_throne', '龙椅', '中央龙椅宝座', 0.5, 0.3),
    a('ph_pillar_l1', '左柱1', '左侧前排柱子', 0.15, 0.35),
    a('ph_pillar_l2', '左柱2', '左侧后排柱子', 0.15, 0.6),
    a('ph_pillar_r1', '右柱1', '右侧前排柱子', 0.85, 0.35),
    a('ph_pillar_r2', '右柱2', '右侧后排柱子', 0.85, 0.6),
    a('ph_urn_l', '左铜鼎', '左侧大青铜鼎', 0.25, 0.55),
    a('ph_urn_r', '右铜鼎', '右侧大青铜鼎', 0.75, 0.55),
    a('ph_banner_l', '左旌旗', '左侧丝绸旌旗', 0.08, 0.2),
    a('ph_banner_r', '右旌旗', '右侧丝绸旌旗', 0.92, 0.2),
    a('ph_carpet', '红毯', '中央红色地毯通道', 0.5, 0.8),
    a('ph_ceiling', '藻井', '穹顶藻井装饰', 0.5, 0.05),
    a('ph_tablet', '牌匾', '殿上方正大光明匾', 0.5, 0.08),
  ],
}

// ---------------------------------------------------------------------------
// Template 5: 街道路线模板 (street_path_8) — 8 points
// ---------------------------------------------------------------------------

const streetPath8: MemoryTemplate = {
  id: 'street_path_8',
  name: '街道路线',
  category: 'general',
  scenePrompt:
    'A charming street path with a cobblestone road, street lamps, a bench, a fountain, a flower shop, a bookshop, a café with outdoor seating, and a street sign. Warm afternoon light.',
  bestFor: ['modern_text', 'vocabulary'],
  routePattern: 'path',
  maxPoints: 8,
  anchors: [
    a('sp_start', '起点路牌', '街道起点的路牌', 0.05, 0.5),
    a('sp_lamp_1', '路灯1', '第一盏街灯', 0.2, 0.25),
    a('sp_bench', '长椅', '路边的长椅', 0.3, 0.75),
    a('sp_fountain', '喷泉', '小广场喷泉', 0.45, 0.5),
    a('sp_flower', '花店', '花店橱窗', 0.55, 0.2),
    a('sp_bookshop', '书店', '街角书店', 0.7, 0.75),
    a('sp_cafe', '咖啡馆', '露天咖啡馆', 0.8, 0.35),
    a('sp_lamp_2', '路灯2', '最后一盏街灯', 0.95, 0.5),
  ],
}

// ---------------------------------------------------------------------------
// Template 6: 博物馆展厅模板 (museum_gallery_12) — 12 points
// ---------------------------------------------------------------------------

const museumGallery12: MemoryTemplate = {
  id: 'museum_gallery_12',
  name: '博物馆展厅',
  category: 'general',
  scenePrompt:
    'An elegant museum gallery with marble floors, glass display cases, paintings on the walls, sculptures on pedestals, soft spotlights, and informational plaques. Clean, educational atmosphere.',
  bestFor: ['modern_text', 'ancient_text', 'vocabulary'],
  routePattern: 'clockwise',
  maxPoints: 12,
  anchors: [
    a('mg_entrance', '入口', '展厅入口', 0.5, 0.9),
    a('mg_case_1', '展柜1', '入口左侧展柜', 0.15, 0.75),
    a('mg_case_2', '展柜2', '左侧中部展柜', 0.15, 0.5),
    a('mg_case_3', '展柜3', '左侧远端展柜', 0.15, 0.25),
    a('mg_sculpture_1', '雕塑1', '中央左侧雕塑', 0.35, 0.4),
    a('mg_sculpture_2', '雕塑2', '中央右侧雕塑', 0.65, 0.4),
    a('mg_painting_1', '画作1', '后墙左侧画作', 0.35, 0.1),
    a('mg_painting_2', '画作2', '后墙中间画作', 0.5, 0.1),
    a('mg_painting_3', '画作3', '后墙右侧画作', 0.65, 0.1),
    a('mg_case_4', '展柜4', '右侧远端展柜', 0.85, 0.25),
    a('mg_case_5', '展柜5', '右侧中部展柜', 0.85, 0.5),
    a('mg_case_6', '展柜6', '入口右侧展柜', 0.85, 0.75),
  ],
}

// ---------------------------------------------------------------------------
// Template 7: 机场模板 (airport_15) — 15 points
// ---------------------------------------------------------------------------

const airport15: MemoryTemplate = {
  id: 'airport_15',
  name: '机场',
  category: 'vocabulary',
  scenePrompt:
    'A modern international airport terminal with check-in counters, departure gates, duty-free shops, baggage claim, information screens, escalators, and large glass windows showing the runway. Bright, spacious travel atmosphere.',
  bestFor: ['vocabulary'],
  routePattern: 'left_to_right',
  maxPoints: 15,
  anchors: [
    a('ap_entrance', '入口大门', '航站楼入口自动门', 0.1, 0.5),
    a('ap_checkin_1', '值机柜台1', '左侧值机柜台', 0.2, 0.3),
    a('ap_checkin_2', '值机柜台2', '右侧值机柜台', 0.35, 0.3),
    a('ap_screen', '信息屏幕', '航班信息大屏幕', 0.55, 0.15),
    a('ap_security', '安检通道', '安检入口', 0.55, 0.4),
    a('ap_dutyfree', '免税店', '免税店橱窗', 0.7, 0.2),
    a('ap_gate_a', '登机口A', 'A登机口', 0.15, 0.75),
    a('ap_gate_b', '登机口B', 'B登机口', 0.3, 0.75),
    a('ap_gate_c', '登机口C', 'C登机口', 0.45, 0.75),
    a('ap_gate_d', '登机口D', 'D登机口', 0.6, 0.75),
    a('ap_gate_e', '登机口E', 'E登机口', 0.75, 0.75),
    a('ap_cafe', '咖啡厅', '候机区咖啡厅', 0.85, 0.4),
    a('ap_escalator', '扶梯', '上下层扶梯', 0.5, 0.85),
    a('ap_window', '观景窗', '跑道观景大窗', 0.85, 0.15),
    a('ap_baggage', '行李转盘', '行李提取转盘', 0.2, 0.55),
  ],
}

// ---------------------------------------------------------------------------
// Template 8: 餐厅模板 (restaurant_12) — 12 points
// ---------------------------------------------------------------------------

const restaurant12: MemoryTemplate = {
  id: 'restaurant_12',
  name: '餐厅',
  category: 'vocabulary',
  scenePrompt:
    'A cozy restaurant interior with wooden tables, chairs, a bar counter, hanging pendant lights, a menu board, an open kitchen window, potted plants, and warm candlelight.',
  bestFor: ['vocabulary'],
  routePattern: 'clockwise',
  maxPoints: 12,
  anchors: [
    a('rt_entrance', '入口', '餐厅入口门', 0.5, 0.9),
    a('rt_bar', '吧台', '吧台与高脚凳', 0.15, 0.35),
    a('rt_kitchen', '厨房窗口', '开放式厨房出餐口', 0.35, 0.15),
    a('rt_menu', '菜单板', '墙上手写菜单板', 0.5, 0.1),
    a('rt_table_1', '餐桌1', '窗边双人桌', 0.75, 0.2),
    a('rt_table_2', '餐桌2', '中央四人桌', 0.5, 0.45),
    a('rt_table_3', '餐桌3', '靠墙四人桌', 0.25, 0.6),
    a('rt_table_4', '餐桌4', '角落双人桌', 0.8, 0.6),
    a('rt_plant', '绿植', '大型盆栽绿植', 0.08, 0.7),
    a('rt_light', '吊灯', '中央吊灯', 0.5, 0.05),
    a('rt_window', '窗户', '临街大窗户', 0.9, 0.15),
    a('rt_counter', '收银台', '收银结账柜台', 0.8, 0.85),
  ],
}

// ---------------------------------------------------------------------------
// Template 9: 校园模板 (campus_12) — 12 points
// ---------------------------------------------------------------------------

const campus12: MemoryTemplate = {
  id: 'campus_12',
  name: '校园',
  category: 'vocabulary',
  scenePrompt:
    'A vibrant university campus with a main building, library entrance, a large tree on the lawn, a fountain, a sports field, a cafeteria building, a clock tower, and students walking on paths.',
  bestFor: ['vocabulary', 'modern_text'],
  routePattern: 'left_to_right',
  maxPoints: 12,
  anchors: [
    a('cp_gate', '校门', '学校主校门', 0.05, 0.5),
    a('cp_main_building', '主楼', '主教学楼', 0.2, 0.15),
    a('cp_library', '图书馆', '图书馆入口', 0.4, 0.2),
    a('cp_tree', '大树', '草坪上的大树', 0.3, 0.65),
    a('cp_fountain', '喷泉', '中心广场喷泉', 0.55, 0.5),
    a('cp_clock_tower', '钟楼', '校园钟楼', 0.7, 0.1),
    a('cp_cafeteria', '食堂', '学生食堂', 0.6, 0.7),
    a('cp_sports', '运动场', '操场/运动场', 0.85, 0.7),
    a('cp_dorm', '宿舍楼', '学生宿舍', 0.9, 0.25),
    a('cp_bench', '长椅', '树下的长椅', 0.25, 0.8),
    a('cp_path', '小径', '连接各处的步道', 0.5, 0.85),
    a('cp_lab', '实验楼', '科学实验楼', 0.15, 0.35),
  ],
}

// ---------------------------------------------------------------------------
// Template 10: 空白信息卡模板 (blank_word_card_30) — 30 points
// ---------------------------------------------------------------------------

const blankWordCard30: MemoryTemplate = {
  id: 'blank_word_card_30',
  name: '空白信息卡',
  category: 'vocabulary',
  scenePrompt:
    'A clean minimalist white background with subtle soft shadows, like a premium flashcard set arranged on a light surface. No text, no labels — just clean card-like regions ready for content overlay.',
  bestFor: ['vocabulary'],
  routePattern: 'left_to_right',
  maxPoints: 30,
  anchors: [
    // Row 1 (y ≈ 0.08)
    a('wc_c01', '卡片01', '第1行第1列', 0.08, 0.08),
    a('wc_c02', '卡片02', '第1行第2列', 0.23, 0.08),
    a('wc_c03', '卡片03', '第1行第3列', 0.38, 0.08),
    a('wc_c04', '卡片04', '第1行第4列', 0.53, 0.08),
    a('wc_c05', '卡片05', '第1行第5列', 0.68, 0.08),
    a('wc_c06', '卡片06', '第1行第6列', 0.83, 0.08),
    // Row 2 (y ≈ 0.22)
    a('wc_c07', '卡片07', '第2行第1列', 0.08, 0.22),
    a('wc_c08', '卡片08', '第2行第2列', 0.23, 0.22),
    a('wc_c09', '卡片09', '第2行第3列', 0.38, 0.22),
    a('wc_c10', '卡片10', '第2行第4列', 0.53, 0.22),
    a('wc_c11', '卡片11', '第2行第5列', 0.68, 0.22),
    a('wc_c12', '卡片12', '第2行第6列', 0.83, 0.22),
    // Row 3 (y ≈ 0.36)
    a('wc_c13', '卡片13', '第3行第1列', 0.08, 0.36),
    a('wc_c14', '卡片14', '第3行第2列', 0.23, 0.36),
    a('wc_c15', '卡片15', '第3行第3列', 0.38, 0.36),
    a('wc_c16', '卡片16', '第3行第4列', 0.53, 0.36),
    a('wc_c17', '卡片17', '第3行第5列', 0.68, 0.36),
    a('wc_c18', '卡片18', '第3行第6列', 0.83, 0.36),
    // Row 4 (y ≈ 0.50)
    a('wc_c19', '卡片19', '第4行第1列', 0.08, 0.5),
    a('wc_c20', '卡片20', '第4行第2列', 0.23, 0.5),
    a('wc_c21', '卡片21', '第4行第3列', 0.38, 0.5),
    a('wc_c22', '卡片22', '第4行第4列', 0.53, 0.5),
    a('wc_c23', '卡片23', '第4行第5列', 0.68, 0.5),
    a('wc_c24', '卡片24', '第4行第6列', 0.83, 0.5),
    // Row 5 (y ≈ 0.64)
    a('wc_c25', '卡片25', '第5行第1列', 0.08, 0.64),
    a('wc_c26', '卡片26', '第5行第2列', 0.23, 0.64),
    a('wc_c27', '卡片27', '第5行第3列', 0.38, 0.64),
    a('wc_c28', '卡片28', '第5行第4列', 0.53, 0.64),
    a('wc_c29', '卡片29', '第5行第5列', 0.68, 0.64),
    a('wc_c30', '卡片30', '第5行第6列', 0.83, 0.64),
  ],
}

// ---------------------------------------------------------------------------
// Master template registry
// ---------------------------------------------------------------------------

export const MEMORY_TEMPLATES: MemoryTemplate[] = [
  studyRoom9,
  classroom9,
  ancientCottage9,
  palaceHall12,
  streetPath8,
  museumGallery12,
  airport15,
  restaurant12,
  campus12,
  blankWordCard30,
]

export const TEMPLATE_MAP: Record<string, MemoryTemplate> =
  Object.fromEntries(MEMORY_TEMPLATES.map((t) => [t.id, t]))

export {
  studyRoom9,
  classroom9,
  ancientCottage9,
  palaceHall12,
  streetPath8,
  museumGallery12,
  airport15,
  restaurant12,
  campus12,
  blankWordCard30,
}
