##### Signed by https://keybase.io/max
```
-----BEGIN PGP SIGNATURE-----
Version: GnuPG/MacGPG2 v2.0.22 (Darwin)
Comment: GPGTools - https://gpgtools.org

iQEcBAABCgAGBQJT35aJAAoJEJgKPw0B/gTfDtgH/0bGuY+BCI2M3Q6y4JH5Bn1m
w7vO4k3n4T9K21mOruJA00plMrkuQL4zg9rP0821ZrhxozkXQnmrE0Jik5x3wd1C
+BSQqUyjX7/i8NVSyN+JZgagvcg3j1eciWCSdss+eiM7JkyxNGmnDs+abwrNYSx0
fY33c2M5scsBll2R6x1p5KgnPfbQhyORpWBfU52/sxmkO3AnXXNxwM2iSY5GqwaN
LsoFSGylrZpcW3Ge8+njmm34Mk00gXPwB3MArUMOS+rESszk0nUj64B7Cw/FOSpg
OCD4ceEGR9EYVrzIzaF3RvrywoQ6x7hwgwxSwBIhFJWoTA2A/emiAQ4LzTK8w/M=
=N9VP
-----END PGP SIGNATURE-----

```

<!-- END SIGNATURES -->

### Begin signed statement 

#### Expect

```
size  exec  file            contents                                                        
            ./                                                                              
547           .gitignore    a3260451040bdf523be635eac16d28044d0064c4e8c4c444b0a49b9258851bec
1490          LICENSE       27b08d9e03fea1bdf1d50a6635157e6f85a9181f5e786c6c2f5924f14e815f0f
327           Makefile      d61d0d80578b384e8d6d8294047b78ffb60c9a41abb05d838eaf0389e7bb7be0
39            README.md     6c41e4454c6336ea3bc104c2fedf227c86c07a75b56f465cf5ac97d78e7335e3
1123          index.iced    00e0aad9cbe1aac2031640a78d7f6a71e05975af1850b815311f9290f9ce2fd9
3182          index.js      fdf7d557aa74e847441e6387a46b228ce5bc70a4a13884be6b6b21e425800ad8
496           package.json  1f93680c2f313240c96d8d4db969a8f5a43faa62cd00e30ef09d7547252f2a1b
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