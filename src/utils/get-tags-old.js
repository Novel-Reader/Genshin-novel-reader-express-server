// You can use this function in MacOS, but can not use in centOS(not support nodejieba)
// run `npm install "nodejieba": "^3.4.3", "stopword": "^3.1.3" --save`
const nodejieba = require("nodejieba");
const { removeStopwords, zho } = require('stopword');

function getNLPtags(text, count) {
  // nodejieba 自定义用户分词库：将代码中的 user.dict.utf8 替换到 node_modules/nodejieba/submodules/cppjieba/dict/user.dict.utf8 默认分词库
  let chineseText = text.replace(/[a-zA-Z\n\r\t\f\v\u000B\u2028\u2029\uFEFF\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF\uFFA0\u00A0\u200B\u200C\u200D\u200E\u200F\u2028\u2029\u202A\u202B\u202C\u202D\u202E\u202F\uFEFF\uFFF9\uFFFA\uFFFB\uFFFC\uFFFD\uFFFE\uFFFF]/g, ' ');
  const words = nodejieba.cut(chineseText);
  // zho Chinese supported have no space between words.
  // you need to split the text into an array of words in another way than just textString.split(' '). 
  const results = removeStopwords(words, zho);
  const doubleWord = results.filter(item => { return item.length > 1; });
  const wordFrequency = {};
  for (const word of doubleWord) {
    if (wordFrequency[word]) {
      wordFrequency[word]++;
    } else {
      wordFrequency[word] = 1;
    }
  }
  const sortedWords = Object.keys(wordFrequency).sort((a, b) => wordFrequency[b] - wordFrequency[a]);
  const topWords = sortedWords.slice(0, count);
  return topWords.join(',');
}

export { getNLPtags };
