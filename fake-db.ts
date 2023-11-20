// @ts-nocheck
const users: { [key: number]: Express.User } = {
  1: {
    id: 1,
    uname: "alice",
    password: "alpha",
  },
  2: {
    id: 2,
    uname: "theo",
    password: "123",

  },
  3: {
    id: 3,
    uname: "prime",
    password: "123",
  },
  4: {
    id: 4,
    uname: "leerob",
    password: "123",
  },
  5: { 
    id: 5, 
    uname: "max", 
    password: "max123" 
  },
  6: { 
    id: 6, 
    uname: "sara", 
    password: "sara123" 
  },
};

const posts: { [key: number]: Express.Post } = {
  101: {
    id: 101,
    title: "Mochido opens its new location in Coquitlam this week",
    link: "https://dailyhive.com/vancouver/mochido-coquitlam-open",
    description:
      "New mochi donut shop, Mochido, is set to open later this week.",
    creator: 1,
    subgroup: "food",
    timestamp: 1643648446955,
  },
  102: {
    id: 102,
    title: "2023 State of Databases for Serverless & Edge",
    link: "https://leerob.io/blog/backend",
    description:
      "An overview of databases that pair well with modern application and compute providers.",
    creator: 4,
    subgroup: "coding",
    timestamp: 1642611742010,
  },
  103: {
    id: 103,
    title: "Exploring the New Features of React 18",
    link: "https://reactjs.org/blog/2022/03/29/react-v18.html",
    description: "A deep dive into the latest React version and its capabilities.",
    creator: 5,
    subgroup: "programming",
    timestamp: 1650000000000,
  },
  104: {
    id: 104,
    title: "The Best Hiking Trails in the Pacific Northwest",
    link: "https://hikingtrails.com/pnw",
    description: "Discover breathtaking trails and scenic views in the Pacific Northwest.",
    creator: 6,
    subgroup: "outdoors",
    timestamp: 1650500000000,
  },
};

const comments: { [key: number]: Express.Comment } = {
  9001: {
    id: 9001,
    post_id: 102,
    creator: 1,
    description: "Actually I learned a lot :pepega:",
    timestamp: 1642691742010,
  },
  9002: {
    id: 9002,
    post_id: 103,
    creator: 2,
    description: "Really excited about concurrent features!",
    timestamp: 1650100000000,
  },
  9003: {
    id: 9003,
    post_id: 104,
    creator: 3,
    description: "Can't wait to try these trails!",
    timestamp: 1650600000000,
  },
};

// const votes: Array<{ user_id: number; post_id: number; value: number }> = [
const votes = [
  { user_id: 2, post_id: 101, value: +1 },
  { user_id: 3, post_id: 101, value: +1 },
  { user_id: 4, post_id: 101, value: +1 },
  { user_id: 3, post_id: 102, value: -1 },
  { user_id: 5, post_id: 103, value: +1 },
  { user_id: 6, post_id: 104, value: +1 },
];


const rply: { [key: number]: Express.Rply } = {
  10001: {
    id: 10001,
    post_id: 102,
    creator: 1,
    commentid:9001,
    description: "rply1",
    timestamp: "2023-11-16 3:53:47 p.m.",
  },
  10002: {
    id: 10001,
    post_id: 101,
    creator: 1,
    commentid:9001,
    description: "Test id",
    timestamp: "2023-11-16 3:53:47 p.m.",
  },
  10003: {
    id: 10003,
    post_id: 103,
    creator: 4,
    commentid: 9002,
    description: "I'm also looking forward to it!",
    timestamp: "2023-11-17 10:00:00 a.m.",
  },
  10004: {
    id: 10004,
    post_id: 104,
    creator: 5,
    commentid: 9003,
    description: "These trails are amazing, highly recommend!",
    timestamp: "2023-11-18 2:30:00 p.m.",
  },
};

function debug() {
  console.log("==== DB DEBUGING ====");
  console.log("users", users);
  console.log("posts", posts);
  console.log("comments", comments);
  console.log("votes", votes);
  console.log("==== DB DEBUGING ====");
}

function getUser(id) {
  return users[id];
}

function getUserByUsername(uname: any) {
  return getUser(
    Object.values(users).filter((user) => user.uname === uname)[0].id
  );
}

function getVotesForPost(post_id) {
  return votes.filter((vote) => vote.post_id === post_id);
}

function decoratePost(post) {
  post = {
    ...post,
    creator: users[post.creator],
    votes: getVotesForPost(post.id),
    totalVotes: calculateTotalVotes(post.id),
    comments: Object.values(comments)
      .filter((comment) => comment.post_id === post.id)
      .map((comment) => ({ ...comment, creator: users[comment.creator] })),
    rplies:Object.values(rply).filter((rpl)=>rpl.post_id===post.id).map((rpl)=>({...rpl,creator:users[rpl.creator]}))
  };
  return post;
}

