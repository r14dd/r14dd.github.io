//! lab.rs — real Rust, compiled to WebAssembly, executed live in the /lab terminal.
//!
//! Build (committed artifact lives at public/lab/lab.wasm):
//!   rustc --edition 2021 --target wasm32-unknown-unknown \
//!         --crate-type cdylib -C opt-level=3 -C lto -C panic=abort \
//!         -o public/lab/lab.wasm wasm/lab.rs
//!
//! Every function below is a faithful slice of an actual project on the site —
//! nothing here is a toy. Type `src` in the lab terminal to read this file in place.

#![no_std]

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_: &PanicInfo) -> ! {
    loop {}
}

// ── QuorumRAG.rs ────────────────────────────────────────────────────────────
// Reciprocal Rank Fusion — the scoring core of the multi-retriever ensemble.
// A document's fused score is the sum of 1/(k + rank) across the retrievers
// that returned it. `rank` is 1-based; rank 0 means "this retriever did not
// return the document" and contributes nothing. k dampens the weight of low
// ranks (the canonical constant is 60).
#[no_mangle]
pub extern "C" fn rrf_term(k: i32, rank: i32) -> f64 {
    if rank <= 0 {
        0.0
    } else {
        1.0 / ((k + rank) as f64)
    }
}

// ── Distributed Hash Table (Kademlia) ───────────────────────────────────────
// XOR distance metric. Kademlia organizes the keyspace by the bitwise XOR of
// two 160-bit ids; here we expose the 32-bit kernel. XOR is a valid metric:
// d(x,x)=0, it is symmetric, and it satisfies the triangle inequality, which
// is exactly what makes O(log n) routing provably converge.
#[no_mangle]
pub extern "C" fn xor_distance(a: u32, b: u32) -> u32 {
    a ^ b
}

// Number of leading zero bits of an XOR distance == the shared-prefix length,
// i.e. which k-bucket a peer falls into relative to us.
#[no_mangle]
pub extern "C" fn bucket_index(a: u32, b: u32) -> u32 {
    (a ^ b).leading_zeros()
}

// ── Content addressing ──────────────────────────────────────────────────────
// FNV-1a, 32-bit. A static input buffer is exposed to JS via `input_ptr()`;
// the host writes UTF-8 bytes there, then calls `fnv1a32(len)`. This is the
// same "hash, then address by hash" idea behind the colophon's build id.
const FNV_OFFSET: u32 = 0x811c_9dc5;
const FNV_PRIME: u32 = 0x0100_0193;

static mut INPUT: [u8; 8192] = [0; 8192];

#[no_mangle]
pub extern "C" fn input_ptr() -> *const u8 {
    // Safe: single-threaded wasm, host writes then immediately reads.
    unsafe { INPUT.as_ptr() }
}

#[no_mangle]
pub extern "C" fn input_cap() -> u32 {
    8192
}

#[no_mangle]
pub extern "C" fn fnv1a32(len: u32) -> u32 {
    let n = if len as usize > 8192 { 8192 } else { len as usize };
    let mut hash = FNV_OFFSET;
    let mut i = 0usize;
    while i < n {
        let byte = unsafe { INPUT[i] };
        hash ^= byte as u32;
        hash = hash.wrapping_mul(FNV_PRIME);
        i += 1;
    }
    hash
}
