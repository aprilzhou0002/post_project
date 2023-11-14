import express from "express";
import passport from "../middleware/passport";
import * as db from "../fake-db";
const router = express.Router();

router.get("/login", async (req, res) => {
  res.render("login",{logged:false});
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/posts",
    failureRedirect: "/auth/login",
  })
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
});

router.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Please enter both username and password");
  }

  // ⭐ TODO: try to add a checker for existing user but failed
  // const existingUser = db.getUserByUsername(username);
  // if (existingUser) {
  //   return res.status(400).send("Username already taken");
  // }

  db.addUser(username, password);
  res.redirect("/auth/login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

export default router;
