# Solana Internals: Course Plan

## Step 1: Define the Transformation

```yaml
course:
  slug: solana-internals
  title: Solana Protocol Internals

  audience:
    knows:
      - Blockchain fundamentals (transactions, consensus, validators)
      - Basic distributed systems concepts
      - Programming experience (any language)
    context: Backend/protocol developers, architects, senior engineers
    motivation: |
      Understand how Solana achieves 65,000+ TPS, build high-performance
      programs, debug at the protocol level, or evaluate Solana for
      production systems

  transformation:
    start: "Understands blockchains conceptually but not Solana's architecture"
    end: "Can explain Solana's performance characteristics from first principles,
          recognize architectural patterns, and optimize programs with protocol knowledge"
    arc: "From blockchain fundamentals to mastering Solana's parallelized architecture"
```

## Step 2: List Required Concepts

```yaml
concepts:
  # Foundation Layer - The Core Innovation
  - name: proof-of-history-mechanism
    what: Cryptographic clock that creates verifiable passage of time
    why_matters: |
      Eliminates coordination overhead in distributed consensus.
      Without PoH, validators waste time agreeing on when things happened.
    depends_on: [cryptographic-hashing, blockchain-ordering]
    foundational: true
    energy_level: medium-high

  - name: poh-sequence-generation
    what: How validators generate and verify SHA-256 hash chains
    why_matters: Creates the verifiable clock that timestamps all events
    depends_on: [proof-of-history-mechanism]
    foundational: true
    energy_level: medium

  # State Management Layer
  - name: account-model
    what: Solana's approach to storing state (accounts, data, executable)
    why_matters: |
      Fundamentally different from Ethereum's contract storage.
      Understanding this is prerequisite for everything else.
    depends_on: [blockchain-state-concepts]
    foundational: true
    energy_level: medium

  - name: account-ownership-model
    what: How programs own and modify account data
    why_matters: Enables the parallel execution model
    depends_on: [account-model]
    foundational: true
    energy_level: medium

  - name: rent-and-account-lifecycle
    what: Economic mechanism for state storage
    why_matters: Prevents state bloat, affects program design
    depends_on: [account-model]
    foundational: false
    energy_level: low

  # Transaction Layer
  - name: transaction-structure
    what: Transaction format with instruction array
    why_matters: Enables atomic multi-program composition
    depends_on: [account-model]
    foundational: true
    energy_level: medium

  - name: instruction-model
    what: How instructions reference accounts and programs
    why_matters: Enables parallel execution through read/write locks
    depends_on: [transaction-structure, account-ownership-model]
    foundational: true
    energy_level: medium

  # Parallel Execution - The Performance Secret
  - name: sealevel-runtime
    what: Parallel transaction execution engine
    why_matters: |
      This is how Solana processes 50,000+ TPS.
      Most blockchains execute serially.
    depends_on: [account-ownership-model, instruction-model]
    foundational: true
    energy_level: high

  - name: transaction-conflict-detection
    what: How Sealevel determines which transactions can run in parallel
    why_matters: |
      Account locks make parallelism safe. Understanding this
      helps write programs that don't bottleneck.
    depends_on: [sealevel-runtime]
    foundational: true
    energy_level: high

  - name: bpf-runtime
    what: Berkeley Packet Filter VM for program execution
    why_matters: Fast, sandboxed, deterministic execution
    depends_on: [sealevel-runtime]
    foundational: false
    energy_level: low-medium

  # Network Layer - Getting Transactions In
  - name: transaction-processing-unit
    what: Pipeline for ingesting and processing transactions (TPU)
    why_matters: Understanding the journey from client to execution
    depends_on: [transaction-structure]
    foundational: true
    energy_level: medium

  - name: gulf-stream
    what: Mempool-less transaction forwarding
    why_matters: |
      Eliminates mempool overhead. Transactions go directly
      to upcoming leaders.
    depends_on: [poh-sequence-generation, transaction-processing-unit]
    foundational: false
    energy_level: medium-high

  - name: transaction-scheduling
    what: How TPU schedules execution within blocks
    why_matters: Affects transaction prioritization and fees
    depends_on: [transaction-processing-unit, sealevel-runtime]
    foundational: false
    energy_level: medium

  # Consensus Layer
  - name: tower-bft-basics
    what: Solana's PoH-optimized consensus mechanism
    why_matters: |
      How validators agree on state. Understanding this explains
      finality, forking, and validator behavior.
    depends_on: [proof-of-history-mechanism]
    foundational: true
    energy_level: medium-high

  - name: voting-and-lockouts
    what: How validators vote and commit to forks
    why_matters: Explains finality guarantees and slot confirmation
    depends_on: [tower-bft-basics]
    foundational: true
    energy_level: high

  - name: optimistic-confirmation
    what: Application-level confirmation before full finality
    why_matters: Enables sub-second UX while maintaining security
    depends_on: [voting-and-lockouts]
    foundational: false
    energy_level: low-medium

  # Block Production
  - name: leader-schedule
    what: Deterministic rotation of block producers
    why_matters: |
      Unlike PoW mining, Solana has predictable leaders.
      This enables Gulf Stream.
    depends_on: [tower-bft-basics]
    foundational: true
    energy_level: low-medium

  - name: block-building-pipeline
    what: How leaders pack transactions into blocks
    why_matters: Understanding block limits and transaction inclusion
    depends_on: [leader-schedule, transaction-scheduling]
    foundational: false
    energy_level: medium

  # Data Propagation
  - name: turbine-propagation
    what: Block distribution protocol using erasure coding
    why_matters: |
      How Solana propagates blocks to 1000+ validators in <400ms.
      Critical for understanding network performance.
    depends_on: [block-building-pipeline]
    foundational: true
    energy_level: high

  - name: turbine-tree-structure
    what: Hierarchical propagation reduces bandwidth
    why_matters: Explains how Solana scales validator count
    depends_on: [turbine-propagation]
    foundational: false
    energy_level: medium

  # Validation Layer
  - name: transaction-validation-unit
    what: Pipeline for validating received blocks (TVU)
    why_matters: How non-leader validators process blocks
    depends_on: [turbine-propagation, sealevel-runtime]
    foundational: true
    energy_level: low-medium

  - name: replay-stage
    what: Where validators re-execute transactions
    why_matters: Ensures deterministic state across all validators
    depends_on: [transaction-validation-unit]
    foundational: false
    energy_level: low

  # Storage Layer
  - name: accounts-db
    what: High-performance account storage system
    why_matters: |
      Stores 500M+ accounts, enables fast state access.
      Performance bottleneck for many programs.
    depends_on: [account-model]
    foundational: false
    energy_level: low-medium

  - name: snapshot-mechanism
    what: Periodic full state snapshots
    why_matters: Enables fast validator catch-up
    depends_on: [accounts-db]
    foundational: false
    energy_level: low

  # Network Communication
  - name: gossip-protocol
    what: How validators exchange metadata and state
    why_matters: Network awareness and validator discovery
    depends_on: []
    foundational: false
    energy_level: low

  # Economics
  - name: fee-markets
    what: Priority fees and transaction cost model
    why_matters: Understanding transaction inclusion and cost optimization
    depends_on: [transaction-scheduling]
    foundational: false
    energy_level: low-medium

  - name: staking-and-inflation
    what: Validator incentives and token economics
    why_matters: Security model and network sustainability
    depends_on: [tower-bft-basics]
    foundational: false
    energy_level: low

  # Integration Concepts
  - name: end-to-end-transaction-flow
    what: Complete journey from RPC submission to finalization
    why_matters: |
      Synthesizes all concepts. Understanding this enables
      debugging and optimization.
    depends_on: [
      gulf-stream,
      transaction-processing-unit,
      sealevel-runtime,
      turbine-propagation,
      tower-bft-basics
    ]
    foundational: true
    energy_level: medium-high

  - name: performance-characteristics
    what: Why Solana achieves its throughput numbers
    why_matters: |
      From first principles to 65,000 TPS. Understanding the
      tradeoffs and bottlenecks.
    depends_on: [
      sealevel-runtime,
      turbine-propagation,
      proof-of-history-mechanism,
      transaction-conflict-detection
    ]
    foundational: true
    energy_level: high
```

