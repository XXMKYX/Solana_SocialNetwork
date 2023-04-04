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

import { Toast } from "react-hot-toast"; //notify

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
  const [UserAccount, setUserAccount] = useState(); //Save user account to fetch
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  useEffect(() => {
    //Run when on create on upload on delete an component
    if (connection) {
      setProgram(getProgram(connection, wallet ?? {})); //Acces to the program, if not wallet,  ?? {} return empty
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
    if (!program) return;
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

  //Check for user account
  useEffect(() => {
    fetchUserAccount();
  }, [isConnected]);

  return (
    <GlobalContext.Provider
      value={{
        program,
      }} //will be able to be passed on anywhere
    >
      {children}
    </GlobalContext.Provider>
  );
};
