import { data } from "../static/data";
import Layout from "../components/Layout";
import Stories from "../components/stories/Stories";
import HomeRightBar from "../components/HomeRightBar";
import FeedItem from "../components/feed/Item";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

import EditPostModal from "../components/modals/EditPostModal";
import CreatePostModal from "../components/modals/CreatePostModal";
import { useGlobalState } from "../hooks";

const style = {
  container: `homepage-feed lg:mr-8 flex flex-col`,
};

export default function Home() {
  // States to grab the post and open modals
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [currentEditPostID, setCurrentEditPostID] = useState(null);

  const {posts} = useGlobalState()
  
   console.log(posts)
  //Quit comments just to see and verify get the program, after that comment next lines
  
  //const { program } = useGlobalState(); //This is to verify the two nexr lines
  //console.log("THIS IS MY PROGRAM: ", program);
  //console.log("THIS IS MY PROGRAM INSTRUCTIONS: ", program.instruction);

  // Function to target which post is being edited
  const toggleEditPostModal = (value, postId, owner) => {
    setCurrentEditPostID(postId);
    //Open modal
    setEditPostModalOpen(value);
  };

  //Static Data xample
  const wallet = "111111111111111111";

  const staticPosts = [
    {
      owner: 11111111111,
      id: 0,
      likes: 0,
      title: "Merry Christmas 🎄",
      image:
        "https://images.unsplash.com/photo-1605744435343-bd38c8e97892?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    },
    {
      owner: "Ac1nbnsdj1",
      id: 1,
      likes: 0,
      title: "Another day!",
      image:
        "https://images.unsplash.com/photo-1482575832494-771f74bf6857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    },
    {
      owner: "rafeh.qazi",
      id: 2,
      likes: 0,
      title: "Can't wait to show you the new videos I've been planning! 💡",
      image: "https://miro.medium.com/max/720/1*JpmEinPoAm4snR5fFa_dkQ.jpeg",
    },
  ];

  const staticCreatePost = () => {
    console.log(`Creating Post!!`);
  };

  return (
    <Layout setCreatePostModalOpen={setCreatePostModalOpen}>
      <Toaster position="top-center" reverseOrder={false} />
      <div className={style.container}>
        <Stories stories={data.stories} />

        <>
          {/* Render posts */}
          {posts
            ? posts.map((post, i) => (
                <FeedItem
                  data={post}
                  key={i}
                  walletKey={wallet?.publicKey}
                  setEditPostModalOpen={setEditPostModalOpen}
                  toggleEditPostModal={toggleEditPostModal}
                />
              ))
            : "Loading..."}
        </>
        <CreatePostModal
          createPost={staticCreatePost}
          createPostModalOpen={createPostModalOpen}
          setCreatePostModalOpen={setCreatePostModalOpen}
        />
        <EditPostModal
          editPostModalOpen={editPostModalOpen}
          setEditPostModalOpen={setEditPostModalOpen}
          currentEditPostID={currentEditPostID}
        />
      </div>
      <HomeRightBar data={data.suggestions} />
    </Layout>
  );
}