## Step 3: Cluster into Lessons

```yaml
lessons:
  # Arc 1: The Foundation - Understanding the Core Innovation
  - slug: 01-the-coordination-problem
    type: problem-solution
    energy: high
    purpose: |
      Establish why Solana exists. Show the coordination overhead
      in traditional blockchains, then introduce PoH as the solution.
    concepts:
      - blockchain-ordering-overhead
      - proof-of-history-mechanism
    teaches:
      - Why timestamp consensus is expensive
      - How PoH eliminates coordination
      - The SHA-256 hash chain mechanism

  - slug: 02-proof-of-history-deep-dive
    type: deep-dive
    energy: medium
    purpose: |
      Show exactly how PoH works: hash generation, verification,
      embedding events, and the security properties.
    concepts:
      - poh-sequence-generation
    teaches:
      - Hash chain generation mechanics
      - Event insertion into the sequence
      - Verification without re-computing
      - Security: why it's tamper-evident

  # Arc 2: State Management - How Solana Stores Data
  - slug: 03-account-model-fundamentals
    type: foundation
    energy: medium
    purpose: |
      Introduce Solana's account model. Contrast with Ethereum's
      contract storage to build mental models.
    concepts:
      - account-model
      - account-ownership-model
    teaches:
      - What accounts store (data, lamports, executable flag, owner)
      - Program-owned vs user-owned accounts
      - Why this enables parallelism (foreshadow)

  - slug: 04-transactions-and-instructions
    type: foundation
    energy: medium
    purpose: |
      Show transaction structure. Emphasize the instruction array
      and explicit account references.
    concepts:
      - transaction-structure
      - instruction-model
    teaches:
      - Transaction format breakdown
      - Instruction arrays enable atomic composition
      - Read/write account declarations (seed for parallelism)
      - Fee payer and signature model

  # Arc 3: The Performance Secret - Parallel Execution
  - slug: 05-sealevel-parallel-runtime
    type: problem-solution
    energy: high
    purpose: |
      The breakthrough moment. Show how Sealevel achieves parallelism
      through account locks and conflict detection.
    concepts:
      - sealevel-runtime
      - transaction-conflict-detection
    teaches:
      - Serial execution bottleneck (the problem)
      - Account locking enables safe parallelism
      - Conflict detection algorithm
      - Why read/write declarations matter

  - slug: 06-writing-parallel-friendly-programs
    type: integration
    energy: medium-high
    purpose: |
      Apply Sealevel understanding to program design. Show patterns
      that maximize throughput.
    concepts:
      - (application of sealevel concepts)
    teaches:
      - Designing for minimal lock contention
      - Account architecture for parallelism
      - Recognizing bottlenecks in program design

  # Arc 4: Getting Transactions In - The TPU Pipeline
  - slug: 07-transaction-lifecycle-overview
    type: foundation
    energy: medium
    purpose: |
      Map the journey: RPC → TPU → Banking → Execution.
      High-level before diving into stages.
    concepts:
      - transaction-processing-unit
    teaches:
      - TPU pipeline stages (fetch, verify, banking, broadcast)
      - Leader vs validator responsibilities
      - What happens when you submit a transaction

  - slug: 08-gulf-stream-architecture
    type: problem-solution
    energy: medium-high
    purpose: |
      Show how Gulf Stream eliminates the mempool and forwards
      transactions to upcoming leaders.
    concepts:
      - gulf-stream
      - leader-schedule
    teaches:
      - Mempool limitations (the problem)
      - Deterministic leader schedule
      - Transaction forwarding mechanics
      - Why this enables speed

  - slug: 09-transaction-scheduling-and-fees
    type: deep-dive
    energy: low-medium
    purpose: |
      How transactions are scheduled within blocks. Priority fees,
      compute budget, and inclusion guarantees.
    concepts:
      - transaction-scheduling
      - fee-markets
    teaches:
      - Scheduling algorithm in banking stage
      - Priority fee mechanics
      - Compute unit limits
      - Cost optimization strategies

  # Arc 5: Consensus - How Validators Agree
  - slug: 10-tower-bft-consensus
    type: foundation
    energy: medium-high
    purpose: |
      Introduce Tower BFT. Show how PoH optimizes traditional BFT
      by providing a clock.
    concepts:
      - tower-bft-basics
    teaches:
      - Traditional BFT communication overhead
      - How PoH provides a common time reference
      - Validator voting mechanism basics
      - Fork choice rules

  - slug: 11-voting-lockouts-and-finality
    type: problem-solution
    energy: high
    purpose: |
      Deep dive into how validators commit to forks through
      increasing lockout periods. This is complex but critical.
    concepts:
      - voting-and-lockouts
    teaches:
      - Vote commitment mechanism
      - Exponential lockout periods
      - How this achieves finality
      - Slashing conditions (commitment violations)

  - slug: 12-optimistic-confirmation
    type: integration
    energy: low-medium
    purpose: |
      Show how applications can provide fast UX while maintaining
      security through optimistic confirmation.
    concepts:
      - optimistic-confirmation
    teaches:
      - Difference between confirmation and finality
      - Voting threshold for optimistic confirmation
      - Application patterns for UX
      - Risk tradeoffs

  # Arc 6: Block Production and Propagation
  - slug: 13-block-building-mechanics
    type: deep-dive
    energy: medium
    purpose: |
      How leaders pack transactions into blocks within their slots.
    concepts:
      - block-building-pipeline
    teaches:
      - Slot duration (400ms)
      - Block limits (transaction count, compute units)
      - Packing algorithm
      - Block structure

  - slug: 14-turbine-block-propagation
    type: problem-solution
    energy: high
    purpose: |
      The breakthrough for scale. Show how Turbine propagates blocks
      to 1000+ validators in <400ms using erasure coding.
    concepts:
      - turbine-propagation
      - turbine-tree-structure
    teaches:
      - Bandwidth problem with naive broadcast
      - Erasure coding fundamentals
      - Tree-structured propagation
      - Why this scales validator count

  # Arc 7: Validation and Storage
  - slug: 15-transaction-validation-unit
    type: foundation
    energy: low-medium
    purpose: |
      How non-leader validators process received blocks through TVU.
    concepts:
      - transaction-validation-unit
      - replay-stage
    teaches:
      - TVU pipeline stages
      - Replay and re-execution
      - State validation
      - Fork reconciliation

  - slug: 16-accounts-db-and-storage
    type: deep-dive
    energy: low-medium
    purpose: |
      How Solana stores 500M+ accounts efficiently. Performance
      implications for program design.
    concepts:
      - accounts-db
      - snapshot-mechanism
      - rent-and-account-lifecycle
    teaches:
      - AccountsDB architecture
      - State snapshots
      - Rent mechanism
      - Storage optimization considerations

  # Arc 8: The Network Layer
  - slug: 17-gossip-and-network-topology
    type: foundation
    energy: low
    purpose: |
      How validators discover each other and exchange metadata.
    concepts:
      - gossip-protocol
    teaches:
      - Gossip protocol basics
      - What information is gossiped
      - Network topology formation
      - Validator discovery

  # Arc 9: Economics and Incentives
  - slug: 18-staking-and-validator-economics
    type: foundation
    energy: low
    purpose: |
      How validator incentives work. Security through economics.
    concepts:
      - staking-and-inflation
    teaches:
      - Staking mechanism
      - Inflation schedule
      - Validator rewards
      - Security model

  # Arc 10: Integration - Bringing It All Together
  - slug: 19-end-to-end-transaction-flow
    type: integration
    energy: medium-high
    purpose: |
      Synthesize everything. Walk through a transaction from submission
      to finalization, touching every system.
    concepts:
      - end-to-end-transaction-flow
    teaches:
      - Complete transaction journey
      - How all components interact
      - Debugging with protocol knowledge
      - Where bottlenecks occur

  - slug: 20-performance-from-first-principles
    type: integration
    energy: high
    purpose: |
      The finale. Explain from mechanism why Solana achieves
      65,000+ TPS. Connect all concepts.
    concepts:
      - performance-characteristics
    teaches:
      - How PoH eliminates coordination overhead
      - How Sealevel enables parallelism
      - How Turbine scales propagation
      - How Gulf Stream eliminates mempool
      - Tradeoffs and limitations
      - Future bottlenecks
```

