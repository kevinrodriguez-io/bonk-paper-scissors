export type BonkPaperScissors = {
  "version": "0.1.0",
  "name": "bonk_paper_scissors",
  "instructions": [
    {
      "name": "firstPlayerMove",
      "docs": [
        "Player one creates the game, providing the first hash (choice + salt)."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bpsSettings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bpsTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "firstPlayerHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "cancelGame",
      "docs": [
        "Cancels a game and returns the funds to the first player."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "secondPlayerMove",
      "docs": [
        "Player two starts the game, providing the second hash (choice + salt)."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondPlayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bpsSettings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bpsTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "secondPlayerHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "reveal",
      "docs": [
        "This involves some hashing magic, but I'm a wizard ;)."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "choice",
          "type": {
            "defined": "Choice"
          }
        },
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "claim",
      "docs": [
        "After both players have revealed, the game can be claimed."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bpsSettings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "firstPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "testHashing",
      "accounts": [],
      "args": [
        {
          "name": "choice",
          "type": "u8"
        },
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "adminUnwindStaleGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initBpsSettings",
      "accounts": [
        {
          "name": "bpsSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "timeForPenalization",
          "type": "i64"
        },
        {
          "name": "gameFeeLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateBpsSettings",
      "accounts": [
        {
          "name": "bpsSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "timeForPenalization",
          "type": "i64"
        },
        {
          "name": "playerFeeLamports",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bpsSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "timeForPenalization",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "playerFeeLamports",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "gameId",
            "type": "string"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "amountToMatch",
            "type": "u64"
          },
          {
            "name": "firstPlayer",
            "type": "publicKey"
          },
          {
            "name": "firstPlayerHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "firstPlayerEscrowAddress",
            "type": "publicKey"
          },
          {
            "name": "firstPlayerChoice",
            "type": {
              "option": {
                "defined": "Choice"
              }
            }
          },
          {
            "name": "firstPlayerRevealedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "secondPlayer",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "secondPlayerHash",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "secondPlayerEscrowAddress",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "secondPlayerChoice",
            "type": {
              "option": {
                "defined": "Choice"
              }
            }
          },
          {
            "name": "secondPlayerRevealedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "loser",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "amountWon",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "amountBurned",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "drawnAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "gameState",
            "type": {
              "defined": "GameState"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Choice",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Bonk"
          },
          {
            "name": "Paper"
          },
          {
            "name": "Scissors"
          }
        ]
      }
    },
    {
      "name": "GameState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CreatedAndWaitingForStart"
          },
          {
            "name": "StartedAndWaitingForReveal"
          },
          {
            "name": "FirstPlayerWon"
          },
          {
            "name": "SecondPlayerWon"
          },
          {
            "name": "Draw"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidGameState",
      "msg": "Invalid Game State"
    },
    {
      "code": 6001,
      "name": "PlayerAlreadyMoved",
      "msg": "Player already moved"
    },
    {
      "code": 6002,
      "name": "InvalidPlayer",
      "msg": "Invalid Player"
    },
    {
      "code": 6003,
      "name": "InvalidHash",
      "msg": "Invalid Hash"
    },
    {
      "code": 6004,
      "name": "FirstPlayerCantJoinAsSecondPlayer",
      "msg": "First Player Can't Join as Second Player"
    },
    {
      "code": 6005,
      "name": "AmountExceedsBalance",
      "msg": "Amount exceeds balance"
    }
  ]
};

export const IDL: BonkPaperScissors = {
  "version": "0.1.0",
  "name": "bonk_paper_scissors",
  "instructions": [
    {
      "name": "firstPlayerMove",
      "docs": [
        "Player one creates the game, providing the first hash (choice + salt)."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bpsSettings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bpsTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "gameId",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "firstPlayerHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "cancelGame",
      "docs": [
        "Cancels a game and returns the funds to the first player."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "secondPlayerMove",
      "docs": [
        "Player two starts the game, providing the second hash (choice + salt)."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "secondPlayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "bpsSettings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bpsTreasury",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "secondPlayerHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "reveal",
      "docs": [
        "This involves some hashing magic, but I'm a wizard ;)."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "choice",
          "type": {
            "defined": "Choice"
          }
        },
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "claim",
      "docs": [
        "After both players have revealed, the game can be claimed."
      ],
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bpsSettings",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "firstPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "testHashing",
      "accounts": [],
      "args": [
        {
          "name": "choice",
          "type": "u8"
        },
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "adminUnwindStaleGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "firstPlayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "secondPlayer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initBpsSettings",
      "accounts": [
        {
          "name": "bpsSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "timeForPenalization",
          "type": "i64"
        },
        {
          "name": "gameFeeLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateBpsSettings",
      "accounts": [
        {
          "name": "bpsSettings",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "timeForPenalization",
          "type": "i64"
        },
        {
          "name": "playerFeeLamports",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bpsSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "timeForPenalization",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "playerFeeLamports",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "gameId",
            "type": "string"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "amountToMatch",
            "type": "u64"
          },
          {
            "name": "firstPlayer",
            "type": "publicKey"
          },
          {
            "name": "firstPlayerHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "firstPlayerEscrowAddress",
            "type": "publicKey"
          },
          {
            "name": "firstPlayerChoice",
            "type": {
              "option": {
                "defined": "Choice"
              }
            }
          },
          {
            "name": "firstPlayerRevealedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "secondPlayer",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "secondPlayerHash",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "secondPlayerEscrowAddress",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "secondPlayerChoice",
            "type": {
              "option": {
                "defined": "Choice"
              }
            }
          },
          {
            "name": "secondPlayerRevealedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "loser",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "amountWon",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "amountBurned",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "drawnAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "gameState",
            "type": {
              "defined": "GameState"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Choice",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Bonk"
          },
          {
            "name": "Paper"
          },
          {
            "name": "Scissors"
          }
        ]
      }
    },
    {
      "name": "GameState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "CreatedAndWaitingForStart"
          },
          {
            "name": "StartedAndWaitingForReveal"
          },
          {
            "name": "FirstPlayerWon"
          },
          {
            "name": "SecondPlayerWon"
          },
          {
            "name": "Draw"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidGameState",
      "msg": "Invalid Game State"
    },
    {
      "code": 6001,
      "name": "PlayerAlreadyMoved",
      "msg": "Player already moved"
    },
    {
      "code": 6002,
      "name": "InvalidPlayer",
      "msg": "Invalid Player"
    },
    {
      "code": 6003,
      "name": "InvalidHash",
      "msg": "Invalid Hash"
    },
    {
      "code": 6004,
      "name": "FirstPlayerCantJoinAsSecondPlayer",
      "msg": "First Player Can't Join as Second Player"
    },
    {
      "code": 6005,
      "name": "AmountExceedsBalance",
      "msg": "Amount exceeds balance"
    }
  ]
};
