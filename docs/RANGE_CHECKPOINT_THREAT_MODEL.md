# Range checkpoint threat model

The range checkpoint stores task scope, byte counters, range offsets, response
body checksums, and local cache paths. It does not store Earthdata credentials
or raw signed URL query strings.

The checkpoint's **unkeyed SHA256 checksum detects accidental corruption only**.
It does not authenticate the checkpoint, make it tamper-proof, or protect
against a local actor who can edit both the data and checksum. The checkpoint
is not a security boundary for hostile local users.

State, lock, range-cache, staging, and final output paths are checked against
the canonical project root and existing symlink components are rejected before
filesystem operations. The checks are repeated before reads and renames. This
prevents accidental traversal and pre-existing symlink redirection; it is not a
complete defense against a hostile concurrent process replacing path components
between validation and use. The output directories should remain writable only
by the authorized project user.

Range bytes are counted at the HTTP response-body stream boundary. HTTP headers,
TLS/IP overhead, and bytes buffered below that stream API are outside the
counter's scope. A durable in-flight reservation is conservatively charged on
restart if completion could not be verified.