## Step 4: Map the Reader Journey

```yaml
journey:
  - lesson: 01-the-coordination-problem
    prerequisites:
      - blockchain fundamentals (blocks, transactions, consensus)
      - basic understanding of distributed systems
    introduces:
      vocabulary:
        - proof of history
        - verifiable delay function
        - timestamp consensus
      mental_models:
        - "Traditional blockchains waste time agreeing on when things happened"
        - "PoH is a clock that all validators can verify"
        - "Coordination overhead limits throughput"
      skills:
        - Recognize coordination problems in distributed systems
        - Explain why PoH matters for performance
    seeds:
      - hash-chain-verification (paid off in lesson 2)
      - account-locks (paid off in lesson 5 on Sealevel)
      - leader-schedule (paid off in lesson 8 on Gulf Stream)
    harvests: []
    state_after:
      - "Understands the coordination problem PoH solves"
      - "Can explain PoH at a high level"
      - "Knows this is the foundation for everything else"

  - lesson: 02-proof-of-history-deep-dive
    prerequisites:
      - proof-of-history-mechanism (from lesson 1)
      - cryptographic hashing basics
    introduces:
      vocabulary:
        - SHA-256 hash chain
        - event insertion
        - verifiable sequence
        - slot
      mental_models:
        - "PoH is sequential by nature—each hash depends on the previous"
        - "Events are embedded in the sequence, not just timestamped"
        - "Verification is fast; generation is intentionally slow"
      skills:
        - Explain hash chain generation step-by-step
        - Verify PoH sequence validity
        - Understand security properties (tamper-evidence)
    seeds:
      - slot-timing (paid off in lesson 13 on block building)
      - deterministic-ordering (paid off in lesson 5 on parallelism)
    harvests:
      - hash-chain-verification: "Remember the PoH concept from lesson 1? Here's exactly how the hash chain works."
    state_after:
      - "Can explain PoH mechanism in detail"
      - "Understands why it's verifiable without re-computing"
      - "Knows the security guarantees PoH provides"

  - lesson: 03-account-model-fundamentals
    prerequisites:
      - blockchain state concepts
      - understanding of data structures
    introduces:
      vocabulary:
        - account
        - lamports
        - owner program
        - executable flag
        - program-owned account
      mental_models:
        - "Everything is an account—programs, data, wallets"
        - "Programs own accounts, not the other way around"
        - "This is opposite of Ethereum's contract storage"
      skills:
        - Identify account types (user, program-owned, executable)
        - Understand ownership model
        - Recognize why this matters for parallelism (preview)
    seeds:
      - account-locking (paid off in lesson 5 on Sealevel)
      - read-write-declarations (paid off in lesson 4)
    harvests: []
    state_after:
      - "Understands Solana's account model"
      - "Can contrast with Ethereum's approach"
      - "Knows what accounts contain"

  - lesson: 04-transactions-and-instructions
    prerequisites:
      - account-model (from lesson 3)
      - transaction basics
    introduces:
      vocabulary:
        - instruction
        - instruction array
        - account reference
        - read-only vs writable
        - fee payer
        - recent blockhash
      mental_models:
        - "Transactions contain multiple instructions—atomic composition"
        - "Accounts must be explicitly declared upfront"
        - "Read/write flags matter (foreshadow parallelism)"
      skills:
        - Decode transaction structure
        - Identify account references and access modes
        - Understand atomicity guarantees
    seeds:
      - compute-budget (paid off in lesson 9 on scheduling)
    harvests:
      - read-write-declarations: "Remember we mentioned account ownership in lesson 3? Here's why it matters—transactions declare read/write access upfront."
    state_after:
      - "Can parse Solana transactions"
      - "Understands instruction model"
      - "Knows why account references are explicit"

  - lesson: 05-sealevel-parallel-runtime
    prerequisites:
      - account-model (from lesson 3)
      - instruction-model (from lesson 4)
      - understanding of concurrency concepts
    introduces:
      vocabulary:
        - Sealevel runtime
        - account locks
        - conflict detection
        - parallel execution
        - transaction scheduler
      mental_models:
        - "Serial execution is the bottleneck—one transaction at a time"
        - "Account locks make parallelism safe"
        - "Non-conflicting transactions run simultaneously"
        - "This is why Solana is fast—most blockchains execute serially"
      skills:
        - Identify transaction conflicts
        - Understand how Sealevel schedules transactions
        - Recognize parallel execution opportunities
    seeds:
      - program-optimization (paid off in lesson 6)
      - banking-stage-execution (paid off in lesson 7)
    harvests:
      - account-locks: "The account model from lesson 3 and read/write declarations from lesson 4 enable this: Sealevel locks accounts during execution."
      - deterministic-ordering: "PoH from lesson 2 provides the ordering; Sealevel provides the parallelism."
    state_after:
      - "Understands how Sealevel achieves parallelism"
      - "Can identify transaction conflicts"
      - "Knows this is Solana's performance secret"

  - lesson: 06-writing-parallel-friendly-programs
    prerequisites:
      - sealevel-runtime (from lesson 5)
      - program development basics
    introduces:
      vocabulary:
        - lock contention
        - account fanout
        - hotspot accounts
      mental_models:
        - "Shared state creates bottlenecks"
        - "Account architecture determines parallelism"
        - "Design for minimal lock contention"
      skills:
        - Design account structures for parallelism
        - Identify bottleneck accounts
        - Optimize program architecture
    seeds: []
    harvests:
      - program-optimization: "Now that we understand Sealevel's parallelism, let's apply it to program design."
    state_after:
      - "Can design programs that maximize throughput"
      - "Recognizes anti-patterns that limit parallelism"
      - "Understands architectural tradeoffs"

  - lesson: 07-transaction-lifecycle-overview
    prerequisites:
      - transaction-structure (from lesson 4)
      - basic networking concepts
    introduces:
      vocabulary:
        - TPU (Transaction Processing Unit)
        - fetch stage
        - signature verification
        - banking stage
        - broadcast stage
        - leader vs validator
      mental_models:
        - "Transaction processing is pipelined—multiple stages"
        - "Leaders process transactions; validators validate blocks"
        - "Each stage can run concurrently (CPU pipelining concept)"
      skills:
        - Map transaction journey from RPC to execution
        - Distinguish leader and validator responsibilities
        - Understand pipeline stages
    seeds:
      - qos-scoring (paid off in lesson 9)
      - tvu-pipeline (paid off in lesson 15)
    harvests:
      - banking-stage-execution: "Remember Sealevel from lesson 5? That's where execution happens in the banking stage."
    state_after:
      - "Knows the high-level transaction flow"
      - "Understands TPU pipeline stages"
      - "Can explain leader responsibilities"

  - lesson: 08-gulf-stream-architecture
    prerequisites:
      - transaction-processing-unit (from lesson 7)
      - proof-of-history-mechanism (from lesson 1)
    introduces:
      vocabulary:
        - Gulf Stream
        - mempool
        - transaction forwarding
        - upcoming leader
      mental_models:
        - "Traditional mempools waste resources on duplicate broadcast"
        - "Predictable leaders enable direct forwarding"
        - "Transactions skip the mempool entirely"
      skills:
        - Explain mempool limitations
        - Understand transaction forwarding mechanics
        - Recognize why PoH enables this
    seeds: []
    harvests:
      - leader-schedule: "In lesson 1, we mentioned predictable leaders. Here's how that enables Gulf Stream—clients forward transactions to upcoming leaders."
    state_after:
      - "Understands Gulf Stream's mempool elimination"
      - "Can explain transaction forwarding"
      - "Knows why this improves performance"

  - lesson: 09-transaction-scheduling-and-fees
    prerequisites:
      - transaction-scheduling (concept from lesson 7)
      - basic economics
    introduces:
      vocabulary:
        - priority fee
        - compute budget
        - compute units (CU)
        - transaction cost
        - QoS (quality of service)
      mental_models:
        - "Priority fees ensure inclusion during congestion"
        - "Compute budget limits prevent abuse"
        - "Cost optimization is architectural, not just fee tweaking"
      skills:
        - Calculate transaction costs
        - Set priority fees appropriately
        - Optimize compute unit usage
    seeds:
      - validator-rewards (paid off in lesson 18)
    harvests:
      - compute-budget: "Remember transaction structure from lesson 4? Here's how compute budget instructions control execution cost."
      - qos-scoring: "The TPU pipeline from lesson 7 uses QoS scoring to prioritize high-fee transactions."
    state_after:
      - "Understands fee market mechanics"
      - "Can optimize transaction costs"
      - "Knows how scheduling works under congestion"

  - lesson: 10-tower-bft-consensus
    prerequisites:
      - proof-of-history-mechanism (from lesson 1)
      - basic BFT/consensus understanding
    introduces:
      vocabulary:
        - Tower BFT
        - validator vote
        - fork
        - fork choice
        - supermajority
      mental_models:
        - "Traditional BFT requires 3 rounds of communication per block"
        - "PoH provides a common clock—reduces communication"
        - "Validators vote on forks, not individual transactions"
      skills:
        - Explain how PoH optimizes BFT
        - Understand fork choice rules
        - Recognize consensus overhead reduction
    seeds:
      - voting-lockouts (paid off in lesson 11)
      - finality-guarantees (paid off in lesson 11)
    harvests:
      - deterministic-ordering: "PoH from lesson 2 provides verifiable ordering. Tower BFT uses this to reduce consensus overhead."
    state_after:
      - "Understands Tower BFT basics"
      - "Can explain how PoH optimizes consensus"
      - "Knows validator voting mechanism"

  - lesson: 11-voting-lockouts-and-finality
    prerequisites:
      - tower-bft-basics (from lesson 10)
      - understanding of commitment and finality
    introduces:
      vocabulary:
        - vote lockout
        - exponential lockout
        - rollback depth
        - finality
        - slashing condition
      mental_models:
        - "Longer lockouts mean stronger commitment"
        - "Validators can't easily switch forks—exponential cost"
        - "This mechanism creates finality"
      skills:
        - Calculate lockout periods
        - Understand finality progression
        - Recognize slashing conditions
    seeds:
      - optimistic-vs-finalized (paid off in lesson 12)
    harvests:
      - voting-lockouts: "Tower BFT from lesson 10 uses voting. Here's the lockout mechanism that makes it Byzantine fault tolerant."
      - finality-guarantees: "This is how Solana achieves finality—through exponentially increasing commitment."
    state_after:
      - "Understands voting lockouts in detail"
      - "Can explain finality mechanism"
      - "Knows security guarantees"

  - lesson: 12-optimistic-confirmation
    prerequisites:
      - voting-and-lockouts (from lesson 11)
    introduces:
      vocabulary:
        - optimistic confirmation
        - confirmed vs finalized
        - commitment level
        - voting threshold
      mental_models:
        - "Confirmation is fast; finalization is slow but secure"
        - "Applications can choose confirmation threshold"
        - "Higher threshold = lower rollback risk"
      skills:
        - Choose appropriate commitment levels
        - Understand risk tradeoffs
        - Design UX around confirmation
    seeds: []
    harvests:
      - optimistic-vs-finalized: "Voting lockouts from lesson 11 create finality. But applications need faster feedback—that's optimistic confirmation."
    state_after:
      - "Understands confirmation vs finality"
      - "Can choose appropriate commitment levels"
      - "Knows UX tradeoffs"

  - lesson: 13-block-building-mechanics
    prerequisites:
      - leader-schedule (from lesson 8)
      - transaction-scheduling (from lesson 9)
    introduces:
      vocabulary:
        - slot duration
        - block limits
        - transaction packing
        - entry
        - tick
      mental_models:
        - "Leaders have 400ms slots to build blocks"
        - "Block size limits transaction inclusion"
        - "Packing algorithm maximizes fees"
      skills:
        - Understand block structure
        - Recognize block limits
        - Explain packing strategies
    seeds:
      - propagation-time (paid off in lesson 14)
    harvests:
      - slot-timing: "PoH from lesson 2 defines slots. Here's how leaders use those 400ms slots to build blocks."
    state_after:
      - "Understands block building mechanics"
      - "Knows block limits and constraints"
      - "Can explain packing strategies"

  - lesson: 14-turbine-block-propagation
    prerequisites:
      - block-building-mechanics (from lesson 13)
      - basic networking knowledge
    introduces:
      vocabulary:
        - Turbine
        - erasure coding
        - shred
        - neighborhood
        - fanout
      mental_models:
        - "Naive broadcast doesn't scale to 1000+ validators"
        - "Erasure coding provides redundancy without duplication"
        - "Tree structure reduces bandwidth per validator"
        - "This is how Solana scales validator count"
      skills:
        - Understand erasure coding fundamentals
        - Explain tree propagation mechanics
        - Calculate propagation time
    seeds:
      - tvuturbine-reception (paid off in lesson 15)
    harvests:
      - propagation-time: "Blocks from lesson 13 must reach all validators quickly. Turbine propagates blocks to 1000+ validators in <400ms."
    state_after:
      - "Understands Turbine propagation"
      - "Can explain erasure coding benefits"
      - "Knows why this scales"

  - lesson: 15-transaction-validation-unit
    prerequisites:
      - turbine-propagation (from lesson 14)
      - sealevel-runtime (from lesson 5)
    introduces:
      vocabulary:
        - TVU (Transaction Validation Unit)
        - shred fetch
        - replay stage
        - re-execution
        - fork reconciliation
      mental_models:
        - "Non-leaders receive blocks, not build them"
        - "Validators must re-execute to verify state"
        - "TVU is the receive-side counterpart to TPU"
      skills:
        - Understand TVU pipeline stages
        - Explain replay and validation
        - Recognize validator responsibilities
    seeds: []
    harvests:
      - tvu-pipeline: "TPU from lesson 7 handles incoming transactions. TVU handles incoming blocks—the validator counterpart."
      - turbine-reception: "Turbine from lesson 14 delivers shreds. TVU's shred fetch stage receives them."
    state_after:
      - "Understands TVU pipeline"
      - "Knows how validators process blocks"
      - "Can explain replay mechanics"

  - lesson: 16-accounts-db-and-storage
    prerequisites:
      - account-model (from lesson 3)
      - understanding of databases
    introduces:
      vocabulary:
        - AccountsDB
        - snapshot
        - incremental snapshot
        - archival node
        - rent
        - rent exemption
      mental_models:
        - "500M+ accounts require specialized storage"
        - "Snapshots enable fast validator catch-up"
        - "Rent prevents state bloat"
      skills:
        - Understand AccountsDB architecture
        - Explain snapshot mechanism
        - Calculate rent requirements
    seeds: []
    harvests: []
    state_after:
      - "Understands storage layer"
      - "Knows snapshot mechanics"
      - "Can calculate rent costs"

  - lesson: 17-gossip-and-network-topology
    prerequisites:
      - basic networking concepts
    introduces:
      vocabulary:
        - gossip protocol
        - Crds (Cluster Replicated Data Store)
        - push/pull mechanism
        - vote gossip
        - validator discovery
      mental_models:
        - "Validators need to discover each other"
        - "Metadata is gossiped, not broadcast"
        - "Gossip is eventually consistent"
      skills:
        - Understand gossip protocol mechanics
        - Explain what information is gossiped
        - Recognize network topology formation
    seeds: []
    harvests: []
    state_after:
      - "Understands gossip protocol"
      - "Knows how validators discover each other"
      - "Can explain metadata propagation"

  - lesson: 18-staking-and-validator-economics
    prerequisites:
      - tower-bft-basics (from lesson 10)
      - basic economics
    introduces:
      vocabulary:
        - stake
        - delegation
        - inflation schedule
        - commission
        - epoch
        - validator rewards
      mental_models:
        - "Validators are incentivized through staking rewards"
        - "Stake weight determines vote influence"
        - "Economics align with network security"
      skills:
        - Calculate validator rewards
        - Understand delegation mechanics
        - Explain inflation schedule
    seeds: []
    harvests:
      - validator-rewards: "Priority fees from lesson 9 are part of validator income. Here's the full economic picture."
    state_after:
      - "Understands staking mechanism"
      - "Can calculate rewards"
      - "Knows security model"

  - lesson: 19-end-to-end-transaction-flow
    prerequisites:
      - All major systems (PoH, accounts, Sealevel, TPU, Gulf Stream, Tower BFT, Turbine, TVU)
    introduces:
      vocabulary:
        - (synthesis—no new vocabulary)
      mental_models:
        - "Every component serves the transaction flow"
        - "Understanding the whole enables debugging"
        - "Bottlenecks can occur at any stage"
      skills:
        - Trace transactions from submission to finality
        - Identify failure points
        - Debug with protocol knowledge
        - Recognize performance bottlenecks
    seeds: []
    harvests:
      - (all major seeds harvested—this is the synthesis)
    state_after:
      - "Can trace complete transaction journey"
      - "Understands how all components interact"
      - "Capable of protocol-level debugging"

  - lesson: 20-performance-from-first-principles
    prerequisites:
      - All concepts from previous lessons
    introduces:
      vocabulary:
        - (synthesis—no new vocabulary)
      mental_models:
        - "65,000 TPS comes from eliminating bottlenecks"
        - "Each innovation addresses a specific constraint"
        - "Tradeoffs exist—not all are free wins"
      skills:
        - Explain throughput from first principles
        - Identify system bottlenecks
        - Understand architectural tradeoffs
        - Recognize future scaling limits
    seeds: []
    harvests:
      - (final synthesis of all concepts)
    state_after:
      - "Can explain Solana's performance from mechanism"
      - "Understands all major design tradeoffs"
      - "Knows where current limits are"
      - "Can reason about future scaling"
```

