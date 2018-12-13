var ACTIONS = {
  INIT: 'init',
  START: 'start',
  STOP: 'stop',
  RESET: 'reset',
  RESTART: 'restart',
  PREV: 'prev',
  NEXT: 'next',
  GO: 'go',
  INDEX: 'index',
  CLOSE: 'close',
  SKIP: 'skip',
  UPDATE: 'update'
};

var EVENTS = {
  TOUR_START: 'tour:start',
  STEP_BEFORE: 'step:before',
  BEACON: 'beacon',
  TOOLTIP: 'tooltip',
  TOOLTIP_CLOSE: 'close',
  STEP_AFTER: 'step:after',
  TOUR_END: 'tour:end',
  TOUR_STATUS: 'tour:status',
  TARGET_NOT_FOUND: 'error:target_not_found',
  ERROR: 'error'
};

var LIFECYCLE = {
  INIT: 'init',
  READY: 'ready',
  BEACON: 'beacon',
  TOOLTIP: 'tooltip',
  COMPLETE: 'complete',
  ERROR: 'error'
};

var STATUS = {
  IDLE: 'idle',
  READY: 'ready',
  WAITING: 'waiting',
  RUNNING: 'running',
  PAUSED: 'paused',
  SKIPPED: 'skipped',
  FINISHED: 'finished',
  ERROR: 'error'
};

var index = { ACTIONS: ACTIONS, EVENTS: EVENTS, LIFECYCLE: LIFECYCLE, STATUS: STATUS };

export default index;
export { ACTIONS, EVENTS, LIFECYCLE, STATUS };
