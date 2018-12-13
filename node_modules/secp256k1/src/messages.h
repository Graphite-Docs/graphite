#ifndef _SECP256K1_NODE_MESSAGES_
# define _SECP256K1_NODE_MESSAGES_

#define CALLBACK_TYPE_INVALID "callback should be a function"
#define COMPRESSED_TYPE_INVALID "compressed should be a boolean"

#define MSG32_TYPE_INVALID "message should be a Buffer"
#define MSG32_LENGTH_INVALID "message length is invalid"

#define TWEAK_TYPE_INVALID "tweak should be a Buffer"
#define TWEAK_LENGTH_INVALID "tweak length is invalid"

#define EC_PRIVKEY_TYPE_INVALID "secret key should be a Buffer"
#define EC_PRIVKEY_LENGTH_INVALID "secret key length is invalid"
#define EC_PRIVKEY_TWEAK_ADD_FAIL "tweak out of range or resulting secret key is invalid"
#define EC_PRIVKEY_TWEAK_MUL_FAIL "tweak out of range"
#define EC_PRIVKEY_EXPORT_DER_FAIL "couldn't export to DER format"
#define EC_PRIVKEY_IMPORT_DER_FAIL "couldn't import from DER format"

#define EC_PUBKEYS_TYPE_INVALID "public keys should be an Array"
#define EC_PUBKEYS_LENGTH_INVALID "public keys Array should have at least 1 element"
#define EC_PUBKEY_TYPE_INVALID "public key should be a Buffer"
#define EC_PUBKEY_LENGTH_INVALID "public key length is invalid"
#define EC_PUBKEY_PARSE_FAIL "the public key could not be parsed or is invalid"
#define EC_PUBKEY_CREATE_FAIL "secret was invalid, try again"
#define EC_PUBKEY_TWEAK_ADD_FAIL "tweak out of range or resulting public key is invalid"
#define EC_PUBKEY_TWEAK_MUL_FAIL "tweak out of range"
#define EC_PUBKEY_COMBINE_FAIL "the sum of the public keys is not valid"

#define ECDSA_SIGNATURE_TYPE_INVALID "signature should be a Buffer"
#define ECDSA_SIGNATURE_LENGTH_INVALID "signature length is invalid"
#define ECDSA_SIGNATURE_RECOVERY_ID_TYPE_INVALID "recovery should be a Number"
#define ECDSA_SIGNATURE_RECOVERY_ID_VALUE_INVALID "recovery should have value between -1 and 4"
#define ECDSA_SIGNATURE_PARSE_FAIL "couldn't parse signature"
#define ECDSA_SIGNATURE_PARSE_DER_FAIL "couldn't parse DER signature"
#define ECDSA_SIGNATURE_SERIALIZE_DER_FAIL "couldn't serialize signature to DER format"
#define ECDSA_SIGNATURE_NORMALIZE_FAIL "couldn't normalize signature"

#define ECDSA_SIGN_FAIL "nonce generation function failed or secret key is invalid"
#define ECDSA_VERIFY_FAIL "incorrect or unparseable signature"
#define ECDSA_RECOVER_FAIL "couldn't recover public key from signature"

#define ECDH_FAIL "scalar was invalid (zero or overflow)"

#endif
