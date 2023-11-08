// @ts-nocheck
import express from "express";
import * as database from "../controller/postController";
import * as db from "../fake-db";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";

router.get("/", async (req, res) => {
  const posts = await database.getPosts(20);
  const user = await req.user;
  res.render("posts", { posts, user });
});

router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("createPosts");
});

router.post("/create", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    const { title, link, description, subgroup } = req.body;
    const creator = req.user?.id;
    // const test = req.user((data)=>{console.log(data)}) 
    // console.log(req.user);
    const newPost = db.addPost(title, link, creator, description, subgroup.toLowerCase());
    console.log(db.posts)
    res.redirect('/');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/show/:postid", async (req, res) => {
  // ⭐ TODO
  try {
    const postid = req.params.postid;
    const post = await db.getPost(postid);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.render("individualPost", { post });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/edit/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    const postid = req.params.postid;
    const post = db.getPost(postid);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    // Check if the logged-in user is the creator of the post
    if (req.user.id !== post.creator.id) {
      return res.status(403).send('You do not have permission to edit this post');
    }
    res.render("editPost", { post });
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
    res.redirect(`/show/${postid}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/deleteconfirm/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    const postid = req.params.postid;
    const post = await db.getPost(postid);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    // Check if the logged-in user is the creator of the post
    if (req.user.id !== post.creator.id) {
      return res.status(403).send('You do not have permission to delete this post');
    }
    res.render("deleteConfirm", { post });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/delete/:postid", ensureAuthenticated, async (req, res) => {
  // ⭐ TODO
  try {
    const postid = req.params.postid;
    const post = await db.getPost(postid);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    // Check if the logged-in user is the creator of the post
    if (req.user.id !== post.creator.id) {
      return res.status(403).send('You do not have permission to delete this post');
    }
    await db.deletePost(postid);
    res.redirect('/');
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
