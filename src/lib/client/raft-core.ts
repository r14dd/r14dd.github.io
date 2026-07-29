/* A real Raft implementation — leader election, log replication, quorum
 * commitment — over a simulated network with latency, loss, crashes and
 * partitions. Pure and deterministic: a seeded RNG and a virtual clock mean
 * the same seed always produces the same history, which is what lets the test
 * suite run minutes of cluster time and assert the paper's safety properties
 * (Election Safety, Log Matching, State Machine Safety) on every build.
 *
 * No DOM, no timers, no imports: the UI drives it by calling tick(dt) and
 * reading events. Figure 2 of the Raft paper is the spec; section comments
 * below reference it.
 */

export type Role = 'follower' | 'candidate' | 'leader';

export interface LogEntry {
  term: number;
  cmd: string;
}

export interface RequestVoteMsg {
  kind: 'RequestVote';
  term: number;
  candidateId: number;
  lastLogIndex: number;
  lastLogTerm: number;
}
export interface VoteResponseMsg {
  kind: 'VoteResponse';
  term: number;
  voteGranted: boolean;
}
export interface AppendEntriesMsg {
  kind: 'AppendEntries';
  term: number;
  leaderId: number;
  prevLogIndex: number;
  prevLogTerm: number;
  entries: LogEntry[];
  leaderCommit: number;
}
export interface AppendResponseMsg {
  kind: 'AppendResponse';
  term: number;
  success: boolean;
  // On success: index of the last entry known replicated.
  matchIndex: number;
  // On failure: the follower's last log index — the §5.3 fast-backoff hint.
  // Without it, catching up a long-dead follower decrements nextIndex one
  // heartbeat at a time and takes ~one RTT per missing entry.
  hintIndex: number;
}
export type Message = RequestVoteMsg | VoteResponseMsg | AppendEntriesMsg | AppendResponseMsg;

export interface Envelope {
  id: number;
  from: number;
  to: number;
  msg: Message;
  sentAt: number;
  deliverAt: number;
}

export interface RaftEvent {
  at: number;
  text: string;
  // Which node the event is about, for UI highlighting; -1 = cluster-wide.
  node: number;
}

interface Node {
  id: number;
  alive: boolean;
  role: Role;
  // ── Persistent state (Figure 2) — survives crash+restart ──
  currentTerm: number;
  votedFor: number | null;
  log: LogEntry[]; // 1-indexed conceptually; log[0] unused sentinel
  // ── Volatile state — reset on restart ──
  commitIndex: number;
  lastApplied: number;
  applied: string[]; // the state machine: committed commands, in order
  leaderId: number | null;
  electionDeadline: number;
  // ── Leader state ──
  nextIndex: number[];
  matchIndex: number[];
  heartbeatDue: number;
  votesGranted: Set<number>;
}

export interface ClusterOptions {
  n?: number;
  seed?: number;
  electionTimeoutMin?: number;
  electionTimeoutMax?: number;
  heartbeatInterval?: number;
  latencyMin?: number;
  latencyMax?: number;
  lossRate?: number;
}

