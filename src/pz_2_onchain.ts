/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pz_2_onchain.json`.
 */
export type Pz2Onchain = {
  "address": "BpnvfVjTVTtumHtHRyuuMZMWUUC7S9QgtJnrBuJkADG7",
  "metadata": {
    "name": "pz2Onchain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createPostAccount",
      "discriminator": [
        5,
        130,
        80,
        122,
        154,
        244,
        51,
        250
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "socialAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "socialAccount"
              }
            ]
          }
        },
        {
          "name": "postAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "socialAccount"
              },
              {
                "kind": "account",
                "path": "socialAccount"
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "deletePostAccount",
      "discriminator": [
        87,
        212,
        201,
        12,
        84,
        122,
        176,
        2
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "socialAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "socialAccount"
              }
            ]
          }
        },
        {
          "name": "postAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "postAccount"
              },
              {
                "kind": "account",
                "path": "postAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeSocialAccount",
      "discriminator": [
        82,
        40,
        176,
        243,
        153,
        250,
        196,
        111
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "socialAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nickname",
          "type": "string"
        }
      ]
    },
    {
      "name": "updatePostAccount",
      "discriminator": [
        138,
        153,
        147,
        235,
        188,
        116,
        249,
        6
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "socialAccount",
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "socialAccount"
              }
            ]
          }
        },
        {
          "name": "postAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "postAccount"
              },
              {
                "kind": "account",
                "path": "postAccount"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newContent",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "postAccount",
      "discriminator": [
        85,
        236,
        139,
        84,
        240,
        243,
        196,
        23
      ]
    },
    {
      "name": "socialAccount",
      "discriminator": [
        173,
        250,
        164,
        54,
        240,
        147,
        197,
        199
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "nicknameIsTooLong",
      "msg": "Nickname for social account is too long"
    },
    {
      "code": 6001,
      "name": "nicknameIsEmpty",
      "msg": "Nickname for social account is empty"
    },
    {
      "code": 6002,
      "name": "contentIsTooLong",
      "msg": "Content for post account is too long"
    },
    {
      "code": 6003,
      "name": "contentIsEmpty",
      "msg": "Content for post account is empty"
    },
    {
      "code": 6004,
      "name": "unauthorizedAccessToSocialAccount",
      "msg": "Unauthorized access to social account"
    },
    {
      "code": 6005,
      "name": "unauthorizedAccessToPostAccount",
      "msg": "Unauthorized access to post account"
    }
  ],
  "types": [
    {
      "name": "postAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "postId",
            "type": "u64"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "socialAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "nickname",
            "type": "string"
          },
          {
            "name": "registrationTimestamp",
            "type": "i64"
          },
          {
            "name": "postCount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
