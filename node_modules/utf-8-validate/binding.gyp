{
  'targets': [
    {
      'target_name': 'validation',
      'include_dirs': ["<!(node -e \"require('nan')\")"],
      'cflags!': [ '-O3' ],
      'cflags': [ '-O2' ],
      'sources': [ 'src/validation.cc' ],
      'xcode_settings': {
        'MACOSX_DEPLOYMENT_TARGET': '10.8',
        'CLANG_CXX_LANGUAGE_STANDARD': 'c++11',
        'CLANG_CXX_LIBRARY': 'libc++'
      }
    }
  ]
}
