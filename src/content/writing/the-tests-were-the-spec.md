---
title: 'The tests were the spec'
summary: 'A developer in Germany ported my prior-art CLI from Rust to Go in 23 hours, using its test suite as the specification. The port matched every verdict, and on the way it found five bugs I had shipped.'
order: 4
published: 2026-11-03
---

On 3 November 2026 an email arrived from Martin Czygan in Leipzig. He had ported `patent`, my prior-art search CLI, to Go, called it [silt](https://github.com/miku/silt), and given a lightning talk about it at [Leipzig Gophers #61](https://golangleipzig.space/posts/meetup-61-wrapup/) on 27 October.

I had no idea any of this was happening. That is the quiet pleasure of the MIT license: someone can take the code, build on it, and tell you afterwards.

His [talk notes](https://github.com/miku/silt/tree/main/notes/2026-10-27-leipzig-gophers-61) are worth reading in full. Three things in them stuck with me.

## In a port, the spec already exists

Martin went from his first commit to v0.1.0 in 23 hours. He did not start from my README. He started from my tests: 397 of them by his count, and each one got a Go counterpart or a written reason why not.

One of his slides puts the difference in a table. Greenfield work is done "when it feels done." A port is done when there are "no unexplained differences."

To make "the same" checkable, he built a harness around the port: a Rust crate that links patent at a fixed commit and records its outputs (51 embeddings, 146 LLM replies), a recording HTTP transport so a live fan-out across the registries replays the same way every time, and a script that runs both binaries at the same moment on 33 ideas and compares them. Then he planted bugs in his own port to check that the tests caught them.

The result: 33 of 33 ideas get the same verdict level, and the similarity scores agree to within 8.9e-7, against a tolerance he set at 1e-3.

I wrote those tests to stop myself from breaking patent. I never thought of them as a specification a stranger could build against. They turned out to be the most portable thing in the repository.

## A port is also a code review

The slide I read twice lists what the port found in patent 0.14.1:

- A timestamp like `9999-12-31T23:00:00-02:00`: the offset pushes the date past year 9999, patent panics, and the whole run dies.
- Embedding batches are padded to the longest text, so a single 720-word description among 300 matches stretches ranking from 1.2 seconds to 17 or more.
- The fan-out iterates a Rust `HashSet`, so which duplicate survives deduplication changes from run to run.
- `is_whole_word("atat …", "at")` returns true.
- The README promises a model of about 80 MB. It is 91 MB.

My own tests missed all five, because my tests encode what I believed the code does. A second implementation held to the first one's outputs is a different kind of test. Two programs that are supposed to agree, run side by side, expose exactly the behaviour a reader skims past. The `HashSet` one is the clearest case: nobody finds nondeterministic deduplication by reading the code. You find it when you diff two outputs and something wobbles.

## The rule made it across

My earlier post, [The model doesn't get the last word](/writing/the-model-doesnt-get-the-last-word/), is about the one rule patent exists to keep: it can tell you a space is crowded, but it never claims nothing exists, only that nothing close turned up in the sources it checked.

Martin kept that rule without ever talking to me. His slide says it in one line: "silt can prove that something exists, but never that it doesn't." And he found a place where Go makes the rule harder to keep than Rust does. Rust refuses to decode JSON with a missing field; Go quietly fills in a zero value. Left alone, a registry changing its API would read as an empty result, which is to say, as "no prior art." He made the required fields pointers, so that drift reads as "not reached" instead.

That rule is the idea I care about most in the tool, and it survived a change of language in the hands of someone I had never met.

## What he built on top

silt is not a line-for-line copy. It runs the embedding model in pure Go, with no ONNX Runtime and no cgo, so it stays a single static binary: a hand-written tokenizer and forward pass, and 83 lines of AVX2 assembly for the matrix multiply. On his laptop it embeds 300 texts in under a second, slightly faster than patent does with ONNX Runtime. It also searches two sources patent does not, the Arch Linux repositories and Codeberg, and he is planning more, along with trying a different embedding model.

## What I am taking from it

Write the tests as if someone else will build against them, because someone might. And when they do, read what they found. Martin's port was the most thorough review patent has had, and I did not have to ask for it.

Thank you, Martin. Greetings back from Baku.
