{
  "targets": [
    {
      'target_name': 'ursaNative',
      'sources': [ 'src/ursaNative.cc' ],
      'conditions': [
        [ 'OS=="win"', {
          'defines': [
            'uint=unsigned int',
          ],
          'include_dirs': [
            # use node's bundled openssl headers platforms
            '<(node_root_dir)/deps/openssl/openssl/include',
                        "<!(node -e \"require('nan')\")"
          ],
        }, { # OS!="win"
          'include_dirs': [
            # use node's bundled openssl headers on Unix platforms
            '<(node_root_dir)/deps/openssl/openssl/include',
                        "<!(node -e \"require('nan')\")"
          ],
        }],
      ],
    }
  ]
}

