const assert = require('assert')
const { bayes } = require('./lib')

function test() {
  assert(bayes('tëlëgrαm═群┅加═粉┅推┅广=加=客服：@tingpo') > 0.7)
}

test()
