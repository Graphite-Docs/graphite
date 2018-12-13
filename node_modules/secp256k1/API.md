# API Reference (v2.x)

- [`.secretKeyVerify(Buffer secretKey)`](#secretkeyverifybuffer-secretkey---boolean)
- [`.secretKeyExport(Buffer secretKey [, Boolean compressed = true])`](#secretkeyexportbuffer-secretkey--boolean-compressed--true---buffer)
- [`.secretKeyImport(Buffer secretKey)`](#secretkeyimportbuffer-secretkey---buffer)
- [`.secretKeyTweakAdd(Buffer secretKey, Buffer tweak)`](#secretkeytweakaddbuffer-secretkey-buffer-tweak---buffer)
- [`.secretKeyTweakMul(Buffer secretKey, Buffer tweak)`](#secretkeytweakmulbuffer-secretkey-buffer-tweak---buffer)
- [`.publicKeyCreate(Buffer secretKey)`](#publickeycreatebuffer-secretkey---buffer)
- [`.publicKeyConvert(Buffer publicKey [, Boolean compressed = true])`](#publickeyconvertbuffer-publickey--boolean-compressed--true---buffer)
- [`.publicKeyVerify(Buffer publicKey)`](#publickeyverifybuffer-publickey---boolean)
- [`.publicKeyTweakAdd(Buffer publicKey, Buffer tweak)`](#publickeytweakaddbuffer-publickey-buffer-tweak---buffer)
- [`.publicKeyTweakMul(Buffer publicKey, Buffer tweak)`](#publickeytweakmulbuffer-publickey-buffer-tweak---buffer)
- [`.publicKeyCombine(Array<Buffer> publicKeys)`](#publickeycombinearraybuffer-publickeys---buffer)
- [`.signatureNormalize(Buffer signature)`](#signaturenormalizebuffer-signature---buffer)
- [`.signatureExport(Buffer signature)`](#signatureexportbuffer-signature---buffer)
- [`.signatureImport(Buffer signature)`](#signatureimportbuffer-signature---buffer)
- [`.sign(Buffer msg, Buffer secretKey [, Function callback])`](#signbuffer-msg-buffer-secretkey--function-callback---promisesignature-buffer-recovery-number)
- [`.signSync(Buffer msg, Buffer secretKey)`](#signsyncbuffer-msg-buffer-secretkey---signature-buffer-recovery-number)
- [`.verify(Buffer msg, Buffer signature, Buffer publicKey [, Function callback])`](#verifybuffer-msg-buffer-signature-buffer-publickey--function-callback---promiseboolean)
- [`.verifySync(Buffer msg, Buffer signature, Buffer publicKey)`](#verifysyncbuffer-msg-buffer-signature-buffer-publickey---boolean)
- [`.recover(Buffer msg, Buffer signature, Number recovery [, Function callback])`](#recoverbuffer-msg-buffer-signature-number-recovery--function-callback---promisebuffer)
- [`.recoverSync(Buffer msg, Buffer signature, Number recovery)`](#recoversyncbuffer-msg-buffer-signature-number-recovery---buffer)
- [`.ecdh(Buffer publicKey, Buffer secretKey [, Function callback])`](#ecdhbuffer-publickey-buffer-secretkey--function-callback---promisebuffer)
- [`.ecdhSync(Buffer publicKey, Buffer secretKey)`](#ecdhsyncbuffer-publickey-buffer-secretkey---buffer)

#####`.secretKeyVerify(Buffer secretKey)` -> `Boolean`

Verify an ECDSA *secretKey*.

<hr>

#####`.secretKeyExport(Buffer secretKey [, Boolean compressed = true])` -> `Buffer`

Export a *secretKey* in DER format.

<hr>

#####`.secretKeyImport(Buffer secretKey)` -> `Buffer`

Import a *secretKey* in DER format.

<hr>

#####`.secretKeyTweakAdd(Buffer secretKey, Buffer tweak)` -> `Buffer`

Tweak a *secretKey* by adding *tweak* to it.

<hr>

#####`.secretKeyTweakMul(Buffer secretKey, Buffer tweak)` -> `Buffer`

Tweak a *secretKey* by multiplying it by a *tweak*.

<hr>

#####`.publicKeyCreate(Buffer secretKey)` -> `Buffer`

Compute the public key for a *secretKey*.

<hr>

#####`.publicKeyConvert(Buffer publicKey [, Boolean compressed = true])` -> `Buffer`

Convert a *publicKey* to *compressed* or *uncompressed* form.

<hr>

#####`.publicKeyVerify(Buffer publicKey)` -> `Boolean`

Verify an ECDSA *publicKey*.

<hr>

#####`.publicKeyTweakAdd(Buffer publicKey, Buffer tweak)` -> `Buffer`

Tweak a *publicKey* by adding *tweak* times the generator to it.

<hr>

#####`.publicKeyTweakMul(Buffer publicKey, Buffer tweak)` -> `Buffer`

Tweak a *publicKey* by multiplying it by a *tweak* value.

<hr>

#####`.publicKeyCombine(Array<Buffer> publicKeys)` -> `Buffer`

Add a given *publicKeys* together.

<hr>

#####`.signatureNormalize(Buffer signature)` -> `Buffer`

Convert a *signature* to a normalized lower-S form.

<hr>

#####`.signatureExport(Buffer signature)` -> `Buffer`

Serialize an ECDSA *signature* in DER format.

<hr>

#####`.signatureImport(Buffer signature)` -> `Buffer`

Parse a DER ECDSA *signature*.

<hr>

#####`.sign(Buffer msg, Buffer secretKey [, Function callback])` -> `Promise<{signature: Buffer, recovery: number}>`

Create an ECDSA signature.

<hr>

#####`.signSync(Buffer msg, Buffer secretKey)` -> `{signature: Buffer, recovery: number}`

Synchronous [.sign](#signbuffer-msg-buffer-secretkey--function-callback---promisesignature-buffer-recovery-number). Returns an object `{signature: Buffer, recovery: number}`.

<hr>

#####`.verify(Buffer msg, Buffer signature, Buffer publicKey [, Function callback])` -> `Promise<Boolean>`

Verify an ECDSA signature.

<hr>

#####`.verifySync(Buffer msg, Buffer signature, Buffer publicKey` -> `Boolean`

Synchronous [.verify](#verifybuffer-msg-buffer-signature-buffer-publickey--function-callback---promiseboolean). Returns a `Boolean`.

<hr>

#####`.recover(Buffer msg, Buffer signature, Number recovery [, Function callback]` -> `Promise<Buffer>`

Recover an ECDSA public key from a signature.

<hr>

#####`.recoverSync(Buffer msg, Buffer signature, Number recovery)` -> `Buffer`

Synchronous [.recover](#recoverbuffer-msg-buffer-signature-number-recovery--function-callback---promisebuffer). Returns an instance of `Buffer`.

<hr>

#####`.ecdh(Buffer publicKey, Buffer secretKey [, Function callback])` -> `Promise<Buffer>`

Compute an EC Diffie-Hellman secret.

<hr>

#####`.ecdhSync(Buffer publicKey, Buffer secretKey)` -> `Buffer`

Synchronous [.ecdh](#ecdhbuffer-publickey-buffer-secretkey--function-callback---promisebuffer). Returns an instance of `Buffer`.
