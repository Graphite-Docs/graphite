#ifndef _SECP256K1_NODE_VERIFY_
# define _SECP256K1_NODE_VERIFY_

#include <node.h>
#include <nan.h>


NAN_METHOD(verify);
NAN_METHOD(verifySync);

#endif
