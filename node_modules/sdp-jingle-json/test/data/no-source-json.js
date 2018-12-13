module.exports = {
    "contents": [
        {
            "creator": "initiator",
            "name": "audio",
            "description": {
                "descType": "rtp",
                "media": "audio",
                "payloads": [
                    {
                        "id": "96",
                        "name": "opus",
                        "clockrate": "48000",
                        "channels": "2",
                        "parameters": [],
                        "feedback": []
                    },
                    {
                        "id": "101",
                        "name": "telephone-event",
                        "clockrate": "48000",
                        "channels": "1",
                        "parameters": [
                            {
                                "key": "bitrate",
                                "value": "0"
                            }
                        ],
                        "feedback": []
                    }
                ],
                "encryption": [],
                "feedback": [],
                "headerExtensions": [],
                "sourceGroups": [],
                "sources": []
            },
            "transport": {
                "transType": "iceUdp",
                "candidates": [
                    {
                        "foundation": "1",
                        "component": "1",
                        "protocol": "udp",
                        "priority": "0",
                        "ip": "xx.xx.xxx.xxx",
                        "port": "27622",
                        "type": "host",
                        "generation": "0",
                        "network": "1",
                        "id": "0"
                    },
                    {
                        "foundation": "1974206464",
                        "component": "1",
                        "protocol": "udp",
                        "priority": "1694498815",
                        "ip": "xxx.xx.xxx.xxx",
                        "port": "27622",
                        "type": "srflx",
                        "generation": "0",
                        "relAddr": "xx.xx.xxx.xxx",
                        "relPort": "27622",
                        "network": "1",
                        "id": "1"
                    }
                ],
                "fingerprints": [
                    {
                        "hash": "sha-256",
                        "value": "A1:D1:E8:C0:A3:B2:66:AA:8E:40:46:F0:4F:FE:FB:B9:99:82:E3:D9:6B:C9:F4:11:64:5E:AD:54:99:2C:E3:03",
                        "setup": "actpass"
                    }
                ],
                "ufrag": "GXUH9ptTQlZT2f1l",
                "pwd": "6AWVYDmAkCyeBQeG75QCC6TE"
            },
            "senders": "both"
        }
    ]
};
