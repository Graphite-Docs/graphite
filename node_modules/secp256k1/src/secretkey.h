#ifndef _SECP256K1_NODE_SECRETKEY_
# define _SECP256K1_NODE_SECRETKEY_

#include <node.h>
#include <nan.h>


NAN_METHOD(secretKeyVerify);
NAN_METHOD(secretKeyExport);
NAN_METHOD(secretKeyImport);
NAN_METHOD(secretKeyTweakAdd);
NAN_METHOD(secretKeyTweakMul);

#endif
