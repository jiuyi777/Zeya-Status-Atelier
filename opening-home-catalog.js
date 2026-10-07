import { BUNDLED_HOME_TEMPLATES } from './opening-bundled-themes.js?v=0.11.41';

export const HOME_TEMPLATES = Object.freeze([
    ...BUNDLED_HOME_TEMPLATES,
    {
        id: 'classical', name: '01 古典徽章', description: '古籍笺页 · 墨字朱印 · 章回目录',
        values: { theme: 'classical', font: 'kai', background: '#f5ead7', cardBackground: '#fffaf0', text: '#3d362d', accent: '#914538', secondary: '#796d59', introBackground: '#f5ead7', buttonColor: '#914538' },
    },
    {
        id: 'newspaper', name: '03 复古报刊', description: '报头分栏 · 印章与粗细线',
        values: { theme: 'newspaper', font: 'serif', background: '#f3eddc', cardBackground: '#eee4ce', text: '#201d19', accent: '#8d2d23', secondary: '#5a5348', introBackground: '#e1d5b9', buttonColor: '#201d19' },
    },
    {
        id: 'timeline', name: '04 中轴时间线', description: '粉青节点 · 立体柔边卡片',
        values: { theme: 'timeline', font: 'kai', background: '#fffaf1', cardBackground: '#fffaf0', text: '#3c3330', accent: '#b46662', secondary: '#6d9799', introBackground: '#e6efeb', buttonColor: '#6d9799' },
    },
    {
        id: 'minimal', name: '05 构成编辑', description: '米白纸张 · 黑色网格 · 暗红索引',
        values: { theme: 'minimal', font: 'sans', background: '#f6f4ee', cardBackground: '#fffaf0', text: '#2c322f', accent: '#9b332c', secondary: '#a98763', introBackground: '#e8e0d0', buttonColor: '#171717' },
    },
    {
        id: 'scroll', name: '06 古风卷轴', description: '花绕折角 · 素笺留白',
        values: { theme: 'scroll', font: 'serif', background: '#fbf9f4', cardBackground: '#fdfbf7', text: '#534b43', accent: '#8a716b', secondary: '#7b7469', introBackground: '#fbf9f4', buttonColor: '#8a716b' },
    },
    {
        id: 'editorial', name: '07 美式杂志', description: '黑红刊头 · 留白分栏 · 连续篇目',
        values: { theme: 'editorial', font: 'sans', background: '#f5f0e6', cardBackground: '#fcf9f3', text: '#242c30', accent: '#a44838', secondary: '#726b61', introBackground: '#f5f0e6', buttonColor: '#242c30' },
    },
    {
        id: 'collage', name: '08 拼贴手账', description: '旅行邮票 · 错落叠纸 · 故事票签',
        values: { theme: 'collage', font: 'serif', background: '#efe6d7', cardBackground: '#fff8ea', text: '#31302c', accent: '#d55445', secondary: '#3d8190', introBackground: '#f2cc63', buttonColor: '#3d8190' },
    },
    {
        id: 'dossier', name: '09 黑银档案', description: '黑银卷宗 · 细线索引 · 纸白文字',
        values: { theme: 'dossier', font: 'sans', background: '#1b1d1f', cardBackground: '#292d31', text: '#f0eadf', accent: '#bac8c5', secondary: '#a9afb3', introBackground: '#34383d', buttonColor: '#bac8c5' },
    },
    {
        id: 'glass', name: '10 水色玻璃', description: '鸢尾水岸 · 雾蓝纸面 · 玻璃篇目',
        values: { theme: 'glass', font: 'sans', background: '#dbecef', cardBackground: '#f1f8f7', text: '#24444d', accent: '#45999b', secondary: '#667ca0', introBackground: '#c8e2df', buttonColor: '#397f83' },
    },
    {
        id: 'kinetic', name: '11 动态字构', description: '蓝白刊页 · 字体入场 · 连续篇目',
        values: { theme: 'kinetic', font: 'sans', background: '#f1f1ef', cardBackground: '#ffffff', text: '#102c9e', accent: '#1438c2', secondary: '#7187df', introBackground: '#dce3ff', buttonColor: '#1438c2' },
    },
    {
        id: 'noir-poster', name: '12 赤黑电影海报', description: '黑红片头 · 场次票根 · 序幕入场',
        values: { theme: 'noir-poster', font: 'sans', background: '#b83a30', cardBackground: '#171313', text: '#fff8ed', accent: '#ef5a49', secondary: '#d6c6b5', introBackground: '#302725', buttonColor: '#fff8ed' },
    },
    {
        id: 'negative-space', name: '13 立绘分割', description: '大图 / 立绘区 · 左右切换 · 自定义比例',
        values: { theme: 'negative-space', font: 'sans', background: '#f4f1ea', cardBackground: '#fffdfa', text: '#201b1b', accent: '#6c463b', secondary: '#81746b', introBackground: '#ded7cd', buttonColor: '#201b1b', imagePosition: 'left', imageWidth: 42 },
    },
]);

export const LEGACY_HOME_TEMPLATES = HOME_TEMPLATES.filter(t => !BUNDLED_HOME_TEMPLATES.some(b => b.id === t.id));
export function openingPreviewHref(id) {
  if (!HOME_TEMPLATES.some(t => t.id === id)) throw new Error('未知开场白模板');
  if (['soft-clock','signal-field','pixel-dusk'].includes(id)) return './opening-kinetic-preview.html?theme=' + id;
  if (['cloth-book','mixtape','folded-map','vellum-page'].includes(id)) return './opening-keepsake-preview.html?theme=' + id;
  if (BUNDLED_HOME_TEMPLATES.some(t => t.id === id)) return './opening-' + id + '-preview.html';
  return './opening-home-preview.html?theme=' + id;
}
