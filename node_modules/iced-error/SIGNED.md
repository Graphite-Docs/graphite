##### Signed by https://keybase.io/max
```
-----BEGIN PGP SIGNATURE-----
Version: GnuPG/MacGPG2 v2.0.22 (Darwin)
Comment: GPGTools - https://gpgtools.org

iQEcBAABCgAGBQJTjeR2AAoJEJgKPw0B/gTfgxIH/1R5M19ZeWwKj91DHD8sWlV1
xIGmIzBFsAJN9tde3JfKn+btPAyuSkUa2TJthBrYR4uucw8+2n4xprknfhB8ahnt
Vk4mXcdM5ZyVtG0PfIWrise2/3iRty4xYNBu3N13YH/O/4KY0vpeM/+6YH7IoyXR
phIMOIQvHmx3WNOcaIT/D6pr5n3iCtmCyZJi8n272kSdOnNTcEynngnSbOfS9kCj
w08v0u0a2tJzZ6+rlJg3N6dgzvfmd3I0ydDDb08tzSG0u09Mc1O6EuPYPWSmr4Pn
OmdGUjL+C2kTp4f3hTV0PbmX58ZXtBQc3Cs6dWVeudg8oIu5kQi757HYxENndEg=
=Bpox
-----END PGP SIGNATURE-----

```

<!-- END SIGNATURES -->

### Begin signed statement 

#### Expect

```
size  exec  file            contents                                                        
            ./                                                                              
13            .gitignore    16d30e4462189fb14dd611bdb708c510630c576a1f35b9383e89a4352da36c97
193           Makefile      23c9b8634bc5ded1e2b925af63ecf89842491817000ba7fa2a4e68c6c6248cc6
1675          README.md     231664c0e663782b27f6a8290604ab1ad48f072441c2347aaa495f48232b251e
4026          index.iced    81a0d4054cbb60d4fbfaa58854ef2335d3a581781267c12b23f44632e9b95514
6523          index.js      e0f9763f0eae8ba5763e36772cf04360f4b8ff5ac329d0cac68a574e88bbe37b
6177          index.map     5cbff70c7b57c57d2ad91d2740358d50ef9bd7741aee60d8f6716568e8d57947
509           package.json  f82a7d8dc20e922673b70fe48d0a2332f080b1acd125d46b496012118dfb22f2
```

#### Ignore

```
/SIGNED.md
```

#### Presets

```
git      # ignore .git and anything as described by .gitignore files
dropbox  # ignore .dropbox-cache and other Dropbox-related files    
kb       # ignore anything as described by .kbignore files          
```

<!-- summarize version = 0.0.8 -->

### End signed statement

<hr>

#### Notes

With keybase you can sign any directory's contents, whether it's a git repo,
source code distribution, or a personal documents folder. It aims to replace the drudgery of:

  1. comparing a zipped file to a detached statement
  2. downloading a public key
  3. confirming it is in fact the author's by reviewing public statements they've made, using it

All in one simple command:

```bash
keybase dir verify
```

There are lots of options, including assertions for automating your checks.

For more info, check out https://keybase.io/docs/command_line/code_signing