# Anti-Patterns

Common mistakes to flag during review.

<mistakes>
## ❌ Mistakes to Flag

**Assuming Knowledge**
- "As we saw in the previous section..."
- "You already know that..."
- Starting with "We" without establishing context

**Solution Before Problem**
- "Zero-copy deserialization bypasses... This is useful for large accounts."
- Showing the fix before showing what breaks

**Vague Warnings**
- "Be careful with this!"
- "This is important!"
- "Make sure to handle errors"

**Over-Simplification**
- "Just add this line and it works!"
- "Simply call the function"
- Using "simply" or "just" anywhere

**No Stakes Opening**
- "This lesson covers X"
- "In this section we'll learn about Y"
- Starting with definition instead of why it matters

**Missing Trade-offs**
- "Use X" without explaining when NOT to use X
- "X is better" without explaining what you give up
- Presenting one approach as universally correct

**Abstract Before Concrete**
- Definition before relatable example
- Theory before practical scenario
- "X is a Y that does Z" as the opening

**Incomplete Code**
- `// ... rest of code`
- Missing imports
- Placeholder values without instructions
- Code that won't run if copy-pasted

**Passive Voice**
- "The account is created by..."
- "It can be seen that..."
- "The function is called"

**Vague Error References**
- "You might see an error"
- "This can cause problems"
- "Be aware of potential issues"
</mistakes>

<ai_tells>
## 🤖 AI Writing Tells

These patterns scream "AI wrote this":

**Marketing compression**
- "secure, efficient, and decentralized" (triple adjective structure)
- "powerful", "robust", "elegant" without explaining why
- Short sentences that summarize instead of explain

**Equal-weight syndrome**
- Every concept gets the same amount of space
- Marching through a checklist: one paragraph per item
- No dwelling on hard parts, no skipping obvious ones

**Artificial structure**
- "Key Takeaways" boxes
- "Security Checklist" at the end
- Numbered lists that should be prose
- Headers like "Learning Objectives" instead of just teaching

**Compression without depth**
- "This prevents inflation attacks" (what attack? how?)
- "Implements slippage protection" (what happens without it?)
- Summarizing when you should be explaining

**The dead giveaway:** If you could delete a sentence and lose no information, it's filler. AI loves filler.

</ai_tells>

<fixes>
## ✅ How to Fix Them

**Challenge, Don't Assume**
- "Most developers think accounts are just data containers."
- "You might expect this to work like Ethereum, but..."

**Problem Before Solution**
- "Solana's 4KB stack limit makes traditional deserialization impossible. Zero-copy solves this by..."
- Show the error first, then the fix

**Specific Warnings**
- "The init constraint is limited to 10,240 bytes due to CPI limitations."
- "This will fail silently if the account doesn't exist."

**Honest Complexity**
- "This requires understanding memory layout, but it's the only way to..."
- "The setup takes 5 steps, but each one is straightforward."

**Stakes First**
- "Without this check, anyone can drain your vault."
- "A single missing validation can cost millions."

**Trade-offs Clear**
- "Anchor adds compile time but eliminates entire vulnerability classes."
- "Zero-copy is faster but requires unsafe Rust knowledge."

**Concrete First**
- "Imagine you're building a game with 50KB player stats..."
- "Picture a vault that holds user funds..."

**Complete Code**
- Show all imports at top
- Provide working examples
- Note any setup requirements

**Active Voice**
- "You create the account by..."
- "The function returns..."
- "This check prevents..."

**Specific Errors**
- `Error: Stack offset of -30728 exceeded max offset of -4096`
- Include actual error messages developers will see
</fixes>

<expansion_examples>
## Expansion vs Compression

**Real expertise is knowing which parts deserve 3 sentences and which deserve 0.**

❌ **Compressed (AI-style):**
> "The MINIMUM_LIQUIDITY constant prevents inflation attacks by maintaining virtual LP tokens that dilute manipulation attempts."

✅ **Expanded (human-style):**
> "If we give ALL the LP tokens to the first depositor, an attacker could create a pool with tiny amounts (1 token each), receive 1 LP token, then donate a huge amount directly to the vault. Now each LP token is worth millions, and the next depositor's deposit might round down to 0 LP tokens.
>
> To prevent this, we subtract MINIMUM_LIQUIDITY from the first mint. These LP tokens are never given to anyone - they're burned virtually, diluting any such attack."

The second is longer but feels shorter because it's actually teaching something. The first sounds "efficient" but you learn nothing.

---

❌ **Compressed:**
> "We round up on deposits to protect the pool from rounding exploits."

✅ **Expanded:**
> "If we rounded down, users could deposit 9.09 worth of tokens but get 10 LP tokens. One transaction is negligible, but an attacker doing this thousands of times would slowly drain the pool. Rounding up means users always pay slightly more than the mathematical fair share."

---

❌ **Compressed:**
> "The min parameter provides slippage protection against sandwich attacks."

✅ **Expanded:**
> "Without the min parameter, you're vulnerable to sandwich attacks: an attacker sees your pending swap, front-runs to move the price, your swap executes at a worse rate, then they back-run to profit. With a tight min, their manipulation would cause your transaction to fail instead."

</expansion_examples>
