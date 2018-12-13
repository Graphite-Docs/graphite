
module.exports = {
  WORKER_REQUEST_READ_LOCK: 'lock:worker:request-read',
  WORKER_RELEASE_READ_LOCK: 'lock:worker:release-read',
  MASTER_GRANT_READ_LOCK: 'lock:master:grant-read',

  WORKER_REQUEST_WRITE_LOCK: 'lock:worker:request-write',
  WORKER_RELEASE_WRITE_LOCK: 'lock:worker:release-write',
  MASTER_GRANT_WRITE_LOCK: 'lock:master:grant-write'
}
