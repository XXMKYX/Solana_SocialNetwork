//To use our Context
import { createContext, useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
//Functions from SmartContract (Program)
import {
  getProgram,
  getPostAccountPk,
  getLikeAccountPk,
  getUserAccountPk,
} from "../utils";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { Toast, toast } from "react-hot-toast"; //notify

export const GlobalContext = createContext({
  isConnexted: null,
  wallet: null,
  hasUserAccount: null,
  post: null,
  fetchPosts: null,
  createUser: null,
  createPost: null,
  updatePost: null,
  deletePost: null,
  likePost: null,
  dislikePost: null,
});

export const GlobalState = ({ children }) => {
  const [program, setProgram] = useState(); //Get the program and set it in our state to use anywhere
  const [isConnected, setIsConnected] = useState(); //To check connection
  const [userAccount, setUserAccount] = useState(); //Save user account to fetch
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  useEffect(() => {
    //Run when on create on upload on delete an component
    if (connection) {
      setProgram(getProgram(connection, wallet ?? {})); //Acces to the program, if not wallet,  ?? {} return empty
      //console.log("THIS IS MY PROGRAM: ", program);
    } else {
      setProgram(null);
    }
  }, [connection, wallet]); //if [] will run when the page fist loads, [connection] when connection

  //CREATING USER
  //1- Check wallet connection
  useEffect(() => {
    setIsConnected(!!wallet?.publicKey); //True or false
  }, [wallet]);

  //2- Check for a user account by fetching the user
  const fetchUserAccount = useCallback(async () => {
    console.log("Here the program can be read : ", program);
    //UseCallback is like useEffect but not going to re-render unless the dependency is changed, not re-render all our props
    if (!program) {
      console.log("Program not got it");
      return;
    }
    try {
      //Passing the seeds
      const userAccountPk = await getUserAccountPk(wallet?.publicKey);
      console.log(userAccountPk);
      const userAccount = await program.account.user.fetch(userAccountPk);
      console.log("User found!");
      setUserAccount(userAccount);
    } catch (e) {
      setUserAccount(null);
      console.log("No user found!");
    }
  });
  //3- Check for user account
  useEffect(() => {
    fetchUserAccount();
  }, [isConnected]);
  //4- Create User
  //call the paramet we nedee
  const createUser = useCallback(async () => {
    if (program && wallet.publicKey) {
      //Validation
      try {
        //Calling function from SmartContract
        const txHash = await program.methods
          .createUser()
          //Passing in the accounts it needs right
          .accounts({
            user: await getUserAccountPk(wallet.publicKey),
            owner: wallet.publicKey,
          })
          .rpc();
        await connection.confirmTransaction(txHash); //Confirm transaction
        toast.success("Created user!");
        await fetchUserAccount();
      } catch (e) {
        console.log("Couldn't create user", e.message);
        toast.error("Creating user failed!");
      }
    }
  });
  return (
    <GlobalContext.Provider
      value={{
        isConnected,
        //Make dinamic the true or false in hasUserAccount
        hasUserAccount: userAccount ? true : false, //If there is a user account it shoul be true
        createUser,
      }} //will be able to be passed on anywhere
    >
      {children}
    </GlobalContext.Provider>
  );
};
