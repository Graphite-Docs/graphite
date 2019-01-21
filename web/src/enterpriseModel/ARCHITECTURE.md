## Account Initiation
Enterprise customers will be directed to a custom Graphite URL to handle client onboarding. This process will present them with a custom version of the Blockstack Browser that will enable root-level name registration in the `.graphite` namespace. For example, a new client would be able to register:

`acmecompany.graphite`

This process can be handled by Graphite as part of a key management agreement. Otherwise, some authority figure at the client's company (someone like a System Admin) will need to complete this process. It will be important that the master key generated through this flow is stored somewhere safe and always available.

Username creation for any employees being added to the system will take place through a similar flow. A subdomain registrar will need to be running for the root name (`acmecompany.graphite`) and employees will need to be provided the registration link that takes them to a custom Graphite authentication browser. This browser will only allow registrations on that subdomain registrar.

## Adding Users
Users will be added by inviting them to the custom sponsored name registration link (subdomain registrar). As soon as they register their name, they will have limited access to the organization's Graphite account. Within 2 hours, their names will be indexed and can be pulled into the company account via an API call that runs on a schedule.

```
Basic Example:

setInterval(this.queryNames, 1500)

queryNames() {
  fetch($EndpointURL)
    .then((response) => {
      let data = response.json()
      data.filter(x => x.username.includes('$CompanyName'))
      })
}
```

It will be important to add pending names to this list rather than wait for the indexer to pick them up, so the script should also call the pending subdomain list here:

`GET /list/{:iterator}`, where `{:iterator}` is a finite positive integer`

Example URL: `https://registrar.blockstack.org/list/16941`

## Access Model
By default, no user besides the SysAdmin (the root username on the account) will have access to do anything. That person must add at least one other user by sharing a scoped auth token schema with them (encrypted with the user's public key).

This would essentially be access to folder that is one level deep from the root. Consider this the `Access Folder`. Any user with access to the `Access Folder` can add other users to the folder.

In practice, this is what it looks like:

```
SysAdmin creates a scoped auth token which is included in the gaiaConfig object.

const pubKey = $UserPubKey;
const data = gaiaConfig;
const encryptedData = JSON.stringify(encryptECIES(pubKey, JSON.stringify(data)));
const file = pubKey + '/AccessConfig';
putFile(file, encryptedData, {encrypt: false})
```

There would need to be a baked in function that checks whether the logged in user has access to the `gaiaConfig` and this the `AccessFolder`.



## Storage Model
By default, all storage will be handled via the default Blockstack model. This means a user storing data will see that data go to their storage bucket within the Gaia hub. When a user needs to share a document with their team, two things must happen:

Fetch Access Config:

```
const pubKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
const privateKey = loadUserData().appPrivateKey;
const file = pubKey + '/AccessConfig/accessList';
const user = $rootUserName;
const options = { username: user, zoneFileLookupURL: "https://core.blockstack.org/v1/names", decrypt: false}
getFile(file, options)
  .then((file) => {
    return JSON.parse(decryptECIES(privateKey, JSON.parse(file)))
    })
```

If there is no access config file returned, the user does not have permission to share files with the team.


{
  teams: [
  {
    teamName: String,
    teamID: Number, 
    teamList: [
      {
        teamMateName: String,
        teamMateID: String,
        teamMateWriteAccess: Boolean
      }
    ]
  }
  ]
}