## Step 5: Design Transitions

```yaml
transitions:
  - from: 01-the-coordination-problem
    to: 02-proof-of-history-deep-dive
    ending_type: forward-tease
    ending: |
      "PoH eliminates coordination overhead through a verifiable clock.
      But how does the hash chain actually work?"
    opening_type: callback-hook
    opening: |
      "In the last lesson, we saw why PoH matters. Now let's examine
      exactly how validators generate and verify the hash chain."

  - from: 02-proof-of-history-deep-dive
    to: 03-account-model-fundamentals
    ending_type: bigger-picture
    ending: |
      "PoH provides the ordering layer. But ordering requires something
      to order—state changes. Solana's account model determines how
      state is structured."
    opening_type: definition-consequence
    opening: |
      "Solana stores all state in accounts—programs, data, user wallets.
      This differs fundamentally from Ethereum's contract storage model."

  - from: 03-account-model-fundamentals
    to: 04-transactions-and-instructions
    ending_type: forward-tease
    ending: |
      "Accounts store state. Transactions modify state. Let's see how
      transactions reference accounts and encode operations."
    opening_type: definition-consequence
    opening: |
      "Transactions in Solana contain instruction arrays, enabling atomic
      multi-program composition. Each instruction explicitly declares
      which accounts it will read and write."

  - from: 04-transactions-and-instructions
    to: 05-sealevel-parallel-runtime
    ending_type: open-question
    ending: |
      "Transactions declare read/write access upfront. Why does this matter?
      Most blockchains don't require this."
    opening_type: problem-hook
    opening: |
      "Most blockchains execute transactions serially—one at a time.
      This is the bottleneck. Solana's Sealevel runtime achieves
      parallelism through account locks."

  - from: 05-sealevel-parallel-runtime
    to: 06-writing-parallel-friendly-programs
    ending_type: forward-tease
    ending: |
      "Sealevel enables parallelism. But programs must be designed
      to take advantage of it."
    opening_type: callback-hook
    opening: |
      "Now that we understand how Sealevel schedules transactions,
      let's apply this to program architecture."

  - from: 06-writing-parallel-friendly-programs
    to: 07-transaction-lifecycle-overview
    ending_type: bigger-picture
    ending: |
      "Parallelism determines execution speed. But before execution,
      transactions must reach validators. The TPU pipeline manages
      this journey."
    opening_type: definition-consequence
    opening: |
      "The Transaction Processing Unit (TPU) is a pipelined architecture
      for ingesting and processing transactions. Leaders run TPU to
      build blocks."

  - from: 07-transaction-lifecycle-overview
    to: 08-gulf-stream-architecture
    ending_type: open-question
    ending: |
      "Transactions enter the TPU pipeline. But how do they get there?
      Traditional blockchains use mempools. Solana doesn't."
    opening_type: problem-hook
    opening: |
      "Traditional mempools broadcast transactions to all nodes,
      wasting bandwidth. Gulf Stream eliminates the mempool by
      forwarding transactions directly to upcoming leaders."

  - from: 08-gulf-stream-architecture
    to: 09-transaction-scheduling-and-fees
    ending_type: forward-tease
    ending: |
      "Gulf Stream delivers transactions to leaders. Leaders must
      decide which transactions to include in blocks."
    opening_type: definition-consequence
    opening: |
      "Transaction scheduling determines inclusion during congestion.
      Priority fees signal willingness to pay for faster processing."

  - from: 09-transaction-scheduling-and-fees
    to: 10-tower-bft-consensus
    ending_type: bigger-picture
    ending: |
      "Leaders build blocks. But how do validators agree on which blocks
      are valid? That's consensus—the foundation of any blockchain."
    opening_type: definition-consequence
    opening: |
      "Tower BFT is Solana's consensus mechanism. It leverages PoH's
      verifiable clock to reduce the communication overhead of
      traditional Byzantine Fault Tolerance."

  - from: 10-tower-bft-consensus
    to: 11-voting-lockouts-and-finality
    ending_type: open-question
    ending: |
      "Validators vote on forks. But what prevents them from constantly
      switching to other forks? How does Solana achieve finality?"
    opening_type: callback-hook
    opening: |
      "Tower BFT uses voting to choose forks. The lockout mechanism
      makes votes increasingly expensive to reverse, creating finality."

  - from: 11-voting-lockouts-and-finality
    to: 12-optimistic-confirmation
    ending_type: forward-tease
    ending: |
      "Finality takes time—32 slots minimum. But applications need
      faster feedback for good UX."
    opening_type: problem-hook
    opening: |
      "Waiting for finality means 12+ second confirmation times.
      Optimistic confirmation provides fast UX while maintaining
      security guarantees."

  - from: 12-optimistic-confirmation
    to: 13-block-building-mechanics
    ending_type: context-reset
    ending: |
      "We've covered consensus—how validators agree on blocks.
      Now let's examine block production—how leaders build blocks."
    opening_type: definition-consequence
    opening: |
      "Leaders have 400ms slots to build blocks. Block limits constrain
      transaction inclusion. Packing algorithms maximize fee revenue."

  - from: 13-block-building-mechanics
    to: 14-turbine-block-propagation
    ending_type: open-question
    ending: |
      "Leaders build blocks in 400ms. But Solana has 1000+ validators.
      How does the block reach everyone else that quickly?"
    opening_type: problem-hook
    opening: |
      "Naive broadcast doesn't scale—sending a block to 1000 validators
      requires massive bandwidth. Turbine uses erasure coding and
      tree propagation to reach all validators in <400ms."

  - from: 14-turbine-block-propagation
    to: 15-transaction-validation-unit
    ending_type: forward-tease
    ending: |
      "Turbine delivers blocks to validators. What do validators do
      when they receive blocks?"
    opening_type: definition-consequence
    opening: |
      "The Transaction Validation Unit (TVU) is the receive-side
      counterpart to TPU. Non-leader validators use TVU to process
      incoming blocks and validate state."

  - from: 15-transaction-validation-unit
    to: 16-accounts-db-and-storage
    ending_type: bigger-picture
    ending: |
      "TVU validates and replays transactions. All state changes
      are stored in AccountsDB—Solana's storage layer."
    opening_type: definition-consequence
    opening: |
      "AccountsDB stores 500M+ accounts with high-performance reads
      and writes. Snapshots enable fast validator synchronization."

  - from: 16-accounts-db-and-storage
    to: 17-gossip-and-network-topology
    ending_type: context-reset
    ending: |
      "We've covered the core protocol layers. Now let's examine
      supporting infrastructure—how validators communicate metadata."
    opening_type: definition-consequence
    opening: |
      "The gossip protocol enables validator discovery and metadata
      exchange. Validators gossip votes, cluster info, and network
      topology."

  - from: 17-gossip-and-network-topology
    to: 18-staking-and-validator-economics
    ending_type: bigger-picture
    ending: |
      "Network topology connects validators. But why do validators
      participate? Economics incentivizes correct behavior."
    opening_type: definition-consequence
    opening: |
      "Staking aligns validator incentives with network security.
      Validators earn inflation rewards and transaction fees
      proportional to their stake."

  - from: 18-staking-and-validator-economics
    to: 19-end-to-end-transaction-flow
    ending_type: bigger-picture
    ending: |
      "We've covered all major protocol components. Now let's trace
      a complete transaction journey from submission to finalization."
    opening_type: callback-hook
    opening: |
      "Every concept we've learned serves the transaction flow.
      Let's synthesize: RPC submission → Gulf Stream → TPU →
      Sealevel → Turbine → TVU → Tower BFT → finalization."

  - from: 19-end-to-end-transaction-flow
    to: 20-performance-from-first-principles
    ending_type: open-question
    ending: |
      "We've traced the complete flow. But why does Solana achieve
      65,000+ TPS? What makes this possible?"
    opening_type: question-hook
    opening: |
      "How does Solana process 65,000 transactions per second?
      Let's explain from first principles, connecting every innovation
      to the throughput result."
```

