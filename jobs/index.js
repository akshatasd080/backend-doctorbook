/**
 * Background / scheduled jobs placeholder.
 * Add cron jobs or queue workers here when needed.
 *
 * Example (with node-cron):
 *   const cron = require('node-cron');
 *   cron.schedule('0 0 * * *', () => { ... });
 */

function startJobs() {
  console.log('Background jobs module loaded (none scheduled yet).');
}

module.exports = {
  startJobs,
};
