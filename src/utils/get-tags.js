const { spawn } = require('child_process');
const { CUSTOM_TAGS } = require("./constants");
const logger = require('./logger');

function countOccurrences(str, substr) {
  const regex = new RegExp(substr, 'g');
  return (str.match(regex) || []).length;
}

function getCustomTags(text, count) {
  let result = [];
  for (let i = 0; i < CUSTOM_TAGS.length; i++) {
    let count = countOccurrences(text, CUSTOM_TAGS[i]);
    if (count > 0) {
      result.push({ name: CUSTOM_TAGS[i], count: count });
    }
  }
  result = result.sort((a, b) => b.count - a.count);
  return result.slice(0, count).map(item => { return item.name; }).join(',');
}

function getTags(text, callback) {
  let customTags = getCustomTags(text, 5);
  let python;
  let result = '';
  try {
    // 先开启虚拟环境, 安装 python 依赖，然后在根目录下运行 npm start,所以这里路径应该是
    // 使用 nice 命令降低 CPU 优先级，数值越大优先级越低（0-19），避免占用过多CPU资源造成服务卡顿
    python = spawn('nice', ['-n', '10', 'python3', 'src/utils/python/app.py', text, '20']);
  } catch (error) {
    logger.error('spawn python process error', error);
  }
  if (python) {
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    python.stderr.on('data', (data) => {
      logger.info(`data: ${data}`);
    });
    python.on('close', (code) => {
      if (code === 0) {
        let allTags = customTags ? customTags + ',' + result : result;
        // tags 长度不超过50个字符
        if (allTags.length >= 50) {
          allTags = allTags.slice(0, 50);
        }
        callback(allTags);
      } else {
        logger.error(`进程以 ${code} 代码退出`);
      }
    });
  } else {
    callback(customTags);
  }
}

export { getTags };
