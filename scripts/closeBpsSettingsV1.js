const anchor = require("@project-serum/anchor");
const { TextEncoder } = require("util");
const fs = require("fs/promises");
const IDL = require("../target/idl/bonk_paper_scissors.json");

const programId = new anchor.web3.PublicKey(
  "32TtZ4MYWk6zzwg8Eok3x6m85JQgcVsN97cGfUhfpNb9"
);

const encode = (str) => new TextEncoder().encode(str);
const b = (input) => encode(input.join(""));
const getBPSSettingsPDAV1 = () =>
  anchor.web3.PublicKey.findProgramAddressSync([b`bps_settings`], programId);

(async () => {
  const privateKey = new Uint8Array(
    JSON.parse(
      await fs.readFile(
        "./bpstzWLPDetyjiD33HPGGE96MzkhEA7dhRFzhc8Ay5R.json",
        "utf8"
      )
    )
  );

  const connection = new anchor.web3.Connection(
    "https://m.bs58.co/ee96b352d21dc67ce350480c63a4ccae493c9784"
  );
  const wallet = new anchor.Wallet(
    anchor.web3.Keypair.fromSecretKey(privateKey)
  );

  const provider = new anchor.AnchorProvider(connection, wallet, {});
  const program = new anchor.Program(IDL, programId, provider);

  const [bpsSettingsPDA] = getBPSSettingsPDAV1();
  const txId = await program.methods
    .closeBpsSettingsV1()
    .accountsStrict({
      bpsSettings: bpsSettingsPDA,
      signer: program.provider.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();
  console.log("txId:", txId);
})();