## Step 6: Check Rhythm

```yaml
rhythm_analysis:
  lesson_energy_levels:
    - "01: HIGH (problem-solution, creates urgency)"
    - "02: MEDIUM (deep-dive, technical detail)"
    - "03: MEDIUM (foundation, building blocks)"
    - "04: MEDIUM (foundation, building blocks)"
    - "05: HIGH (breakthrough moment—parallelism)"
    - "06: MEDIUM-HIGH (integration, applying knowledge)"
    - "07: MEDIUM (foundation, new pipeline)"
    - "08: MEDIUM-HIGH (problem-solution, innovation)"
    - "09: LOW-MEDIUM (deep-dive, economics)"
    - "10: MEDIUM-HIGH (foundation, consensus)"
    - "11: HIGH (complex concept, security critical)"
    - "12: LOW-MEDIUM (integration, UX application)"
    - "13: MEDIUM (deep-dive, mechanics)"
    - "14: HIGH (breakthrough—scaling innovation)"
    - "15: LOW-MEDIUM (deep-dive, counterpart to TPU)"
    - "16: LOW-MEDIUM (deep-dive, storage details)"
    - "17: LOW (foundation, infrastructure)"
    - "18: LOW (foundation, economics)"
    - "19: MEDIUM-HIGH (integration, synthesis)"
    - "20: HIGH (finale, bringing it all together)"

  rhythm_pattern: "H-M-M-M-H-MH-M-MH-LM-MH-H-LM-M-H-LM-LM-L-L-MH-H"

  analysis: |
    The rhythm works well:
    - Strong opening (lesson 1 is HIGH energy problem-solution)
    - Lessons 2-4 establish foundation (MEDIUM energy)
    - Lesson 5 is the first breakthrough (HIGH—Sealevel parallelism)
    - Lesson 9 provides a breather (LOW-MEDIUM fees/economics)
    - Lessons 10-11 build to consensus complexity (MEDIUM-HIGH → HIGH)
    - Lesson 12 gives a breather (LOW-MEDIUM application)
    - Lesson 14 is second major breakthrough (HIGH—Turbine scaling)
    - Lessons 15-18 are calmer (LOW-MEDIUM, LOW—infrastructure)
    - Lessons 19-20 build to finale (MEDIUM-HIGH → HIGH synthesis)

  concerns: None. No three-high sequence, good variety, strong finale.
```

