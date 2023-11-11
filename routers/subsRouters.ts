// const { ensureAuthenticated } = require("../middleware/checkAuth");
import express from "express";
import * as database from "../controller/postController";
import * as db from "../fake-db";
const router = express.Router();

router.get("/list", async (req, res) => {
  
  let subs= db.getSubs() 
  res.render("subs", {subs:subs.sort(),subgroup:false});
  
});

router.get("/show/:subname", async (req, res) => {
  // ⭐ TODO
  const subname = req.params.subname;
  
  const rawPosts=db.getPosts(5,subname)
  let subposts=rawPosts.map(db.decoratePost)
  // console.log(subposts)
  res.render("sub",{posts:subposts});
});

export default router;
