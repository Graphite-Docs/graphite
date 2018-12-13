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
                        "id": "111",
                        "name": "opus",
                        "clockrate": "48000",
                        "channels": "2",
                        "feedback": [],
                        "parameters": [
                            {
                                "key": "minptime",
                                "value": "10"
                            }
                        ]
                    },
                    {
                        "id": "103",
                        "name": "ISAC",
                        "clockrate": "16000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    },
                    {
                        "id": "104",
                        "name": "ISAC",
                        "clockrate": "32000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    },
                    {
                        "id": "0",
                        "name": "PCMU",
                        "clockrate": "8000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    },
                    {
                        "id": "8",
                        "name": "PCMA",
                        "clockrate": "8000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    },
                    {
                        "id": "107",
                        "name": "CN",
                        "clockrate": "48000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    },
                    {
                        "id": "106",
                        "name": "CN",
                        "clockrate": "32000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    },
                    {
                        "id": "105",
                        "name": "CN",
                        "clockrate": "16000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    },
                    {
                        "id": "13",
                        "name": "CN",
                        "clockrate": "8000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    },
                    {
                        "id": "126",
                        "name": "telephone-event",
                        "clockrate": "8000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    }
                ],
                "encryption": [
                    {
                        "tag": "1",
                        "cipherSuite": "AES_CM_128_HMAC_SHA1_80",
                        "keyParams": "inline:EwN4nicDelI9pradqeXwjvJVjhIZthVgukUu33Of",
                        "sessionParams": ""
                    }
                ],
                "feedback": [],
                "headerExtensions": [
                    {
                        "id": "1",
                        "uri": "urn:ietf:params:rtp-hdrext:ssrc-audio-level",
                        "senders": "both"
                    }
                ],
                "ssrc": "445948959",
                "mux": true,
                "sourceGroups": [],
                "sources": [
                    {
                        "ssrc": "445948959",
                        "parameters": [
                            {
                                "key": "cname",
                                "value": "RbR04HtIjW+Sa+yz"
                            },
                            {
                                "key": "msid",
                                "value": "uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgo uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgoa0"
                            },
                            {
                                "key": "mslabel",
                                "value": "uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgo"
                            },
                            {
                                "key": "label",
                                "value": "uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgoa0"
                            }
                        ]
                    }
                ]
            },
            "transport": {
                "transType": "iceUdp",
                "candidates": [
                    {
                        "foundation": "1529647030",
                        "component": "1",
                        "protocol": "udp",
                        "priority": "2113937151",
                        "ip": "192.12.211.22",
                        "port": "63522",
                        "type": "host",
                        "generation": "0",
                        "network": "1",
                        "id": "0"
                    }
                ],
                "fingerprints": [
                    {
                        "hash": "sha-256",
                        "value": "39:52:60:61:9D:6B:97:2A:43:DE:E0:BD:80:4B:2D:EE:A3:00:72:FE:FF:11:8E:43:85:06:4A:14:80:FE:9F:DD"
                    }
                ],
                "ufrag": "TESg/uYDt8nNomZd",
                "pwd": "abQXlDvFdLKIVdRDdg1t5Tbn"
            },
            "senders": "both"
        },
        {
            "creator": "initiator",
            "name": "video",
            "description": {
                "descType": "rtp",
                "media": "video",
                "payloads": [
                    {
                        "id": "100",
                        "name": "VP8",
                        "clockrate": "90000",
                        "channels": "1",
                        "feedback": [
                            {
                                "id": "100",
                                "type": "ccm",
                                "subtype": "fir",
                                "parameters": []
                            },
                            {
                                "id": "100",
                                "type": "nack",
                                "subtype": "",
                                "parameters": []
                            },
                            {
                                "id": "100",
                                "type": "goog-remb",
                                "subtype": "",
                                "parameters": []
                            }
                        ],
                        "parameters": []
                    },
                    {
                        "id": "116",
                        "name": "red",
                        "clockrate": "90000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    },
                    {
                        "id": "117",
                        "name": "ulpfec",
                        "clockrate": "90000",
                        "channels": "1",
                        "feedback": [],
                        "parameters": []
                    }
                ],
                "encryption": [
                    {
                        "tag": "1",
                        "cipherSuite": "AES_CM_128_HMAC_SHA1_80",
                        "keyParams": "inline:EwN4nicDelI9pradqeXwjvJVjhIZthVgukUu33Of",
                        "sessionParams": ""
                    }
                ],
                "feedback": [],
                "headerExtensions": [
                    {
                        "id": "2",
                        "uri": "urn:ietf:params:rtp-hdrext:toffset",
                        "senders": "both"
                    }
                ],
                "ssrc": "797563643",
                "mux": true,
                "sourceGroups": [
                    {
                        "semantics": "FID",
                        "sources": ["797563643", "193463643"]
                    }
                ],
                "sources": [
                    {
                        "ssrc": "797563643",
                        "parameters": [
                            {
                                "key": "cname",
                                "value": "RbR04HtIjW+Sa+yz"
                            },
                            {
                                "key": "msid",
                                "value": "uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgo uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgov0"
                            },
                            {
                                "key": "mslabel",
                                "value": "uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgo"
                            },
                            {
                                "key": "label",
                                "value": "uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgov0"
                            }
                        ]
                    },
                    {
                        "ssrc": "193463643",
                        "parameters": [
                            {
                                "key": "cname",
                                "value": "RbR04HtIjW+Sa+yz"
                            },
                            {
                                "key": "msid",
                                "value": "uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgo uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgov0"
                            },
                            {
                                "key": "mslabel",
                                "value": "uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgo"
                            },
                            {
                                "key": "label",
                                "value": "uwwsnlQmzOrjxCsin4Z5lQ5XVpUFHQgUYLgov0"
                            }
                        ]
                    }
                ]
            },
            "transport": {
                "transType": "iceUdp",
                "candidates": [
                    {
                        "foundation": "1529647030",
                        "component": "1",
                        "protocol": "udp",
                        "priority": "2113937151",
                        "ip": "192.12.211.22",
                        "port": "63522",
                        "type": "host",
                        "generation": "0",
                        "network": "1",
                        "id": "1"
                    }
                ],
                "fingerprints": [
                    {
                        "hash": "sha-256",
                        "value": "39:52:60:61:9D:6B:97:2A:43:DE:E0:BD:80:4B:2D:EE:A3:00:72:FE:FF:11:8E:43:85:06:4A:14:80:FE:9F:DD"
                    }
                ],
                "ufrag": "TESg/uYDt8nNomZd",
                "pwd": "abQXlDvFdLKIVdRDdg1t5Tbn"
            },
            "senders": "both"
        }
    ],
    "groups": [
        {
            "semantics": "BUNDLE",
            "contents": [
                "audio",
                "video"
            ]
        }
    ]
};
