const { normalizeSync: normalize_diac } = require('normalize-diacritics')

const BAD_WORDS = {
  0.8: ['炸群', '@tingpo', '__asm__test__key__'],
  0.5: [
    '电报',
    '土豆',
    '非小号',
    '微信：',
    '在线',
    '咨询',
    '增粉',
    'mytoken',
    '专卖',
    '莆田',
    '推广',
    '热搜',
    '承接',
    '客服',
  ],
  0.3: [
    '出售',
    '联系',
    '私聊',
    '加好友',
    '头像',
    '推特',
    '脸书',
    '油管',
    '业务',
    '飞机',
    'telegram',
  ],
}

const NIL_REGEX = [/[-═┅┅┅=]/g]

function normalize(word) {
  for (const i of NIL_REGEX) word = word.replace(i, '')
  return normalize_diac(word)
}

function bayes(str) {
  let ret = 0
  console.log('-<', str)
  str = normalize(str)
  console.log('->', str)
  for (const [key, val] of Object.entries(BAD_WORDS)) {
    for (const word of val) {
      if (str.includes(word)) ret += Number(key)
    }
  }
  return ret
}

module.exports = { bayes }
