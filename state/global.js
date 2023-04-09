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
  const [posts, setPosts] = useState(); //To the xample this is ([])
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

  // -
  const fetchPosts = useCallback(async () => {
    if (!program) return;
    //Feching all the post that exist from the program
    const posts = await program.account.post.all();
    setPosts(posts.map((post) => post.account)); //((post)) map for every post
  }, [program]);
  //Ensure that it's always fetching the posts as it comes or if anything changes
  useEffect(() => {
    if (!posts) {
      fetchPosts();
    }
  }, [posts, fetchPosts]);

  // -Program Events
  useEffect(() => {
    if (!program) return;

    //New Post Event
    const newPostEventListener = program.addEventListener(
      "NewPostEvent", //From SmartContract
      async (postEvent) => {
        try {
          const postAccountPk = await getPostAccountPk(
            postEvent.owner,
            postEvent.id
          );
          //Here the post now is created
          const newPost = await program.account.post.fetch(postAccountPk);
          //The new post gets added to that list post
          setPosts((posts) => [newPost, ...posts]);
        } catch (e) {
          console.log("Couldn't fetch new post account", postEvent, e);
        }
      }
    );

    //Update Post Event
    const updatePostEventListener = program.addEventListener(
      //event we listening for
      "UpdatePostEvent", //From SmartContract
      async (updateEvent) => {
        try {
          const postAccountPk = await getPostAccountPk(
            updateEvent.owner,
            updateEvent.id
          );
          //Here the post now is created
          const updatedPost = await program.account.post.fetch(postAccountPk);
          //The new post gets added to that list post
          setPosts((posts) =>
              posts.map((post) => {
                //for every post
                if (
                  post.owner.equals(updatedPost.owner) &&
                  post.id.eq(updatedPost.id)
                ) {
                  return updatedPost;
                }
                return post;
              }) //mapping through to create
          ); //Seting the post to an array
        } catch (e) {
          console.log("Couldn't fetch update post account", updateEvent, e);
        }
      }
    );

    //Delete Post Event
    const deletePostEventListener = program.addEventListener(
      //event we listening for
      "DeletePostEvent", //From SmartContract
      (deleteEvent) => {
        setPosts((posts) => {
          //Look through the posts and get the matching post
          posts.filter(
            (post) =>
              //Matching with the correct owner and id that I'm clicking on
              !(
                post.owner.equals(deleteEvent.owner) &&
                post.id.eq(deleteEvent.id)
              )
          );
        });
      }
    );

    return () => {
      //remove the event listeners
      program.removeEventListener(newPostEventListener);
      program.removeEventListener(deletePostEventListener);
    };
  }, [program]); //run once if the program ever changes

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

  //Create Post
  const createPost = useCallback(async (title, image) => {
    if (!userAccount) return;
    try {
      const postId = userAccount.lastPostId.addn(1); //Get last post id
      const txHash = await program.methods
        .createPost(title, image, postId)
        .accounts({
          post: await getPostAccountPk(wallet.publicKey, postId.toNumber()),
          user: await getUserAccountPk(wallet.publicKey),
          owner: wallet.publicKey,
        })
        .rpc();
      await connection.confirmTransaction(txHash); //Confirm transaction
      toast.success("Post created!");
      //Update user account
      await fetchUserAccount();
    } catch (e) {
      toast.error("Creating post failed!");
      console.log(e.message);
    }
  });

  const updatePost = useCallback(async (owner, id, title) => {
    if (!userAccount) return;
    try {
      const txHash = await program.methods
        //console.log(txHash)
        .updatePost(title)
        .accounts({
          post: await getPostAccountPk(owner, id),
          owner,
        })
        .rpc();
      toast.success("Caption updated!");
    } catch (e) {
      toast.error("failed to update post!");
      console.log(e.message);
    }
  });

  //Delete Post
  const deletePost = useCallback(async (owner, id) => {
    if (!userAccount) return;
    try {
      const txHash = await program.methods
        .deletePost()
        .accounts({
          post: await getPostAccountPk(owner, id),
          owner,
        })
        .rpc();
      toast.success("Post deleted successfully!");
    } catch (e) {
      toast.error("Failed to delete!");
      console.log(e.message);
    }
  });

  return (
    <GlobalContext.Provider
      //SET

      value={{
        isConnected,
        wallet,
        //Make dinamic the true or false in hasUserAccount
        hasUserAccount: userAccount ? true : false, //If there is a user account it shoul be true
        posts,
        createUser,
        createPost,
        updatePost,
        deletePost,
      }} //will be able to be passed on anywhere
    >
      {children}
    </GlobalContext.Provider>
  );
};
