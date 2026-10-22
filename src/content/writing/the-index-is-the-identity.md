---
title: 'The index is the identity'
summary: 'Four streaming adapters in an LLM gateway had the same bug: the number saying which tool call a fragment belongs to came from the wrong place. Clients trust that number, so two calls became one and nothing errored.'
order: 3
published: 2026-10-22
---

I filed an issue against MLflow's AI Gateway: stream a response with two parallel tool calls through it and the client hands you back a single call whose arguments are both calls pasted together. The JSON doesn't parse. There's no error anywhere, every chunk is valid, and the status is 200.

Then I found the same bug in three more adapters, which is why this is a post and not a footnote in a PR.

## What the number is for

An OpenAI-style stream doesn't send a tool call in one piece. The first delta has the call's id and name, and then a run of deltas each carries a slice of the arguments string. Every one of them has an `index`, and the index is the only thing that says which call the slice belongs to. openai-python merges by it. So does LangChain. Same index, same call, append.

So if two calls come out with the same index, the client merges them, and that's the right thing for it to do. The gateway told it they were one call.

The gateway's job is to translate each provider's stream into that shape, and each provider has a different idea of what the number should be.

## The four

Anthropic streams content blocks, each with its own index. A text block is block 0, so the first tool call is block 1. The adapter used 0 for every tool call regardless, put the second call in `choices[1]`, and sent the finish event once per block. What the client needs is how many tool calls have started, and Anthropic's number also counts the text. The fix is a counter that only tool blocks advance:

```python
tool_indices: dict[int, int] = {}  # content block index -> tool call index

if resp["type"] == "content_block_start" and (
    resp["content_block"].get("type") == "tool_use"
):
    tool_indices[block_index] = len(tool_indices)
```

Gemini sends each call whole, in one part, so nothing to stitch. But every call got index 0, which means any two of them collided, in the same chunk or in different ones. It needs a count that runs across the whole stream.

LiteLLM was the silly one. Each chunk already carries the right index. The adapter threw it away and numbered the calls with `enumerate` inside the chunk. Interleave two calls across chunks and you get `[0, 0, 0, 0]` where `[0, 1, 1, 0]` is correct.

Bedrock used its content block index, same as Anthropic, so a sentence before a tool call pushed the first call to 1.

Different wrong numbers each time: the provider's block index, the position inside a chunk, a hardcoded 0. The right one is always the same, a count of tool calls kept for the length of the stream.

## Why nobody had seen it

With one tool call and no text in front of it, every one of those wrong numbers comes out as 0, which is correct by accident. Tests that exist pass. You need two parallel calls, or some prose before a call, and an agent loop does both all the time.

Neither side can catch it either. What the gateway emits is well-formed. What the client does with it is well-formed. The damage is in how they fit together, and each side's tests only look at itself.

My tests for the fixes are the boring kind: feed in two calls, assert the indices. On master they fail with `assert [1] == [0]`, which tells you exactly what's wrong without any debugging.

## What I'd check next time

Whenever I translate between two streaming formats now, I find the field that means identity and look up how the source format produces it, then what the target's clients assume about it. Here the source counted blocks and the target counted calls, and four adapters copied the integer across anyway.
