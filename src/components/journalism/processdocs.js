ACCESS/TEAM FILE/PERMISSIONS FILE

Main admin (root user, eg: admin.graphite) creates initial users.
Team file is saved to each team member
Team members log in Graphite clientList is loaded.
If root of logged-in user username matches a client on the list, load permission file from main Admin and load team file from main admin.
If files have not been encrypted with the logged-in user public key, present message: "It looks like you should be a member of the {Team ID} team but have not been added as a user. Please ask an administrator to add you." //This is optional. Could just treat these users as regular users with no access and don't prompt anything.
Once team file is loaded, load each team member teammatesLastUpdated file and find most recent update — if no recent update, use main admin file.
If there is a more recent update, load that teammate team file.
Once finished, load each team member permissionsLastUpdate file and find most recent update - if no recent updates, use main admin permissions file.
If there is a more recent update, load that teammate permission file.

SAVING TEAM/PERMISSIONS FILE

If user has access to edit team or permissions file, changes should be saved and encrypted to each team member public key.
A lastUpdate file for both team and permissions should also be saved and encrypted with each team member public key.
ACCESS process above would then apply for each user when they log in.

SUBMITTING AN ARTICLE
