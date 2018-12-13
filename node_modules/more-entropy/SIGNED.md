##### Signed by https://keybase.io/max
```
-----BEGIN PGP SIGNATURE-----
Version: GnuPG/MacGPG2 v2.0.22 (Darwin)
Comment: GPGTools - https://gpgtools.org

iQEcBAABCgAGBQJTpIVwAAoJEJgKPw0B/gTfpHYH/ib6YbBLDanjQSQ+S4CaoOcP
1tV7uhKEnwOpzPLxoj0XG06BgNuernAqtPNRqdLAIcaGhDmebZ/1nQWTV034FKSV
UXfIeVZIaYhZgcwpoMU62mB51kt3wyMC0jok4tLFjSCKys7YutwHT1NKjyd+5tdH
YXWlbw56QF7ZMkFI0LW5PVPmLpp5n6FfCxvCMJnKh1G+dJO4IBjONffkL4Rs9Bf2
s+/xCDKSESFV/dEDoQtAMYkmc3AuXTumtt6vWEmtQkWvEiXuff+j7tFMLj2MSlqv
A82ZtxkdWYMKaI2CVmv+H31vaHNpfXo/Ct2KtvYJgF/GMNBIhNNKqpQzGbKAgoE=
=BJxQ
-----END PGP SIGNATURE-----

```

<!-- END SIGNATURES -->

### Begin signed statement 

#### Expect

```
size  exec  file                contents                                                        
            ./                                                                                  
107           .gitignore        f5c3f45c2ad04fe63c9365f970a37b27d39ed721b71e889ff8f2b610143a7905
1074          LICENSE           a431ce5edcc96f2047072de28425e99163465d8ac0484b6cf54a9aa55231a16e
217           Makefile          6721d873ee6a7d80da5d8d1df66bfdf3f8365396bad705c13683ef95979a984a
3596          README.md         59a50463a5fb6fa3904532001c9190cc4ec9a9e12e456f287b096ec78d015202
              lib/                                                                              
5698            generator.js    e958adddfedd4e92e8778670d01323085a14abef3f16fc7212abf7f366b3e3e4
132             main.js         6db8bf9163e15abaf89a4af5b50afa2fd0f1a552adc94f069a6c1d393fc9fd79
634           package.json      dac2fc410da687f84f448ade06f4c7ffb7ad90d1353f6a6f475f8105021673b5
              src/                                                                              
2078            generator.iced  68ae5500546c6fa7570361fb8ff60d50e85d965c761f5a4307ad477f9020aaeb
57              main.iced       a246ca8c283f8023ae8379262178664ed69399b06307c9832b3993243e7296c5
              test/                                                                             
129             test.iced       63f498807580e02536ca665c3b48dae6080388420ad410417d05aa172ef95b55
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