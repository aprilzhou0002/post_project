import express from "express";
import session from "express-session";
import passport from "./middleware/passport";
import expressLayouts from "express-ejs-layouts";

declare global {
  namespace Express {
      interface User {
          id: number;
          uname: string;
          password: string;       
      }
  }
}

declare global {
  namespace Express {
    interface Post {
      id: number;
      title: string;
      description: string;
      creator: number;
      subgroup: string;
      timestamp: number;
    }
  }
}

declare global {
  namespace Express {
    interface Comment {
      id: number;
      post_id: number;
      creator: number;
      description: string;
      timestamp: number;
    }
  }
}

const PORT = process.env.PORT || 8000;

const app = express();

app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use(express.static("public"));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // HTTPS Required
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

import indexRoute from "./routers/indexRoute";
import authRoute from "./routers/authRoute";
import postsRoute from "./routers/postRouters";
import subsRouters from "./routers/subsRouters";

app.use(express.json());
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next)=>{
  res.locals.user =req.user;
  res.locals.logged =true;
  res.locals.home =true;
  next();
});

app.use("/auth", authRoute);
app.use("/posts", postsRoute);
app.use("/subs", subsRouters);
app.use("/", indexRoute);

app.listen(PORT, () =>
  console.log(`server should be running at http://localhost:${PORT}/`)
);
