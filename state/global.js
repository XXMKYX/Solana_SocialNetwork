//To use our Context
import { createContext, useCallback, useEffect, useState } from "react";
import { getProgram } from "../utils/program";

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
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
