const schedule = require('node-schedule');
const DBHelper = require("./utils/db-helper");
const logger = require("./utils/logger.js");
const { getTags } = require("./utils/get-tags.js");

function startSchedule() {
  // eslint-disable-next-line no-new
  schedule.scheduleJob('0 * * * * *', () => {
    const sql = `SELECT id, name, detail FROM book WHERE tag = '' OR tag IS NULL`;
    DBHelper(sql, (err, results) => {
      if (err) {
        logger.error(err);
        return;
      }
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          const { id, name, detail } = results[i];
          const callback = (tags) => {
            logger.info('schedule update tags for book ' + name + ' to ' + tags);
            const sql = `UPDATE book SET tag = ? WHERE id = ?`;
            DBHelper(sql, (err, results) => {
              if (err) {
                logger.error(err);
                return;
              }
            }, [tags, id]);
          };
          getTags(detail, callback);
        }
      }
    });
  });
  logger.info('Schedule job started');
}

module.exports = startSchedule;
