import * as db from "../fake-db";

// Make calls to your db from this file!
async function getPosts(n = 5, sub = undefined, sortBy = 'newest') {
  return db.getPosts(n, sub, sortBy);
}

export { getPosts };