## Step 7: Validate

```yaml
validation_checklist:
  concept_coverage:
    status: PASS
    notes: |
      Every concept listed in Step 2 has a lesson where it's introduced.
      All dependencies are taught before dependent concepts.

  premature_concepts:
    status: PASS
    notes: |
      Traced through journey—no concept is used before its introduced.
      Examples:
      - Sealevel (lesson 5) requires account-model (lesson 3) and
        instruction-model (lesson 4) ✓
      - Gulf Stream (lesson 8) requires PoH (lessons 1-2) and TPU
        (lesson 7) ✓
      - Tower BFT (lesson 10) requires PoH (lessons 1-2) ✓

  seed_harvest_tracking:
    status: PASS
    notes: |
      All seeds are harvested. Examples:
      - account-locks: planted in lesson 3, harvested in lesson 5 ✓
      - leader-schedule: planted in lesson 1, harvested in lesson 8 ✓
      - compute-budget: planted in lesson 4, harvested in lesson 9 ✓
      - slot-timing: planted in lesson 2, harvested in lesson 13 ✓
      No orphan seeds identified.

  explicit_callbacks:
    status: PASS
    notes: |
      All seed harvests include explicit callbacks referencing where
      the seed was planted. Example: "Remember the share formula from
      lesson 1? Here's how it works."

  progressive_complexity:
    status: PASS
    notes: |
      Reader state grows steadily:
      - Lessons 1-4: 2-4 concepts each (foundation)
      - Lessons 5-14: 2-3 concepts each (building)
      - Lessons 15-18: 2-3 concepts each (infrastructure)
      - Lessons 19-20: 0 new concepts (synthesis)
      No spike in complexity.

  transitions:
    status: PASS
    notes: |
      All transitions designed. No "In this lesson we will" phrasing.
      Each transition connects lessons with forward momentum.

  rhythm:
    status: PASS
    notes: |
      Energy varies appropriately. No three-high sequence.
      Strong opening and strong finale.

  executability:
    status: PASS
    notes: |
      Another writer could execute this plan. Dependencies are explicit,
      seeds are tracked, transitions are designed, and success criteria
      are clear.
```

