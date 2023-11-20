// @ts-nocheck
import express from "express";
import * as database from "../controller/postController";
import * as db from "../fake-db";
const router = express.Router();
import { ensureAuthenticated } from "../middleware/checkAuth";


function timedate(timestamp) {
  var d = new Date(timestamp);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}

router.get("/", async (req, res) => {
  const sortBy = req.query.sort || 'newest'; 
  const rawPosts = await database.getPosts(20, null, sortBy);
  // encapsulate the post data as the way declared in fake-db.decoratePost
  // so that we can access to creator, votes and comments
  const posts = rawPosts.map(db.decoratePost);

  const user = await req.user;
  res.render("posts", { posts, user, home: false });
});

router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("createPosts",{isEditMode:false,create:false});
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
      // console.log(updatedComments)
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
  const comntid = req.body.commentid;
  console.log(db.getPost(postid))
  Object.keys(db.rply).forEach(element => {
    const temp=db.rply[element]
    if(temp["commentid"]==comntid){
      delete db.rply[element];
    }
    
  });
  console.log(db.getPost(postid))
  delete db.comments[comntid];
  res.redirect(`/posts/show/${postid}`);
  // console.log(db.comments)
});

router.post("/show/:postid/delete-rply", (req, res) => {
  const postid = req.params.postid;
  const rplyid = req.body.rplyid;

  delete db.rply[rplyid];
  res.redirect(`/posts/show/${postid}`);
  // console.log(db.comments)
});

router.post("/show/:postid/Editcomment", (req, res) => {
  const postid = req.params.postid;
  const edittedcomment=req.body.edittedcomment;
  const commentid = req.body.commentid;
  //  console.log(edittedcomment)
  db.editComment(edittedcomment,commentid)
  res.redirect(`/posts/show/${postid}`);
  // console.log(db.comments)
});

router.post("/show/:postid/reply-edit", (req, res) => {
  const postid = req.params.postid;
  const edittedrply=req.body.edittedrply;
  const rplyid = req.body.rplyid;
  //  console.log(edittedcomment)
  db.editrply(edittedrply,rplyid,timedate(Date.now()))
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
      const { commentbox, creatorid } = req.body;
     
      await db.addComment(postid, creatorid, commentbox);
      // console.log(db.comments)
      res.redirect(`/posts/show/${postid}`);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

router.post("/vote/:postId", ensureAuthenticated, async (req, res) => {
  try {
    const user = await req.user; 
    const userId = user?.id;
    const postId = parseInt(req.params.postId);
    const setVoteTo = parseInt(req.body.setvoteto); 

    db.addVote(userId, postId, setVoteTo);

    const referer = req.get('Referer');
    if (referer && referer.endsWith('/posts')) {
      res.redirect('/posts');
    } else {
      res.redirect(`/posts/show/${postId}`);
    }
} catch (error) {
    res.status(500).send(error.message);
}
});



router.post("/show/:postid/reply", (req, res) => {
  const postid = req.params.postid;
  const userid = req.body.userid;
  
  const commentid = parseInt(req.body.commentid);
  const rplyid = req.body.rplyid;
  
  const post = db.getPost(postid);
 
  db.addrply(postid,userid,commentid,rplyid,timedate(Date.now()));
  res.redirect(`/posts/show/${postid}`);
  // console.log(db.rply)
  // console.log(post)
});


export default router;
