---
title: "The model doesn't get the last word"
summary: 'A language model writes the verdict in my prior-art CLI. It is structurally incapable of telling me the coast is clear when it is not — and that guarantee lives in the type system, not the prompt.'
order: 1
published: 2026-08-01
---

I maintain a Rust CLI called `patent` that answers one question: has someone already built this? You hand it an idea, it queries a set of package registries and archives, embeds everything locally, and ranks the results by cosine similarity. Then a language model reads the top matches and writes the verdict — a saturation level and a one-line headline.

That last step is the dangerous one, and it took me a while to admit why.

## The failure mode nobody catches

A tool like this fails silently in exactly one direction. If it tells you a space is crowded when it isn't, you go look, find nothing, and shrug. Ten seconds lost. If it tells you a space is **open** when it isn't, you spend a weekend building something that already exists — and you never learn the tool was wrong, because you never went looking.

Every incentive in a language model points at the second failure. Ask "is this idea novel?" and you have written a leading question. The model has read the same enthusiasm I brought to the prompt. It wants to be helpful. Helpful, here, means agreeing with me.

I could ask it not to. Early on I did — the prompt said, in the tone of someone who believes prompts are contracts, that it must not report an open space when close matches are present. It mostly complied. "Mostly" is the whole problem. A guarantee that holds most of the time isn't a guarantee, it's a tendency, and I had built a tool whose only real job was to be trustworthy when it disagreed with me.

## Moving the invariant out of the prompt

The fix was to stop asking. The verdict has three levels:

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum Saturation {
    Open,       // nothing close found in the sources checked
    Crowded,    // a few adjacent things exist
    Saturated,  // the space is densely populated
}
```

The `Ord` in that derive list is not decoration. Rust orders enum variants by declaration order, so `Open < Crowded < Saturated` — the ordering is _severity_. That one trait is what makes the next twelve lines possible:

```rust
fn floor_level(model_level: Saturation, matches: &[Match]) -> Saturation {
    let strong = matches.iter().filter(|m| m.similarity >= 0.60).count();
    let close = matches.iter().filter(|m| m.similarity >= 0.55).count();
    // A single near-identical match (>= 0.70) already means the space isn't open.
    let very_strong = matches.iter().filter(|m| m.similarity >= 0.70).count();
    let data_level = if strong >= 5 {
        Saturation::Saturated
    } else if close >= 2 || very_strong >= 1 {
        Saturation::Crowded
    } else {
        Saturation::Open
    };
    model_level.max(data_level)
}
```

The embeddings compute their own verdict, independently, from nothing but similarity counts. Then `.max()` takes the more severe of the two.

That call is the entire design. It is deliberately asymmetric: the model can _raise_ the level — it read the actual match text, and it may notice that five superficially-similar hits are all solving a different problem — but it cannot lower it. If the embeddings say `Crowded` and the model says `Open`, the answer is `Crowded`. Not because the model was overruled by a special case, but because `max` does not have a branch where the smaller value wins.

## Distrust propagates

There's a second consequence I didn't anticipate when I wrote it. If flooring changed the level, the model was wrong about the shape of the space — so its prose is suspect too:

```rust
// Floor the level against the data. If that raises it, the model misjudged
// the space, so we don't trust its headline either — derive a safe one.
let level = floor_level(model_level, matches);
let headline = if level != model_level {
    data_headline(level, matches)
} else {
    raw_headline
};
```

The model's sentence is discarded and replaced with one generated from the match data. A model that misjudged the verdict does not get to keep writing the summary.

Two more guards sit downstream of that, because the failure is worth over-defending: one replaces any headline containing a phrase like "no direct match" whenever a close match actually exists, and one catches the case where the level legitimately stayed `Open` but a real 0.55+ match is sitting right there — a technically-correct level with a misleading sentence attached to it. The comment above the first of them is the thesis of the whole file:

> the prompt asks the model to comply, but we never _rely_ on it.

## Why this shape generalizes

The levels map to exit codes — `Open` is 0, `Crowded` is 1, `Saturated` is 2 — so the thing is usable as a CI gate. Which is exactly the case where "mostly complies" becomes unacceptable. A pipeline that fails a build on the model's mood is worse than no pipeline.

The general pattern is this: when you put a language model inside a system, find the one claim where a wrong answer is expensive and silent. Then make that claim structurally unavailable to the model. Not discouraged in the prompt — unavailable, in the sense that no output it can produce leads there.

Prompt instructions are requests. Types are guarantees. `patent` still lets a model write the words, because it is genuinely better at reading a match list than my heuristics are. It just doesn't get the last word on the number that matters.

The thresholds in that function — 0.55, 0.60, 0.70, and the counts beside them — are judgment calls, tuned by hand against results I checked myself. They are not derived from anything. That's the honest caveat: I moved the decision out of a place where I couldn't inspect it into a place where I can, which is an improvement in auditability before it is an improvement in accuracy. But it's twelve lines I can read, argue with, and change on purpose. The prompt was none of those things.
