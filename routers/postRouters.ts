// @ts-nocheck
import express from "express";
import * as database from "../controller/postController";
import * as db from "../fake-db";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";

router.get("/", async (req, res) => {
  const rawPosts = await database.getPosts(20);
  // encapsulate the post data as the way declared in fake-db.decoratePost
  // so that we can access to creator, votes and comments
  const posts = rawPosts.map(db.decoratePost);

  const user = await req.user;
  res.render("posts", { posts, user, home: false });
});

router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("createPosts");
});

router.post("/create", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    // use await for the resolution of the Promise and then extract the user details.
    const user = await req.user;
    const { title, link, description, subgroup } = req.body;
    const creator = user.id;
    const newPost = await db.addPost(
      title,
      link,
      creator,
      description,
      subgroup.toLowerCase()
    );
    res.redirect(`/posts/show/${newPost.id}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/show/:postid", async (req, res) => {
  // ⭐ TODO
  function timedate(timestamp) {
    var d = new Date(timestamp);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  }

  try {
    const user = await req.user;

    const postid = req.params.postid;
    const post = await db.getPost(postid);
    // console.log(post)
    // console.log(post.comments)
    if (post.comments.length > 0) {
      const updatedComments = post.comments.map((comment) => {
        // console.log(comment.timestamp);
        comment.timestamp = timedate(comment.timestamp);
        return comment; // Return the updated comment
      });
      console.log(updatedComments)
      res.render("individualPost", {
        post,
        time: timedate(post.timestamp),
        comments: updatedComments,
        user: user,
      });
    } else {
      res.render("individualPost", {
        post,
        time: timedate(post.timestamp),
        comments: undefined,
        user: user
      });
    }

    // console.log (post.comments)
    // console.log (post.comments[0].creator)
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// delete a comment

router.post("/show/:postid/deletecomment", (req, res) => {
  const postid = req.params.postid;
  const commentid = req.body.commentid;

  delete db.comments[commentid];
  res.redirect(`/posts/show/${postid}`);
  // console.log(db.comments)
});

router.get("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    const postid = req.params.postid;
    const post = db.getPost(postid);
    const user = await req.user; // to resolve the Promise user
    if (!post) {
      return res.status(404).send("Post not found");
    }

    console.log(user)
    if (user.id !== post.creator.id) {
      return res
        .status(403)
        .send("You do not have permission to edit this post");
    }
    res.render("createPosts", { post, isEditMode: true });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    const postid = req.params.postid;
    const changes = req.body;
    await db.editPost(postid, changes);
    res.redirect(`/posts/show/${postid}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    const postid = req.params.postid;
    const post = await db.getPost(postid);
    const user = await req.user;
    if (!post) {
      return res.status(404).send("Post not found");
    }
    // Check if the logged-in user is the creator of the post
    if (user.id !== post.creator.id) {
      return res
        .status(403)
        .send("You do not have permission to delete this post");
    }
    res.render("deleteConfirm", { post }); // here to modify
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/delete/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    const postid = req.params.postid;
    const post = await db.getPost(postid);
    const user = await req.user;
    if (!post) {
      return res.status(404).send("Post not found");
    }
    // Check if the logged-in user is the creator of the post
    if (user.id !== post.creator.id) {
      return res
        .status(403)
        .send("You do not have permission to delete this post");
    }
    await db.deletePost(postid);
    res.redirect("/");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post(
  "/comment-create/:postid",
  ensureAuthenticated,
  async (req, res) => {
    // ⭐ TODO
    try {
      const postid = req.params.postid;
      const { description } = req.body;
      const creator = req.user.id;
      await db.addComment(postid, creator, description);
      res.redirect(`/show/${postid}`);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

export default router;
