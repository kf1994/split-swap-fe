import { type Idl } from "@coral-xyz/anchor"

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/private_swap.json`.
 */
export const PrivateSwap: Idl = {
  address: "65XsnGdUuwcSb6CA6JpiP1dJUxcTTmVVsqesG4nA7YoP",
  metadata: {
    name: "privateSwap",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor"
  },
  instructions: [
    {
      name: "createTradeBuffer",
      discriminator: [76, 221, 96, 116, 89, 16, 173, 136],
      accounts: [
        {
          name: "user",
          writable: true,
          signer: true
        },
        {
          name: "bufferTradeBuffer",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [98, 117, 102, 102, 101, 114]
              },
              {
                kind: "account",
                path: "tradeBuffer"
              }
            ],
            program: {
              kind: "const",
              value: [
                75, 115, 171, 63, 109, 250, 178, 80, 90, 118, 87, 255, 178, 103,
                75, 195, 88, 161, 155, 34, 22, 196, 223, 145, 237, 235, 112,
                104, 135, 211, 85, 190
              ]
            }
          }
        },
        {
          name: "delegationRecordTradeBuffer",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [100, 101, 108, 101, 103, 97, 116, 105, 111, 110]
              },
              {
                kind: "account",
                path: "tradeBuffer"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "delegationMetadataTradeBuffer",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  100, 101, 108, 101, 103, 97, 116, 105, 111, 110, 45, 109, 101,
                  116, 97, 100, 97, 116, 97
                ]
              },
              {
                kind: "account",
                path: "tradeBuffer"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "tradeBuffer",
          writable: true
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        },
        {
          name: "ownerProgram",
          address: "65XsnGdUuwcSb6CA6JpiP1dJUxcTTmVVsqesG4nA7YoP"
        },
        {
          name: "delegationProgram",
          address: "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        }
      ],
      args: [
        {
          name: "tradeBufferIndex",
          type: "u8"
        }
      ]
    },
    {
      name: "createUserBalanceState",
      discriminator: [229, 106, 243, 255, 213, 56, 43, 53],
      accounts: [
        {
          name: "user",
          writable: true,
          signer: true
        },
        {
          name: "bufferUserBalance",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [98, 117, 102, 102, 101, 114]
              },
              {
                kind: "account",
                path: "userBalance"
              }
            ],
            program: {
              kind: "const",
              value: [
                75, 115, 171, 63, 109, 250, 178, 80, 90, 118, 87, 255, 178, 103,
                75, 195, 88, 161, 155, 34, 22, 196, 223, 145, 237, 235, 112,
                104, 135, 211, 85, 190
              ]
            }
          }
        },
        {
          name: "delegationRecordUserBalance",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [100, 101, 108, 101, 103, 97, 116, 105, 111, 110]
              },
              {
                kind: "account",
                path: "userBalance"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "delegationMetadataUserBalance",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  100, 101, 108, 101, 103, 97, 116, 105, 111, 110, 45, 109, 101,
                  116, 97, 100, 97, 116, 97
                ]
              },
              {
                kind: "account",
                path: "userBalance"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "userBalance",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [117, 115, 101, 114, 95, 98, 97, 108, 97, 110, 99, 101]
              },
              {
                kind: "account",
                path: "user"
              }
            ]
          }
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        },
        {
          name: "ownerProgram",
          address: "65XsnGdUuwcSb6CA6JpiP1dJUxcTTmVVsqesG4nA7YoP"
        },
        {
          name: "delegationProgram",
          address: "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        }
      ],
      args: []
    },
    {
      name: "delegateDepositState",
      discriminator: [126, 215, 53, 140, 94, 142, 73, 200],
      accounts: [
        {
          name: "payer",
          writable: true,
          signer: true
        },
        {
          name: "bufferDepositState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [98, 117, 102, 102, 101, 114]
              },
              {
                kind: "account",
                path: "depositState"
              }
            ],
            program: {
              kind: "const",
              value: [
                75, 115, 171, 63, 109, 250, 178, 80, 90, 118, 87, 255, 178, 103,
                75, 195, 88, 161, 155, 34, 22, 196, 223, 145, 237, 235, 112,
                104, 135, 211, 85, 190
              ]
            }
          }
        },
        {
          name: "delegationRecordDepositState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [100, 101, 108, 101, 103, 97, 116, 105, 111, 110]
              },
              {
                kind: "account",
                path: "depositState"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "delegationMetadataDepositState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  100, 101, 108, 101, 103, 97, 116, 105, 111, 110, 45, 109, 101,
                  116, 97, 100, 97, 116, 97
                ]
              },
              {
                kind: "account",
                path: "depositState"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "depositState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  100, 101, 112, 111, 115, 105, 116, 95, 115, 116, 97, 116, 101
                ]
              },
              {
                kind: "arg",
                path: "creator"
              },
              {
                kind: "arg",
                path: "nonce"
              }
            ]
          }
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        },
        {
          name: "ownerProgram",
          address: "65XsnGdUuwcSb6CA6JpiP1dJUxcTTmVVsqesG4nA7YoP"
        },
        {
          name: "delegationProgram",
          address: "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        }
      ],
      args: [
        {
          name: "creator",
          type: "pubkey"
        },
        {
          name: "nonce",
          type: "u64"
        }
      ]
    },
    {
      name: "delegateTradeBuffer",
      discriminator: [10, 203, 59, 27, 216, 202, 128, 239],
      accounts: [
        {
          name: "user",
          writable: true,
          signer: true
        },
        {
          name: "bufferTradeBuffer",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [98, 117, 102, 102, 101, 114]
              },
              {
                kind: "account",
                path: "tradeBuffer"
              }
            ],
            program: {
              kind: "const",
              value: [
                75, 115, 171, 63, 109, 250, 178, 80, 90, 118, 87, 255, 178, 103,
                75, 195, 88, 161, 155, 34, 22, 196, 223, 145, 237, 235, 112,
                104, 135, 211, 85, 190
              ]
            }
          }
        },
        {
          name: "delegationRecordTradeBuffer",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [100, 101, 108, 101, 103, 97, 116, 105, 111, 110]
              },
              {
                kind: "account",
                path: "tradeBuffer"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "delegationMetadataTradeBuffer",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  100, 101, 108, 101, 103, 97, 116, 105, 111, 110, 45, 109, 101,
                  116, 97, 100, 97, 116, 97
                ]
              },
              {
                kind: "account",
                path: "tradeBuffer"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "tradeBuffer",
          writable: true
        },
        {
          name: "ownerProgram",
          address: "65XsnGdUuwcSb6CA6JpiP1dJUxcTTmVVsqesG4nA7YoP"
        },
        {
          name: "delegationProgram",
          address: "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "tradeBufferIndex",
          type: "u8"
        }
      ]
    },
    {
      name: "delegateWithdrawalState",
      discriminator: [82, 117, 151, 207, 29, 111, 61, 7],
      accounts: [
        {
          name: "payer",
          writable: true,
          signer: true
        },
        {
          name: "bufferWithdrawalState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [98, 117, 102, 102, 101, 114]
              },
              {
                kind: "account",
                path: "withdrawalState"
              }
            ],
            program: {
              kind: "const",
              value: [
                75, 115, 171, 63, 109, 250, 178, 80, 90, 118, 87, 255, 178, 103,
                75, 195, 88, 161, 155, 34, 22, 196, 223, 145, 237, 235, 112,
                104, 135, 211, 85, 190
              ]
            }
          }
        },
        {
          name: "delegationRecordWithdrawalState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [100, 101, 108, 101, 103, 97, 116, 105, 111, 110]
              },
              {
                kind: "account",
                path: "withdrawalState"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "delegationMetadataWithdrawalState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  100, 101, 108, 101, 103, 97, 116, 105, 111, 110, 45, 109, 101,
                  116, 97, 100, 97, 116, 97
                ]
              },
              {
                kind: "account",
                path: "withdrawalState"
              }
            ],
            program: {
              kind: "account",
              path: "delegationProgram"
            }
          }
        },
        {
          name: "withdrawalState",
          writable: true
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        },
        {
          name: "ownerProgram",
          address: "65XsnGdUuwcSb6CA6JpiP1dJUxcTTmVVsqesG4nA7YoP"
        },
        {
          name: "delegationProgram",
          address: "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        }
      ],
      args: [
        {
          name: "withdrawalStateIndex",
          type: "u8"
        }
      ]
    },
    {
      name: "depositOnL1",
      discriminator: [231, 186, 79, 243, 56, 79, 18, 84],
      accounts: [
        {
          name: "user",
          writable: true,
          signer: true
        },
        {
          name: "globalState",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          name: "depositState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  100, 101, 112, 111, 115, 105, 116, 95, 115, 116, 97, 116, 101
                ]
              },
              {
                kind: "account",
                path: "user"
              },
              {
                kind: "arg",
                path: "nonce"
              }
            ]
          }
        },
        {
          name: "userTokenAccount",
          writable: true
        },
        {
          name: "tokenMint"
        },
        {
          name: "vaultTokenAccount",
          writable: true
        },
        {
          name: "tokenProgram",
          docs: ["SPL program for token transfers"],
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "tokenProgram2022",
          docs: ["SPL program 2022 for token transfers"],
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "nonce",
          type: "u64"
        },
        {
          name: "amount",
          type: "u64"
        }
      ]
    },
    {
      name: "executeTradeOnL1",
      discriminator: [59, 242, 248, 114, 46, 144, 111, 61],
      accounts: [
        {
          name: "signer",
          writable: true,
          signer: true
        },
        {
          name: "tradeBuffer",
          writable: true
        },
        {
          name: "globalState",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          name: "swapState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [115, 119, 97, 112, 95, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          name: "userTokenAccount",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "signer"
              },
              {
                kind: "const",
                value: [
                  6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                  235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140,
                  245, 133, 126, 255, 0, 169
                ]
              },
              {
                kind: "account",
                path: "inputTokenMint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142,
                13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216,
                219, 233, 248, 89
              ]
            }
          }
        },
        {
          name: "userOutputTokenAccount",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "signer"
              },
              {
                kind: "const",
                value: [
                  6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                  235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140,
                  245, 133, 126, 255, 0, 169
                ]
              },
              {
                kind: "account",
                path: "outputTokenMint"
              }
            ],
            program: {
              kind: "const",
              value: [
                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142,
                13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216,
                219, 233, 248, 89
              ]
            }
          }
        },
        {
          name: "vaultTokenAccount",
          writable: true
        },
        {
          name: "inputTokenMint"
        },
        {
          name: "outputTokenMint"
        },
        {
          name: "tokenProgram",
          docs: ["SPL program for token transfers"],
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "tokenProgram2022",
          docs: ["SPL program 2022 for token transfers"],
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        },
        {
          name: "associatedTokenProgram",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          name: "ixSysvar",
          address: "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      args: [
        {
          name: "tradeBufferIndex",
          type: "u8"
        },
        {
          name: "tradingPairIndex",
          type: "u8"
        }
      ]
    },
    {
      name: "initialize",
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [
        {
          name: "admin",
          writable: true,
          signer: true
        },
        {
          name: "globalState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "feeBps",
          type: "u16"
        },
        {
          name: "feeRecipient",
          type: "pubkey"
        },
        {
          name: "minimumTimeToExecuteTrade",
          type: "u64"
        }
      ]
    },
    {
      name: "placeTrade",
      discriminator: [102, 39, 166, 38, 98, 171, 190, 242],
      accounts: [
        {
          name: "trader",
          writable: true,
          signer: true
        },
        {
          name: "userBalance",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [117, 115, 101, 114, 95, 98, 97, 108, 97, 110, 99, 101]
              },
              {
                kind: "account",
                path: "trader"
              }
            ]
          }
        },
        {
          name: "orderCounter",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  111, 114, 100, 101, 114, 95, 99, 111, 117, 110, 116, 101, 114
                ]
              }
            ]
          }
        },
        {
          name: "tradeBuffer",
          writable: true
        }
      ],
      args: [
        {
          name: "tradeBufferIndex",
          type: "u8"
        },
        {
          name: "inputMint",
          type: "pubkey"
        },
        {
          name: "outputMint",
          type: "pubkey"
        },
        {
          name: "amountIn",
          type: "u64"
        },
        {
          name: "slippageBps",
          type: "u16"
        }
      ]
    },
    {
      name: "placeWithdrawal",
      discriminator: [21, 207, 64, 248, 217, 33, 240, 135],
      accounts: [
        {
          name: "trader",
          writable: true,
          signer: true
        },
        {
          name: "userBalance",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [117, 115, 101, 114, 95, 98, 97, 108, 97, 110, 99, 101]
              },
              {
                kind: "account",
                path: "trader"
              }
            ]
          }
        },
        {
          name: "globalState",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          name: "withdrawalState",
          writable: true
        },
        {
          name: "magicProgram",
          address: "Magic11111111111111111111111111111111111111"
        },
        {
          name: "magicContext",
          writable: true,
          address: "MagicContext1111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "withdrawalStateIndex",
          type: "u8"
        },
        {
          name: "withdrawalTokenMint",
          type: "pubkey"
        },
        {
          name: "withdrawalAmount",
          type: "u64"
        },
        {
          name: "receivers",
          type: {
            vec: "pubkey"
          }
        }
      ]
    },
    {
      name: "processUndelegation",
      discriminator: [196, 28, 41, 206, 48, 37, 51, 167],
      accounts: [
        {
          name: "baseAccount",
          writable: true
        },
        {
          name: "buffer"
        },
        {
          name: "payer",
          writable: true
        },
        {
          name: "systemProgram"
        }
      ],
      args: [
        {
          name: "accountSeeds",
          type: {
            vec: "bytes"
          }
        }
      ]
    },
    {
      name: "repay",
      discriminator: [234, 103, 67, 82, 208, 234, 219, 166],
      accounts: [
        {
          name: "user",
          writable: true,
          signer: true
        },
        {
          name: "globalState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          name: "tradeBuffer",
          writable: true
        },
        {
          name: "swapState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [115, 119, 97, 112, 95, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          name: "userOutTokenAccount",
          writable: true
        },
        {
          name: "vaultOutTokenAccount",
          writable: true
        },
        {
          name: "inputTokenMint"
        },
        {
          name: "outputTokenMint"
        },
        {
          name: "tokenProgram",
          docs: ["SPL program for token transfers"],
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "tokenProgram2022",
          docs: ["SPL program 2022 for token transfers"],
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "tradeBufferIndex",
          type: "u8"
        },
        {
          name: "tradingPairIndex",
          type: "u8"
        }
      ]
    },
    {
      name: "settleDepositOnEr",
      discriminator: [36, 69, 241, 144, 223, 214, 183, 131],
      accounts: [
        {
          name: "payer",
          writable: true,
          signer: true
        },
        {
          name: "userBalance",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [117, 115, 101, 114, 95, 98, 97, 108, 97, 110, 99, 101]
              },
              {
                kind: "arg",
                path: "user"
              }
            ]
          }
        },
        {
          name: "depositState",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  100, 101, 112, 111, 115, 105, 116, 95, 115, 116, 97, 116, 101
                ]
              },
              {
                kind: "arg",
                path: "user"
              },
              {
                kind: "arg",
                path: "nonce"
              }
            ]
          }
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        },
        {
          name: "magicProgram",
          address: "Magic11111111111111111111111111111111111111"
        },
        {
          name: "magicContext",
          writable: true,
          address: "MagicContext1111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "creator",
          type: "pubkey"
        },
        {
          name: "nonce",
          type: "u64"
        }
      ]
    },
    {
      name: "settleTradeOnEr",
      discriminator: [107, 193, 168, 150, 146, 251, 34, 187],
      accounts: [
        {
          name: "user",
          signer: true
        },
        {
          name: "tradeBuffer",
          writable: true
        }
      ],
      args: [
        {
          name: "tradeBufferIndex",
          type: "u8"
        }
      ]
    },
    {
      name: "settleWithdrawalOnL1",
      discriminator: [253, 79, 144, 187, 14, 111, 201, 206],
      accounts: [
        {
          name: "signer",
          writable: true,
          signer: true
        },
        {
          name: "withdrawalState",
          writable: true
        },
        {
          name: "globalState",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          name: "vaultTokenAccount",
          writable: true
        },
        {
          name: "inputTokenMint"
        },
        {
          name: "tokenProgram",
          docs: ["SPL program for token transfers"],
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          name: "tokenProgram2022",
          docs: ["SPL program 2022 for token transfers"],
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          name: "systemProgram",
          address: "11111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "withdrawalStateIndex",
          type: "u8"
        }
      ]
    },
    {
      name: "undelegateTradeBuffer",
      discriminator: [176, 126, 251, 200, 110, 147, 66, 2],
      accounts: [
        {
          name: "signer",
          signer: true
        },
        {
          name: "globalState",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [103, 108, 111, 98, 97, 108, 95, 115, 116, 97, 116, 101]
              }
            ]
          }
        },
        {
          name: "tradeBuffer",
          writable: true
        },
        {
          name: "magicProgram",
          address: "Magic11111111111111111111111111111111111111"
        },
        {
          name: "magicContext",
          writable: true,
          address: "MagicContext1111111111111111111111111111111"
        }
      ],
      args: [
        {
          name: "tradeBufferIndex",
          type: "u8"
        }
      ]
    }
  ],
  accounts: [
    {
      name: "depositState",
      discriminator: [203, 5, 16, 65, 63, 206, 55, 194]
    },
    {
      name: "globalState",
      discriminator: [163, 46, 74, 168, 216, 123, 133, 98]
    },
    {
      name: "orderCounter",
      discriminator: [124, 210, 2, 119, 178, 200, 59, 95]
    },
    {
      name: "swapState",
      discriminator: [118, 229, 237, 67, 28, 174, 19, 149]
    },
    {
      name: "tradeBuffer",
      discriminator: [155, 23, 123, 26, 64, 144, 140, 17]
    },
    {
      name: "userBalance",
      discriminator: [187, 237, 208, 146, 86, 132, 29, 191]
    },
    {
      name: "withdrawalState",
      discriminator: [147, 152, 68, 7, 82, 25, 255, 177]
    }
  ],
  events: [
    {
      name: "depositEvent",
      discriminator: [120, 248, 61, 83, 31, 142, 107, 144]
    },
    {
      name: "tradePlacedEvent",
      discriminator: [5, 7, 252, 166, 29, 148, 233, 169]
    },
    {
      name: "tradeSettledEvent",
      discriminator: [20, 94, 31, 101, 105, 148, 236, 120]
    },
    {
      name: "tradesExecutedEvent",
      discriminator: [213, 111, 183, 96, 28, 108, 242, 246]
    },
    {
      name: "withdrawalPlacedEvent",
      discriminator: [37, 216, 131, 20, 241, 218, 233, 113]
    }
  ],
  errors: [
    {
      code: 6000,
      name: "depositAlreadySettled",
      msg: "Deposit already settled"
    },
    {
      code: 6001,
      name: "insufficientBalance",
      msg: "Insufficient balance"
    },
    {
      code: 6002,
      name: "balanceNotFound",
      msg: "Balance not found"
    },
    {
      code: 6003,
      name: "slippageTooHigh",
      msg: "Slippage too high"
    },
    {
      code: 6004,
      name: "tradeBufferNotReady",
      msg: "Trade buffer not ready"
    },
    {
      code: 6005,
      name: "invalidTokenMint",
      msg: "Invalid token mint"
    },
    {
      code: 6006,
      name: "tokenMintAlreadyProcessed",
      msg: "Token mint already processed"
    },
    {
      code: 6007,
      name: "programMismatch",
      msg: "Program mismatch"
    },
    {
      code: 6008,
      name: "invalidInstruction",
      msg: "Invalid instruction"
    },
    {
      code: 6009,
      name: "missingRepay",
      msg: "Missing repay"
    },
    {
      code: 6010,
      name: "cannotBorrowBeforeRepay",
      msg: "Cannot borrow before repay"
    },
    {
      code: 6011,
      name: "incorrectProgramAuthority",
      msg: "Incorrect program authority"
    },
    {
      code: 6012,
      name: "invalidTradingPairIndex",
      msg: "Invalid trading pair index"
    },
    {
      code: 6013,
      name: "tradeNotInProgress",
      msg: "Trade not in progress"
    },
    {
      code: 6014,
      name: "tradingPairsNotSettled",
      msg: "Trading pairs not settled"
    },
    {
      code: 6015,
      name: "tradeNotSettled",
      msg: "Trade not settled"
    },
    {
      code: 6016,
      name: "mathOverflow",
      msg: "Math overflow"
    },
    {
      code: 6017,
      name: "invalidAmount",
      msg: "Invalid amount"
    },
    {
      code: 6018,
      name: "missingUserAccounts",
      msg: "Missing user accounts for settlement"
    },
    {
      code: 6019,
      name: "receiversLengthMustBeLessThanOrEqualTo10",
      msg: "Receivers length must be less than or equal to 10"
    },
    {
      code: 6020,
      name: "insufficientReceivers",
      msg: "Insufficient receivers"
    },
    {
      code: 6021,
      name: "invalidReceiver",
      msg: "Invalid receiver"
    },
    {
      code: 6022,
      name: "invalidTokenAccountOwner",
      msg: "Invalid token account owner"
    }
  ],
  types: [
    {
      name: "depositEvent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "pubkey"
          },
          {
            name: "amount",
            type: "u64"
          },
          {
            name: "tokenMint",
            type: "pubkey"
          },
          {
            name: "nonce",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "depositState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tokenMintWithAmount",
            type: {
              defined: {
                name: "tokenMintWithAmount"
              }
            }
          },
          {
            name: "isClaimed",
            type: "bool"
          }
        ]
      }
    },
    {
      name: "globalState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "admin",
            type: "pubkey"
          },
          {
            name: "feeBps",
            type: "u16"
          },
          {
            name: "feeCollector",
            type: "pubkey"
          },
          {
            name: "newAdminProposal",
            type: {
              option: "pubkey"
            }
          },
          {
            name: "currentTradeId",
            type: "u64"
          },
          {
            name: "minimumTimeToExecuteTradeInSec",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "orderCounter",
      type: {
        kind: "struct",
        fields: [
          {
            name: "orderCounter",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "pendingTrade",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tradeBufferId",
            type: "u64"
          },
          {
            name: "inputTokenMintWithAmount",
            type: {
              defined: {
                name: "tokenMintWithAmount"
              }
            }
          },
          {
            name: "outputTokenMint",
            type: "pubkey"
          },
          {
            name: "slippageBps",
            type: "u16"
          }
        ]
      }
    },
    {
      name: "swapState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "initialOutputTokenAmount",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "tokenMintWithAmount",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tokenMint",
            type: "pubkey"
          },
          {
            name: "amount",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "tradeBuffer",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tradeBufferIndex",
            type: "u8"
          },
          {
            name: "id",
            type: "u64"
          },
          {
            name: "tradingPairs",
            type: {
              vec: {
                defined: {
                  name: "tradingPair"
                }
              }
            }
          },
          {
            name: "createdAt",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "tradePlacedEvent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "pubkey"
          },
          {
            name: "inputTokenMint",
            type: "pubkey"
          },
          {
            name: "inputAmount",
            type: "u64"
          },
          {
            name: "outputTokenMint",
            type: "pubkey"
          },
          {
            name: "slippageBps",
            type: "u16"
          },
          {
            name: "tradeBufferIndex",
            type: "u8"
          },
          {
            name: "tradeId",
            type: "u64"
          },
          {
            name: "newTrade",
            type: "bool"
          }
        ]
      }
    },
    {
      name: "tradeSettledEvent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tradeBufferIndex",
            type: "u8"
          },
          {
            name: "tradeId",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "tradeStatus",
      type: {
        kind: "enum",
        variants: [
          {
            name: "created"
          },
          {
            name: "inProgress"
          },
          {
            name: "settled"
          },
          {
            name: "failed"
          }
        ]
      }
    },
    {
      name: "tradesExecutedEvent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tradeBufferIndex",
            type: "u8"
          },
          {
            name: "tradeId",
            type: "u64"
          }
        ]
      }
    },
    {
      name: "tradingPair",
      type: {
        kind: "struct",
        fields: [
          {
            name: "inputToken",
            type: {
              defined: {
                name: "tokenMintWithAmount"
              }
            }
          },
          {
            name: "outputTokenMint",
            type: "pubkey"
          },
          {
            name: "receivedOutputTokenAmount",
            type: "u64"
          },
          {
            name: "slippageBps",
            type: "u16"
          },
          {
            name: "status",
            type: {
              defined: {
                name: "tradeStatus"
              }
            }
          }
        ]
      }
    },
    {
      name: "userBalance",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bump",
            type: "u8"
          },
          {
            name: "balances",
            type: {
              vec: {
                defined: {
                  name: "tokenMintWithAmount"
                }
              }
            }
          },
          {
            name: "pendingTrades",
            type: {
              vec: {
                defined: {
                  name: "pendingTrade"
                }
              }
            }
          }
        ]
      }
    },
    {
      name: "withdrawalPlacedEvent",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "pubkey"
          },
          {
            name: "withdrawalTokenMint",
            type: "pubkey"
          },
          {
            name: "withdrawalAmount",
            type: "u64"
          },
          {
            name: "receivers",
            type: {
              vec: "pubkey"
            }
          },
          {
            name: "withdrawalStateIndex",
            type: "u8"
          }
        ]
      }
    },
    {
      name: "withdrawalState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "tokenMintWithAmount",
            type: {
              defined: {
                name: "tokenMintWithAmount"
              }
            }
          },
          {
            name: "receivers",
            type: {
              vec: "pubkey"
            }
          }
        ]
      }
    }
  ]
}
