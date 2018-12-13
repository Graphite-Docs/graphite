##### Signed by https://keybase.io/max
```
-----BEGIN PGP SIGNATURE-----
Comment: GPGTools - https://gpgtools.org

iQEcBAABCgAGBQJV6KheAAoJEJgKPw0B/gTffKwIAJIxtmTLHYx1YIQmYWov/GMh
1/wZibKaCcIXRkwoK04pO0QXI0t8RKUoKCqXx+DiSGvsJtiv+13g53gcYqIEDVQE
qXkzMsRku1aNmmyx/JAOSG3R+R+8IZ8U8/H2MYJixOttPhY0MvmYa0wQxCv6DhqY
0tNaSV95EU/nmAg1SdzL7zEplOw6iaqKbail81OOZv4Gul8tPzwopvQExfEvVpUe
dPAWchDNmABoXVVhacWAMdI9fom9rInBsi4RrRDZs7xW+oAAU1AZlZgNW+xm97KN
GHBKQXyWaW2xJDKd55NwlXH96WY9y8owK8PV3yC+0KWIaCaFE4cYAN11Q6WUfd8=
=BWRn
-----END PGP SIGNATURE-----

```

<!-- END SIGNATURES -->

### Begin signed statement 

#### Expect

```
size  exec  file              contents                                                        
            ./                                                                                
547           .gitignore      a3260451040bdf523be635eac16d28044d0064c4e8c4c444b0a49b9258851bec
561           CHANGELOG.md    e8de680f70101f08d6aaa6bc45bd7a82181b597d169928ec67c18c8cba1f2d10
1064          LICENSE         5fc49347113b5f450ac211e6ea946a21129f477161427226effa3cc185bcdc42
407           Makefile        32e05964b75b43fd5492411f781568a8e8ea25f1ec9c12ddc795868549d231f6
56            README.md       0bd4207a9490a68de9a1b58feac0cdeff349eaa778c8a0eaf859d07873026b07
              lib/                                                                            
948             const.js      850bed76dca7bb0582128f7bd03695995bed6185e2aed1ebe8f2a12e7c5b97c5
8519            library.js    04e38a2a3214344cc14ffff7010701bd696337c4bc95da5e777bd5a4ffa59963
348             main.js       e83de18f49590d8c989a30ee357a143601c741c49390836792cab3492137f957
5492            runtime.js    eace611e01fbf7d98d7bad0950be6507efe9af3023f8470aa94f9d6f887148bb
621           package.json    43114ae107235b3ac4a72fbbef267699b96f080ae6798f6a119fd831e4ebba54
              src/                                                                            
813             const.iced    47a264e483175c3af4900823978f619b3a80edb7d64f8ca42ff2b4d834c5efb2
3844            library.iced  6f23a3bbbdb928866f689c4217e8e32ba1929c51bfea20f2aa64b29585f07215
143             main.iced     9e316fde9ab21b2f7b9c78ed196e7c9d54e3c7cd20c1276bb470e21549dcd240
5255            runtime.iced  bc396ba23a0f76a3e054a62fd35790b4c2188ab09c53b0cb8930bf2c957a180c
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

<!-- summarize version = 0.0.9 -->

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