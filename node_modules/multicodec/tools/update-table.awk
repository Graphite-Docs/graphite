#!/usr/bin/env awk -f
# This script makes a basic conversion from the multicodec CSV table to the
# JavaScript lookup table used by this repository. The output can't directly
# be used, but should serve as a template to do manually diffing with the
# existing lookup table.
{
    FS=","
}
{
    sub("[ ]+", "", $3)
    # Ignore empty codes
    if ($3 != "0x" && $3 != "") {
        sub("^0x","", $3)
        print "exports['" tolower($1) "'] = Buffer.from('" tolower($3) \
              "', 'hex')"
    }
}
