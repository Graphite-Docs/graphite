'use strict';

// Credits go to @tcolgate

const Counter = require('prom-client').Counter;
const optional = require('optional');

const gc = optional('gc-stats');

const gcTypes = {
  0: 'Unknown',
  1: 'Scavenge',
  2: 'MarkSweepCompact',
  3: 'ScavengeAndMarkSweepCompact',
  4: 'IncrementalMarking',
  8: 'WeakPhantom',
  15: 'All',
};

const noop = () => {};

module.exports = registry => {
  if (typeof gc !== 'function') {
    return noop;
  }

  const registers = registry ? [registry] : undefined;

  const labelNames = ['gctype'];

  const gcCount = new Counter({
    name: 'nodejs_gc_runs_total',
    help: 'Count of total garbage collections.',
    labelNames,
    registers,
  });
  const gcTimeCount = new Counter({
    name: 'nodejs_gc_pause_seconds_total',
    help: 'Time spent in GC Pause in seconds.',
    labelNames,
    registers,
  });
  const gcReclaimedCount = new Counter({
    name: 'nodejs_gc_reclaimed_bytes_total',
    help: 'Total number of bytes reclaimed by GC.',
    labelNames,
    registers,
  });

  let started = false;

  return () => {
    if (started !== true) {
      started = true;

      gc().on('stats', stats => {
        const gcType = gcTypes[stats.gctype];

        gcCount.labels(gcType).inc();
        gcTimeCount.labels(gcType).inc(stats.pause / 1e9);

        if (stats.diff.usedHeapSize < 0) {
          gcReclaimedCount.labels(gcType).inc(stats.diff.usedHeapSize * -1);
        }
      });
    }
  };
};
