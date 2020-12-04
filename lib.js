const { normalizeSync: normalize_diac } = require('normalize-diacritics')

const BAD_WORDS = require('./data/bayes')

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

function getFullName(user) {
  return (user.first_name || '') + (user.last_name || '')
}

function getMessageSourceTitle(message) {
  if (message.forward_from) {
    return getFullName(message.forward_from)
  } else if (message.forward_from_chat) {
    return message.forward_from_chat.title || ''
  } else {
    return ''
  }
}

module.exports = { bayes, getFullName, getMessageSourceTitle }
