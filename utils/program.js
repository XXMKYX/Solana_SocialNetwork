import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

import { PROGRAM_ID } from "./constants";
//Get SmartContract
export const getProgram = (connection, wallet) => {
  const IDL = require("./idl.json");
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  const program = new Program(IDL, PROGRAM_ID, provider);
  return program;
};

//Get UserAccount intormation by Pubkey
export const getUserAccountPk = async (owner) => { //Communicating with the blockchain
  //Putting the seeds
  return ( 
    await PublicKey.findProgramAddress(
      [Buffer.from("user"), owner.toBuffer()], //Passing the user,owner seeds
      PROGRAM_ID 
    )
  )[0];
};
//Get PostAccount intormation by Pubkey
export const getPostAccountPk = async (owner, id) => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("post"),
        owner.toBuffer(),
        new BN(id).toArrayLike(Buffer, "le", 8),//Read ID
      ],
      PROGRAM_ID
    )
  )[0];
};
//Get LikeAccount intormation by Pubkey
export const getLikeAccountPk = async (owner, id, liker) => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("like"),
        owner.toBuffer(),
        new BN(id).toArrayLike(Buffer, "le", 8),
        liker.toBuffer(),
      ],
      PROGRAM_ID
    )
  )[0];
};
