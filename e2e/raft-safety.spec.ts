/* Safety properties from the Raft paper (§5.2, §5.3, §5.4), asserted against
 * the exact engine that runs on /lab — imported directly, executed headless.
 * Each run pushes the cluster through minutes of simulated time under random
 * crashes, restarts and partitions. The seeds are fixed, so a failure here is
 * reproducible, not flaky.
 */
import { test, expect } from 'playwright/test';
import { RaftCluster } from '../src/lib/client/raft-core';

// Deterministic chaos schedule, separate from the cluster's own RNG.
function chaosRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TICK = 20; // ms of simulated time per step

interface RunResult {
  cluster: RaftCluster;
  leadersByTerm: Map<number, number>;
  violations: string[];
}

/** Run `seconds` of simulated time with random crashes/partitions/commands,
 * checking Election Safety continuously; then heal, revive, and settle. */
function chaosRun(seed: number, seconds: number): RunResult {
  const cluster = new RaftCluster({ seed });
  const rand = chaosRng(seed ^ 0x9e3779b9);
  const leadersByTerm = new Map<number, number>();
  const violations: string[] = [];

  const observe = () => {
    for (const nd of cluster.nodes) {
      if (!nd.alive || nd.role !== 'leader') continue;
      const seen = leadersByTerm.get(nd.currentTerm);
      if (seen === undefined) leadersByTerm.set(nd.currentTerm, nd.id);
      else if (seen !== nd.id)
        violations.push(
          `Election Safety: term ${nd.currentTerm} has two leaders (n${seen}, n${nd.id})`,
        );
    }
  };

  const steps = (seconds * 1000) / TICK;
  for (let i = 0; i < steps; i++) {
    cluster.tick(TICK);
    observe();
    const r = rand();
    if (r < 0.002) {
      // Crash a random live node — but never drop below a majority of live
      // nodes, or the run just stalls instead of exercising anything.
      const live = cluster.nodes.filter((n) => n.alive);
      if (live.length > 3) cluster.crash(live[(rand() * live.length) | 0].id);
    } else if (r < 0.005) {
      const dead = cluster.nodes.filter((n) => !n.alive);
      if (dead.length) cluster.restart(dead[(rand() * dead.length) | 0].id);
    } else if (r < 0.006) {
      cluster.partition(
        cluster.partitioned ? [] : [(rand() * cluster.n) | 0, (rand() * cluster.n) | 0],
      );
    } else if (r < 0.02) {
      cluster.clientRequest();
    }
  }

  // Heal and settle so convergence properties can be checked on a quiet net.
  cluster.partition([]);
  for (const nd of cluster.nodes) if (!nd.alive) cluster.restart(nd.id);
  for (let i = 0; i < (15 * 1000) / TICK; i++) {
    cluster.tick(TICK);
    observe();
  }

  return { cluster, leadersByTerm, violations };
}

for (const seed of [7, 42, 1337]) {
  test(`raft safety properties hold under chaos (seed ${seed})`, () => {
    const { cluster, violations } = chaosRun(seed, 120);

    // §5.2 Election Safety — at most one leader per term, checked every tick.
    expect(violations).toEqual([]);

    // Liveness after healing: the settled cluster has exactly one leader.
    expect(cluster.leader()).not.toBeNull();

    // §5.3 Log Matching — if two logs share (index, term), they are identical
    // up through that index. Pairwise over full logs.
    for (const a of cluster.nodes)
      for (const b of cluster.nodes) {
        const min = Math.min(a.log.length, b.log.length) - 1;
        for (let i = min; i >= 1; i--) {
          if (a.log[i].term === b.log[i].term) {
            for (let j = i; j >= 1; j--) {
              expect(a.log[j].term).toBe(b.log[j].term);
              expect(a.log[j].cmd).toBe(b.log[j].cmd);
            }
            break;
          }
        }
      }

    // §5.4.3 State Machine Safety — applied sequences are prefix-consistent
    // across every pair of nodes.
    for (const a of cluster.nodes)
      for (const b of cluster.nodes) {
        const min = Math.min(a.applied.length, b.applied.length);
        expect(a.applied.slice(0, min)).toEqual(b.applied.slice(0, min));
      }

    // The run did real work: commands were committed and applied everywhere
    // after healing (all logs converge to the leader's committed prefix).
    const ld = cluster.nodes[cluster.leader()!];
    expect(ld.commitIndex).toBeGreaterThan(10);
    for (const nd of cluster.nodes) expect(nd.lastApplied).toBe(ld.commitIndex);
  });
}

test('a partitioned-away leader cannot commit, and steps down on heal', () => {
  const cluster = new RaftCluster({ seed: 99 });
  // Elect an initial leader.
  for (let i = 0; i < 500 && cluster.leader() === null; i++) cluster.tick(TICK);
  const oldLeader = cluster.leader()!;

  // Isolate the leader alone (1/4 minority) and give it client commands.
  cluster.partition([oldLeader]);
  const before = cluster.nodes[oldLeader].commitIndex;
  for (let i = 0; i < 3; i++) cluster.clientRequest();
  for (let i = 0; i < (20 * 1000) / TICK; i++) cluster.tick(TICK);

  // The minority leader must not have committed anything new…
  expect(cluster.nodes[oldLeader].commitIndex).toBe(before);
  // …and the majority side elected a new leader at a higher term.
  const newLeader = cluster.leader()!;
  expect(newLeader).not.toBe(oldLeader);
  expect(cluster.nodes[newLeader].currentTerm).toBeGreaterThan(
    cluster.nodes[oldLeader].currentTerm,
  );

  // Heal: the deposed leader steps down and its uncommitted entries are
  // overwritten by the new leader's log (§5.3 repair).
  cluster.partition([]);
  cluster.clientRequest();
  for (let i = 0; i < (15 * 1000) / TICK; i++) cluster.tick(TICK);
  expect(cluster.nodes[oldLeader].role).not.toBe('leader');
  const ld = cluster.nodes[cluster.leader()!];
  expect(cluster.nodes[oldLeader].log.length).toBe(ld.log.length);
  expect(cluster.nodes[oldLeader].lastApplied).toBe(ld.commitIndex);
});
