import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getDeviceClockTime } from '../status-portrait-free/quiet-clock.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.000001, `${actual} ≈ ${expected}`);

test('三根指针对应设备本地时间，包括分秒与毫秒带来的连续偏移', () => {
  const time = getDeviceClockTime(new Date(2026, 9, 4, 15, 15, 30, 500));
  assert.equal(time.label, '15:15');
  assert.equal(time.datetime, '15:15:30');
  near(time.angles.hour, 97.7541666667);
  near(time.angles.minute, 93.05);
  near(time.angles.second, 183);
});

test('跨过午夜后三根指针回到十二点，数字读数进入新的一天', () => {
  const before = getDeviceClockTime(new Date(2026, 9, 4, 23, 59, 59, 900));
  assert.equal(before.label, '23:59');
  assert.ok(Object.values(before.angles).every(angle => angle > 359));
  const midnight = getDeviceClockTime(new Date(2026, 9, 5, 0, 0, 0));
  assert.equal(midnight.datetime, '00:00:00');
  assert.deepEqual(midnight.angles, { hour: 0, minute: 0, second: 0 });
  const noon = getDeviceClockTime(new Date(2026, 9, 5, 12, 0, 0));
  assert.equal(noon.label, '12:00');
  assert.deepEqual(noon.angles, midnight.angles);
});

test('重新采样采用设备的新时间，不累计页面停留时长', () => {
  getDeviceClockTime(new Date(2026, 9, 4, 20, 45, 30));
  const resynced = getDeviceClockTime(new Date(2026, 9, 4, 6, 30, 0));
  assert.equal(resynced.label, '06:30');
  assert.deepEqual(resynced.angles, { hour: 195, minute: 180, second: 0 });
});