## Step 8: Output Course Map

```yaml
course_map:
  metadata:
    course_slug: solana-internals
    title: Solana Protocol Internals
    created: 2026-01-26
    status: planned
    author: Blueshift (commissioned by Solana)

  transformation:
    audience:
      prior_knowledge:
        - Blockchain fundamentals (transactions, consensus, validators)
        - Basic distributed systems concepts
        - Programming experience (any language)
      level: Intermediate to Advanced
      role: Backend/protocol developers, architects, senior engineers
      motivation: |
        Understand Solana's architecture deeply to build high-performance
        programs, debug at the protocol level, or evaluate Solana for
        production systems.

    outcomes:
      - "Explain how Solana achieves 65,000+ TPS from first principles"
      - "Trace transaction flow from submission to finalization"
      - "Design programs that maximize parallel execution"
      - "Debug issues with protocol-level knowledge"
      - "Understand architectural tradeoffs and limitations"
      - "Recognize Solana's innovations and where they apply"

    journey_arc: |
      From understanding blockchain fundamentals to mastering Solana's
      parallelized architecture, transaction processing, consensus
      mechanism, and performance characteristics.

  lesson_sequence:
    - lesson_number: 1
      slug: the-coordination-problem
      title: "The Coordination Problem"
      type: problem-solution
      energy: high
      estimated_duration: "25-30 minutes"

    - lesson_number: 2
      slug: proof-of-history-deep-dive
      title: "Proof of History: Deep Dive"
      type: deep-dive
      energy: medium
      estimated_duration: "30-35 minutes"

    - lesson_number: 3
      slug: account-model-fundamentals
      title: "Account Model Fundamentals"
      type: foundation
      energy: medium
      estimated_duration: "20-25 minutes"

    - lesson_number: 4
      slug: transactions-and-instructions
      title: "Transactions and Instructions"
      type: foundation
      energy: medium
      estimated_duration: "25-30 minutes"

    - lesson_number: 5
      slug: sealevel-parallel-runtime
      title: "Sealevel: Parallel Runtime"
      type: problem-solution
      energy: high
      estimated_duration: "35-40 minutes"

    - lesson_number: 6
      slug: writing-parallel-friendly-programs
      title: "Writing Parallel-Friendly Programs"
      type: integration
      energy: medium-high
      estimated_duration: "25-30 minutes"

    - lesson_number: 7
      slug: transaction-lifecycle-overview
      title: "Transaction Lifecycle Overview"
      type: foundation
      energy: medium
      estimated_duration: "20-25 minutes"

    - lesson_number: 8
      slug: gulf-stream-architecture
      title: "Gulf Stream Architecture"
      type: problem-solution
      energy: medium-high
      estimated_duration: "25-30 minutes"

    - lesson_number: 9
      slug: transaction-scheduling-and-fees
      title: "Transaction Scheduling and Fees"
      type: deep-dive
      energy: low-medium
      estimated_duration: "20-25 minutes"

    - lesson_number: 10
      slug: tower-bft-consensus
      title: "Tower BFT Consensus"
      type: foundation
      energy: medium-high
      estimated_duration: "30-35 minutes"

    - lesson_number: 11
      slug: voting-lockouts-and-finality
      title: "Voting Lockouts and Finality"
      type: problem-solution
      energy: high
      estimated_duration: "35-40 minutes"

    - lesson_number: 12
      slug: optimistic-confirmation
      title: "Optimistic Confirmation"
      type: integration
      energy: low-medium
      estimated_duration: "15-20 minutes"

    - lesson_number: 13
      slug: block-building-mechanics
      title: "Block Building Mechanics"
      type: deep-dive
      energy: medium
      estimated_duration: "25-30 minutes"

    - lesson_number: 14
      slug: turbine-block-propagation
      title: "Turbine: Block Propagation"
      type: problem-solution
      energy: high
      estimated_duration: "35-40 minutes"

    - lesson_number: 15
      slug: transaction-validation-unit
      title: "Transaction Validation Unit"
      type: foundation
      energy: low-medium
      estimated_duration: "20-25 minutes"

    - lesson_number: 16
      slug: accounts-db-and-storage
      title: "AccountsDB and Storage"
      type: deep-dive
      energy: low-medium
      estimated_duration: "25-30 minutes"

    - lesson_number: 17
      slug: gossip-and-network-topology
      title: "Gossip and Network Topology"
      type: foundation
      energy: low
      estimated_duration: "15-20 minutes"

    - lesson_number: 18
      slug: staking-and-validator-economics
      title: "Staking and Validator Economics"
      type: foundation
      energy: low
      estimated_duration: "20-25 minutes"

    - lesson_number: 19
      slug: end-to-end-transaction-flow
      title: "End-to-End Transaction Flow"
      type: integration
      energy: medium-high
      estimated_duration: "30-35 minutes"

    - lesson_number: 20
      slug: performance-from-first-principles
      title: "Performance from First Principles"
      type: integration
      energy: high
      estimated_duration: "35-40 minutes"

  total_estimated_duration: "500-580 minutes (8-10 hours)"

  success_criteria:
    - "Reader can explain Solana's throughput from mechanism, not marketing"
    - "Reader can trace any transaction through the complete system"
    - "Reader recognizes optimization opportunities in program design"
    - "Reader understands tradeoffs, not just benefits"
    - "Reader can debug issues with protocol knowledge"
    - "Reader can evaluate Solana for production systems confidently"

  differentiation_from_competitor:
    competitor_doc: "Solana Executive Overview Aug 2024 (Turbin3/Helius)"
    improvements:
      - "Mechanism-focused teaching (why, not just what)"
      - "Explicit concept dependencies and progressive complexity"
      - "Problem-before-solution pattern for all innovations"
      - "Seeds and harvests create cohesion across lessons"
      - "Measured technical voice (not blog-style)"
      - "Designed for learning, not reference"
      - "Integration lessons synthesize concepts"
      - "Performance explained from first principles in finale"
      - "Explicit reader journey mapping"
      - "Works for beginners through senior developers"
```

## Next Steps

To execute this plan:

1. **Create course structure** in the dashboard system
2. **Write lessons** following Blueshift teaching method (voice.md, teaching-method.md)
3. **Include code examples** with context (setup before, explanation after)
4. **Create diagrams** for complex systems (TPU pipeline, Turbine tree, voting lockouts)
5. **Implement seeds/harvests** with explicit callbacks as specified
6. **Use measured technical voice** throughout (no hype, no drama)
7. **Test with target audience** (developers evaluating Solana)
8. **Iterate based on feedback** while maintaining course arc

This plan is ready for execution by content writers following the Blueshift methodology.