// mulberry32 — tiny, good-enough, deterministic.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class RaftCluster {
  readonly n: number;
  now = 0;
  private rand: () => number;
  private opts: Required<ClusterOptions>;
  nodes: Node[];
  inFlight: Envelope[] = [];
  events: RaftEvent[] = [];
  private msgSeq = 0;
  private cmdSeq = 0;
  // Adjacency: partitioned[a][b] = true means a→b traffic is dropped.
  private cut: boolean[][];

  constructor(options: ClusterOptions = {}) {
    this.opts = {
      n: options.n ?? 5,
      seed: options.seed ?? 1,
      electionTimeoutMin: options.electionTimeoutMin ?? 1500,
      electionTimeoutMax: options.electionTimeoutMax ?? 3000,
      heartbeatInterval: options.heartbeatInterval ?? 500,
      latencyMin: options.latencyMin ?? 60,
      latencyMax: options.latencyMax ?? 220,
      lossRate: options.lossRate ?? 0.02,
    };
    this.n = this.opts.n;
    this.rand = rng(this.opts.seed);
    this.cut = Array.from({ length: this.n }, () => Array(this.n).fill(false));
    this.nodes = Array.from({ length: this.n }, (_, id) => this.freshNode(id));
  }

  private freshNode(id: number): Node {
    return {
      id,
      alive: true,
      role: 'follower',
      currentTerm: 0,
      votedFor: null,
      log: [{ term: 0, cmd: '' }],
      commitIndex: 0,
      lastApplied: 0,
      applied: [],
      leaderId: null,
      electionDeadline: this.electionTimeout(),
      nextIndex: Array(this.n).fill(1),
      matchIndex: Array(this.n).fill(0),
      heartbeatDue: 0,
      votesGranted: new Set(),
    };
  }

  private electionTimeout(): number {
    const { electionTimeoutMin: lo, electionTimeoutMax: hi } = this.opts;
    return this.now + lo + this.rand() * (hi - lo);
  }

  private emit(node: number, text: string) {
    this.events.push({ at: this.now, node, text });
    if (this.events.length > 200) this.events.splice(0, this.events.length - 200);
  }

  // ───────────────────────── network ─────────────────────────

  private send(from: number, to: number, msg: Message) {
    if (!this.nodes[from].alive) return;
    // Loss and partitions drop at send time; a message already in flight when
    // a partition lands still arrives, like real queued packets.
    if (this.cut[from][to] || this.rand() < this.opts.lossRate) return;
    const { latencyMin: lo, latencyMax: hi } = this.opts;
    this.inFlight.push({
      id: this.msgSeq++,
      from,
      to,
      msg,
      sentAt: this.now,
      deliverAt: this.now + lo + this.rand() * (hi - lo),
    });
  }

  // ───────────────────────── controls ─────────────────────────

  crash(id: number) {
    const nd = this.nodes[id];
    if (!nd.alive) return;
    nd.alive = false;
    if (nd.role === 'leader') this.emit(id, `n${id} (leader, term ${nd.currentTerm}) crashed`);
    else this.emit(id, `n${id} crashed`);
  }

  restart(id: number) {
    const nd = this.nodes[id];
    if (nd.alive) return;
    // Persistent state survives; volatile state resets (Figure 2).
    nd.alive = true;
    nd.role = 'follower';
    nd.leaderId = null;
    nd.commitIndex = 0;
    nd.lastApplied = 0;
    nd.applied = [];
    nd.votesGranted = new Set();
    nd.electionDeadline = this.electionTimeout();
    this.emit(id, `n${id} restarted (term ${nd.currentTerm}, log intact)`);
  }

  /** Cut every link between the two groups. Pass [] to heal. */
  partition(groupA: number[]) {
    const inA = new Set(groupA);
    for (let a = 0; a < this.n; a++)
      for (let b = 0; b < this.n; b++) this.cut[a][b] = inA.has(a) !== inA.has(b);
    if (groupA.length === 0) this.emit(-1, 'partition healed');
    else this.emit(-1, `partition: {${groupA.map((i) => 'n' + i).join(' ')}} isolated`);
  }

  get partitioned(): boolean {
    return this.cut.some((row) => row.some(Boolean));
  }

  leader(): number | null {
    // Highest-term live leader — during a partition a deposed leader may
    // linger at a lower term; the real one is the one at the top term.
    let best: Node | null = null;
    for (const nd of this.nodes)
      if (nd.alive && nd.role === 'leader' && (!best || nd.currentTerm > best.currentTerm))
        best = nd;
    return best ? best.id : null;
  }

  /** Client request. Returns the node it went to, or null if no leader. */
  clientRequest(cmd?: string): number | null {
    const ld = this.leader();
    if (ld === null) return null;
    const nd = this.nodes[ld];
    const c = cmd ?? `x←${++this.cmdSeq}`;
    nd.log.push({ term: nd.currentTerm, cmd: c });
    nd.matchIndex[ld] = nd.log.length - 1;
    this.emit(ld, `client → n${ld}: append "${c}" (term ${nd.currentTerm})`);
    // Ship it immediately rather than waiting for the next heartbeat.
    this.broadcastAppends(nd);
    return ld;
  }

  // ───────────────────────── engine ─────────────────────────

  tick(dt: number) {
    // Cap a background-tab catch-up so we never grind through minutes at once.
    this.now += Math.min(dt, 1000);

    // Deliver due messages (sorted stable by deliverAt for determinism).
    const due = this.inFlight.filter((e) => e.deliverAt <= this.now);
    if (due.length) {
      this.inFlight = this.inFlight.filter((e) => e.deliverAt > this.now);
      due.sort((a, b) => a.deliverAt - b.deliverAt || a.id - b.id);
      for (const env of due) this.deliver(env);
    }

    for (const nd of this.nodes) {
      if (!nd.alive) continue;
      if (nd.role === 'leader') {
        if (this.now >= nd.heartbeatDue) this.broadcastAppends(nd);
      } else if (this.now >= nd.electionDeadline) {
        this.becomeCandidate(nd);
      }
      this.applyCommitted(nd);
    }
  }

  private becomeCandidate(nd: Node) {
    nd.role = 'candidate';
    nd.currentTerm++;
    nd.votedFor = nd.id;
    nd.leaderId = null;
    nd.votesGranted = new Set([nd.id]);
    nd.electionDeadline = this.electionTimeout();
    this.emit(nd.id, `n${nd.id} timed out → candidate, term ${nd.currentTerm}`);
    const last = nd.log.length - 1;
    for (let p = 0; p < this.n; p++)
      if (p !== nd.id)
        this.send(nd.id, p, {
          kind: 'RequestVote',
          term: nd.currentTerm,
          candidateId: nd.id,
          lastLogIndex: last,
          lastLogTerm: nd.log[last].term,
        });
  }

  private becomeLeader(nd: Node) {
    nd.role = 'leader';
    nd.leaderId = nd.id;
    nd.nextIndex = Array(this.n).fill(nd.log.length);
    nd.matchIndex = Array(this.n).fill(0);
    nd.matchIndex[nd.id] = nd.log.length - 1;
    nd.heartbeatDue = this.now; // heartbeat immediately
    this.emit(nd.id, `n${nd.id} elected leader, term ${nd.currentTerm} ♛`);
  }

  private stepDown(nd: Node, term: number) {
    nd.currentTerm = term;
    nd.role = 'follower';
    nd.votedFor = null;
    nd.votesGranted = new Set();
    nd.electionDeadline = this.electionTimeout();
  }

  private broadcastAppends(nd: Node) {
    nd.heartbeatDue = this.now + this.opts.heartbeatInterval;
    for (let p = 0; p < this.n; p++) {
      if (p === nd.id) continue;
      const prev = nd.nextIndex[p] - 1;
      this.send(nd.id, p, {
        kind: 'AppendEntries',
        term: nd.currentTerm,
        leaderId: nd.id,
        prevLogIndex: prev,
        prevLogTerm: nd.log[prev]?.term ?? 0,
        entries: nd.log.slice(nd.nextIndex[p]),
        leaderCommit: nd.commitIndex,
      });
    }
  }

  private deliver(env: Envelope) {
    const nd = this.nodes[env.to];
    if (!nd.alive) return;
    const m = env.msg;

    // Any message with a newer term converts the receiver to follower first.
    if (m.term > nd.currentTerm) this.stepDown(nd, m.term);

    switch (m.kind) {
      case 'RequestVote': {
        let grant = false;
        if (m.term >= nd.currentTerm && (nd.votedFor === null || nd.votedFor === m.candidateId)) {
          // §5.4.1 election restriction: candidate's log must be at least as
          // up-to-date as ours.
          const last = nd.log.length - 1;
          const upToDate =
            m.lastLogTerm > nd.log[last].term ||
            (m.lastLogTerm === nd.log[last].term && m.lastLogIndex >= last);
          if (upToDate) {
            grant = true;
            nd.votedFor = m.candidateId;
            nd.electionDeadline = this.electionTimeout();
          }
        }
        this.send(nd.id, env.from, {
          kind: 'VoteResponse',
          term: nd.currentTerm,
          voteGranted: grant,
        });
        break;
      }
      case 'VoteResponse': {
        if (nd.role !== 'candidate' || m.term !== nd.currentTerm) break;
        if (m.voteGranted) {
          nd.votesGranted.add(env.from);
          if (nd.votesGranted.size > this.n / 2) this.becomeLeader(nd);
        }
        break;
      }
      case 'AppendEntries': {
        if (m.term < nd.currentTerm) {
          this.send(nd.id, env.from, {
            kind: 'AppendResponse',
            term: nd.currentTerm,
            success: false,
            matchIndex: 0,
            hintIndex: nd.log.length - 1,
          });
          break;
        }
        // Valid leader for this term.
        nd.role = 'follower';
        nd.leaderId = m.leaderId;
        nd.electionDeadline = this.electionTimeout();
        // Log consistency check (Figure 2, AppendEntries receiver step 2).
        const prevOk =
          m.prevLogIndex < nd.log.length && nd.log[m.prevLogIndex].term === m.prevLogTerm;
        if (!prevOk) {
          this.send(nd.id, env.from, {
            kind: 'AppendResponse',
            term: nd.currentTerm,
            success: false,
            matchIndex: 0,
            hintIndex: nd.log.length - 1,
          });
          break;
        }
        // Steps 3–4: truncate on conflict, append what's new.
        let idx = m.prevLogIndex + 1;
        for (const entry of m.entries) {
          if (idx < nd.log.length && nd.log[idx].term !== entry.term) nd.log.length = idx;
          if (idx >= nd.log.length) nd.log.push(entry);
          idx++;
        }
        // Step 5: advance commit index.
        if (m.leaderCommit > nd.commitIndex)
          nd.commitIndex = Math.min(m.leaderCommit, nd.log.length - 1);
        this.send(nd.id, env.from, {
          kind: 'AppendResponse',
          term: nd.currentTerm,
          success: true,
          matchIndex: m.prevLogIndex + m.entries.length,
          hintIndex: nd.log.length - 1,
        });
        break;
      }
      case 'AppendResponse': {
        if (nd.role !== 'leader' || m.term !== nd.currentTerm) break;
        const p = env.from;
        if (m.success) {
          nd.matchIndex[p] = Math.max(nd.matchIndex[p], m.matchIndex);
          nd.nextIndex[p] = nd.matchIndex[p] + 1;
          this.advanceCommit(nd);
        } else {
          // Fast backoff: jump straight past everything the follower can't
          // have, then fall back to stepping for genuine term conflicts.
          nd.nextIndex[p] = Math.max(1, Math.min(nd.nextIndex[p] - 1, m.hintIndex + 1));
        }
        break;
      }
    }
  }

  private advanceCommit(nd: Node) {
    // Find the highest N > commitIndex replicated on a majority with
    // log[N].term == currentTerm (§5.4.2 — never commit prior-term entries
    // by counting; they commit implicitly under a current-term entry).
    for (let N = nd.log.length - 1; N > nd.commitIndex; N--) {
      if (nd.log[N].term !== nd.currentTerm) break;
      let count = 0;
      for (let p = 0; p < this.n; p++) if (nd.matchIndex[p] >= N) count++;
      if (count > this.n / 2) {
        nd.commitIndex = N;
        this.emit(nd.id, `n${nd.id} commits through index ${N} (quorum ${count}/${this.n})`);
        break;
      }
    }
  }

  private applyCommitted(nd: Node) {
    while (nd.lastApplied < nd.commitIndex) {
      nd.lastApplied++;
      nd.applied.push(nd.log[nd.lastApplied].cmd);
    }
  }
}
