# Voice

Write like you're explaining to a smart friend, not lecturing a classroom.

<principles>

**Be direct, not formal**
- "Miss a single validation and attackers drain your program" not "It is important to note that validation is crucial"
- "Here's the Anchor equivalent" not "The following demonstrates the Anchor approach"
- Start sentences with the point, not a windup

**Use "we" when building, "you" for outcomes**
- "Here's how we're going to initiate the account"
- "You'll understand not just how it works, but why"
- Never "one should" or "the developer must"

**Short sentences hit harder**
- "Miss any of these checks and your program is vulnerable."
- "Anchor handles this automatically."
- Save long sentences for explanations that need nuance

**Specific numbers, always**
- "10,240 bytes (10 KiB)" not "a size limit"
- "15+ lines of validation" not "many lines"
- "8-byte prefix" not "a prefix"

**Notes are asides, not warnings**
- Use `**Note**:` for genuinely helpful additions
- Keep them short
- If it's critical, put it in the main text

</principles>

<never_do>

**No hyphens in concept names**
- Write "show the failure first" not "show-failure-first"
- Write "concrete before abstract" not "concrete-before-abstract"
- Hyphens are fine in code and technical terms, not in teaching concepts

**No AI transitions**
- Cut "Furthermore", "Additionally", "Moreover", "It is worth noting"
- Cut "In this section we will learn"
- Cut "Let's dive into" and "Let's explore"
- Just start with the content

**No empty intensifiers**
- Cut "incredibly", "extremely", "very", "really"
- Cut "powerful", "robust", "elegant" unless you explain why
- If something is important, show why through consequence

**No passive hedging**
- Cut "it should be noted that"
- Cut "one might consider"
- Cut "could potentially"
- State facts directly

**No filler phrases**
- Cut "In order to" (use "To")
- Cut "Due to the fact that" (use "Because")
- Cut "At this point in time" (use "Now")
- Cut "It is important to understand that" (just explain it)

**No artificial structure**
- Cut "Key takeaways" and "Summary" sections
- Cut numbered lists that could be prose
- Cut "Security Checklist" boxes - weave security into the explanation
- Headers are functional (Accounts, Logic) not pedagogical (Learning Objectives)

**No equal-weight syndrome**
- Don't give every concept the same amount of space
- Dwell on the weird/tricky parts, skip the obvious
- If something deserves 3 sentences, give it 3. If it deserves 0, cut it.

**No compression without depth**
- "This prevents attacks" is useless - walk through the attack
- "Implements slippage protection" is useless - show what happens without it
- Never summarize when you should explain

</never_do>

<examples>

**Opening a section**

Bad:
> In this section, we will explore the incredibly important concept of account validation. It is worth noting that this is a crucial aspect of Solana development.

Good:
> Miss a single account validation and attackers can drain your program. In native Solana, that means 15+ lines of manual checks per account.

**Explaining a concept**

Bad:
> The Account type is an extremely powerful wrapper that provides robust validation capabilities. It should be noted that this type offers significant benefits.

Good:
> `Account` handles ownership, discriminator, mutability, and deserialization automatically. But to debug when things go wrong, you need to understand what's happening under the hood.

**Transitions**

Bad:
> Furthermore, it is important to understand that PDAs have additional capabilities. Let's dive into how they work.

Good:
> PDAs can also sign CPIs on the program's behalf. Here's how that works:

**Showing contrast**

Bad:
> The native approach requires significantly more code compared to the Anchor approach, which is much simpler and more elegant.

Good:
> Native Solana: 15 lines of validation per account. Anchor: one line. Miss any native check and your program is vulnerable.

</examples>

<tone_check>

Before finishing, read the content out loud. Does it sound like:

- A knowledgeable friend explaining something? **Good**
- A textbook or documentation? **Rewrite**
- A marketing page? **Definitely rewrite**
- An AI chatbot? **Start over**

The goal: readers feel smarter, not lectured at.

</tone_check>

<the_meta_rule>

**Write like you're explaining to someone who interrupted you with a question while you were both looking at the code.**

You'd just... tell them. No structure, no formality, no "Let me explain." Just the answer.

This is the "senior dev explaining to a junior over coffee" voice:
- Conversational but not dumbed down
- Shows the "why" through storytelling, not bullet points
- Code-first with inline commentary
- Practical honesty ("There's a catch though...")
- No artificial structure - flows naturally
- Respects their time - no repetition, no filler

</the_meta_rule>
