/* eslint-disable no-console */
import LatencyMonitor from './LatencyMonitor';

/* Load me and I print things - e.g.
 * @example
 * $.getScript('http://path/to/file.js');
 * // In console you will see something like this:
 * // Event Loop Latency Monitor Loaded:
 * // {dataEmitIntervalMs: 5000, latencyCheckIntervalMs: 500}
 * // Event Loop Latency:
 * // {avgMs: 0, events: 10, maxMs: 0, minMs: 0}
 */
const monitor = new LatencyMonitor();
console.log('Event Loop Latency Monitor Loaded: %O', {
    latencyCheckIntervalMs: monitor.latencyCheckIntervalMs,
    dataEmitIntervalMs: monitor.dataEmitIntervalMs
});
monitor.on('data', (summary) => console.log('Event Loop Latency: %O', summary));
