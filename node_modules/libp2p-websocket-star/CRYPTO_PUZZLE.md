# Crypto Challenge

The crypto challenge is a simple signature challenge.

The challenge works as follows:

-   Client emits "ss-join" with the following parameters:
    -   (string) multiaddr: The multiaddr as string
    -   (string) pubkey: The marshaled public key as hex string
    -   (function) cb: The callback function
-   Server recieves "ss-join"
    -   gets id from multiaddr using `addr.split('ipfs/').pop()`
    -   gets id from public key
    -   matches both ids
    -   creates an unique nonce
    -   stores both the key and the nonce and responds using the callback: `cb(null, nonce)`
    -   if any error occurs during the process the server responds with: `cb(err)`
-   Client recieves callback response
    -   signs nonce using the private key of the id
    -   responds by emitting "ss-join"
        -   (string) multiaddr: The multiaddr as string
        -   (string) signature: The signature as hex string
        -   (function) cb: The callback function
-   Server recieves second "ss-join"
    -   verifies stored nonce was signed with the stored key
    -   if not the server responds with: `cb("Invalid signature")`
    -   finalizes join
    -   responds with: `cb()`
-   Client recieves response
-   Client is now authorized for `multiaddr`