/**
 * @param {*} n how many posts to get, defaults to 5
 * @param {*} sub which sub to fetch, defaults to all subs
 * @param {*} sortBy how to sort the posts ('newest', 'hot', 'top'), defaults to 'newest'
 */
function getPosts(n = 5, sub, sortBy = 'newest') {
  let allPosts = Object.values(posts);

  if (sub) {
    allPosts = allPosts.filter((post) => post.subgroup === sub);
  }

  switch (sortBy) {
    case 'hot':
      allPosts.sort((a, b) => calculateTotalComments(b.id) - calculateTotalComments(a.id));
      break;

    case 'top':
      allPosts.sort((a, b) => (calculateTotalVotes(b.id) - calculateTotalVotes(a.id)));
      break;
    case 'newest':
    default:
      allPosts.sort((a, b) => (b.timestamp - a.timestamp));
  }

  return allPosts.slice(0, n);
}


function getPost(id) {
  return decoratePost(posts[id]);
}

function addPost(title, link, creator, description, subgroup) {
  let id = Math.max(...Object.keys(posts).map(Number)) + 1;
  let post = {
    id,
    title,
    link,
    description,
    creator: Number(creator),
    subgroup,
    timestamp: Date.now(),
  };
  posts[id] = post;
  return post;
}

function editPost(post_id, changes = {}) {
  let post = posts[post_id];
  if (changes.title) {
    post.title = changes.title;
  }
  if (changes.link) {
    post.link = changes.link;
  }
  if (changes.description) {
    post.description = changes.description;
  }
  if (changes.subgroup) {
    post.subgroup = changes.subgroup;
  }
}

function deletePost(post_id) {
  delete posts[post_id];
}

function getSubs() {
  return Array.from(new Set(Object.values(posts).map((post) => post.subgroup)));
}

function addComment(post_id, creator, description) {
  let id = Math.max(...Object.keys(comments).map(Number)) + 1;
  let comment = {
    id,
    post_id: Number(post_id),
    creator: Number(creator),
    description,
    timestamp: Date.now(),
  };
  comments[id] = comment;
  return comment;
}

function editComment(data,commentid){

var temp=comments[commentid]
// console.log(temp)

  temp["description"]=data;
  temp["timestamp"]=Date.now();
  comments[commentid]=temp
  console.log(comments[commentid])
}


function editrply(data,rplyid,time){

  var temp=rply[rplyid]
  // console.log(temp)
  
    temp["description"]=data;
    temp["timestamp"]=time;
    rply[rplyid]=temp
    console.log( rply[rplyid])
  }


function addUser(username, password) {
  const existingUser = Object.values(users).find(user => user.uname === username);
  if (existingUser) {
    throw new Error("Username already taken");
  }
  const id = Math.max(...Object.keys(users).map(Number)) + 1;
  users[id] = {
    id,
    uname: username,
    password,
  };
  return users[id];
}

function addVote(userId, postId, setVoteTo) {
  const existingVote = votes.find(vote => vote.user_id === userId && vote.post_id === postId);

  if (existingVote) {
    if (existingVote.value === setVoteTo) {
      existingVote.value -= setVoteTo;
    } else {
        existingVote.value = setVoteTo;
    }
  } else if (setVoteTo !== 0) {
      votes.push({
          user_id: userId,
          post_id: postId,
          value: setVoteTo
      });
  }
}

function calculateTotalVotes(postId) {
  const postVotes = votes.filter(vote => vote.post_id === postId);
  return postVotes.reduce((total, vote) => total + vote.value, 0);
}

function calculateTotalComments(postId) {
  return Object.values(comments).filter(comment => comment.post_id === postId).length;
}

function addrply(post_id, creator,comment, description,time) {
  let id = Math.max(...Object.keys(rply).map(Number)) + 1;
  let rplydata = {
    id,
    post_id: Number(post_id),
    creator: Number(creator),
    commentid:comment,
    description,
    timestamp: time,
  };
  rply[id] = rplydata;
  // console.log(rplydata)
  return rplydata;
}




export {
  users,
  posts,
  comments,
  votes,
  rply,
  debug,
  getUser,
  getUserByUsername,
  getPosts,
  getPost,
  addPost,
  editPost,
  deletePost,
  getSubs,
  addComment,
  addrply,
  editrply,
  decoratePost,
  addUser,
  addVote,
  editComment
};
