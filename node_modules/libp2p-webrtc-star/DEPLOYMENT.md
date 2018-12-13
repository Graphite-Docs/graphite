# Deployment

We have a [dokku](https://github.com/ipfs/ops-requests/issues/31) setup ready for this to be deployed, to deploy simple do (you have to have permission first):

```sh
# if you already have added the remote, you don't need to do it again
> git remote add dokku dokku@cloud.ipfs.team:star-signal
> git push dokku master
```

More info: https://github.com/libp2p/js-libp2p-webrtc-star/pull/48
