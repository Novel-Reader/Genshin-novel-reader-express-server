const schedule = require('node-schedule');
const DBHelper = require("./utils/db-helper");
const logger = require("./utils/logger.js");
const { getTags } = require("./utils/get-tags.js");

class Queue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  push(task) {
    this.queue.push(task);
    this.next();
  }

  next() {
    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      this.running++;
      task().finally(() => {
        this.running--;
        this.next();
      });
    }
  }
}

function startSchedule() {
  const queue = new Queue(2);
  // eslint-disable-next-line no-new
  schedule.scheduleJob('0 * * * * *', () => {
    const sql = `SELECT id, name, detail FROM book WHERE tag = '' OR tag IS NULL`;
    DBHelper(sql, (err, results) => {
      if (err) {
        logger.error(err);
        return;
      }
      if (results.length > 0) {
        logger.info(`Found ${results.length} books without tags, processing in queue...`);        
        results.forEach(({ id, name, detail }) => {
          queue.push(() => {
            return getTags(detail).then((tags) => new Promise((resolve, reject) => {
              logger.info('schedule update tags for book ' + name + ' to ' + tags);
              const sql = `UPDATE book SET tag = ? WHERE id = ?`;
              DBHelper(sql, (err) => {
                if (err) {
                  logger.error('Database update error:', err);
                  reject(err);
                } else {
                  logger.info(`Successfully updated tags for book: ${name}`);
                  resolve();
                }
              }, [tags, id]);
            })).catch((error) => {
              logger.error(`Failed to generate tags for book ${name}; it will be retried later:`, error);
            });
          });
        });
      }
    });
  });
  logger.info('Schedule job started with queue concurrency limit');
}

module.exports = startSchedule;
