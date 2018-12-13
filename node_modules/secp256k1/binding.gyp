{
  "targets": [{
    "target_name": "secp256k1",
    "variables": {
      "with_gmp%": "<!(./utils/has_lib.sh gmpxx && ./utils/has_lib.sh gmp)"
    },
    "sources": [
      "./src/addon.cc",
      "./src/secretkey.cc",
      "./src/publickey.cc",
      "./src/signature.cc",
      "./src/sign.cc",
      "./src/verify.cc",
      "./src/recover.cc",
      "./src/ecdh.cc",
      "./src/secp256k1-src/src/secp256k1.c",
      "./src/secp256k1-src/contrib/lax_der_privatekey_parsing.c"
    ],
    "cflags": [
      "-Wall",
      "-Wno-maybe-uninitialized",
      "-Wno-uninitialized",
      "-Wno-unused-function",
      "-Wextra"
    ],
    "cflags_cc+": [
      "-std=c++0x"
    ],
    "include_dirs": [
      "/usr/local/include",
      "./src/secp256k1-src",
      "./src/secp256k1-src/contrib",
      "./src/secp256k1-src/include",
      "./src/secp256k1-src/src",
      "<!(node -e \"require('nan')\")"
    ],
    "conditions": [
      [
        "with_gmp=='true'", {
          "defines": [
            "HAVE_LIBGMP=1",
            "USE_NUM_GMP=1",
            "USE_FIELD_INV_NUM=1",
            "USE_SCALAR_INV_NUM=1"
          ],
          "libraries": [
            "-lgmpxx",
            "-lgmp"
          ]
        }, {
          "defines": [
            "USE_NUM_NONE=1",
            "USE_SCALAR_INV_BUILTIN=1",
            "USE_FIELD_INV_BUILTIN=1",
            "ENABLE_MODULE_ECDH=1",
            "ENABLE_MODULE_RECOVERY=1"
          ]
        }
      ],
      [
        "target_arch=='ia32'", {
          "defines": [
            "USE_FIELD_10X26=1",
            "USE_SCALAR_8X32=1"
          ]
        }
      ],
      [
        "target_arch=='x64'", {
          "defines": [
            "HAVE___INT128=1"
            "USE_ASM_X86_64=1",
            "USE_FIELD_5X52=1",
            "USE_FIELD_5X52_INT128=1",
            "USE_SCALAR_4X64=1"
          ]
        }
      ],
      [
       'OS=="mac"', {
          "libraries": [
            "-L/usr/local/lib"
          ],
          "xcode_settings": {
            "MACOSX_DEPLOYMENT_TARGET": '10.7',
            "OTHER_CPLUSPLUSFLAGS": [
              '-stdlib=libc++'
            ]
          }
      }],
      [
        "OS=='win'", {
          "conditions": [
            [
              "target_arch=='x64'", {
                "variables": {
                  "openssl_root%": "C:/OpenSSL-Win64"
                },
              }, {
                "variables": {
                  "openssl_root%": "C:/OpenSSL-Win32"
                }
              }
            ]
          ],
          "libraries": [
            "-l<(openssl_root)/lib/libeay32.lib",
          ],
          "include_dirs": [
            "<(openssl_root)/include",
          ],
        }, {
          "conditions": [
            [
              "target_arch=='ia32'", {
                "variables": {
                  "openssl_config_path": "<(nodedir)/deps/openssl/config/piii"
                }
              }
            ],
            [
              "target_arch=='x64'", {
                "variables": {
                  "openssl_config_path": "<(nodedir)/deps/openssl/config/k8"
                },
              }
            ],
            [
              "target_arch=='arm'", {
                "variables": {
                  "openssl_config_path": "<(nodedir)/deps/openssl/config/arm"
                }
              }
            ],
          ],
          "include_dirs": [
            "<(nodedir)/deps/openssl/openssl/include",
            "<(openssl_config_path)"
          ]
        }
      ]
    ]
  }]
}
