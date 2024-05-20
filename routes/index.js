var express = require('express');
var router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local');
const userModel = require('./users');
const postModel = require('./posts');
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer");
const utils = require('../utils/utils');
const storyModel = require('./story');

// GET
router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/like/:postid', async function(req, res) {
  const post = await postModel.findOne({_id: req.params.postid});
  const user = await userModel.findOne({username: req.session.passport.user});
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.json(post);
});

router.get('/feed', isLoggedIn, async function(req, res) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts")

  let posts = await postModel
  .find()
  .populate("user");

  let story = await storyModel.find().populate('user');

  res.render('feed', {footer: true, user, story, posts, dater: utils.formatRelativeTime});
});

router.get('/profile', isLoggedIn, async function(req, res) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
  .populate("posts");

  res.render('profile', {footer: true, user});
});

router.get('/profile/:user', isLoggedIn, async function(req, res) {
  let user = await userModel
  .findOne({username: req.session.passport.user})

  if(user.username === req.params.user){
    res.redirect("/profile");
  }
  
  let userprofile = await userModel
  .findOne({username: req.params.user})
  .populate("posts");

  res.render('userprofile', {footer: true, userprofile, user});
});

//storyfetching
router.get('/story/:sortyid',async (req, res) => {
  const user = await userModel.findOne({_id: req.params.sortyid}).populate("stories")
  res.json(user)
  
})

router.get('/follow/:userid', isLoggedIn, async function(req, res) {
  let followKarneWaala = await userModel
  .findOne({username: req.session.passport.user})
  
  let followHoneWaala = await userModel
  .findOne({_id: req.params.userid})

  if(followKarneWaala.following.indexOf(followHoneWaala._id) !== -1){
    let index = followKarneWaala.following.indexOf(followHoneWaala._id);
    followKarneWaala.following.splice(index, 1);

    let index2 = followHoneWaala.followers.indexOf(followKarneWaala._id);
    followHoneWaala.followers.splice(index2, 1);
  }
  else{
    followHoneWaala.followers.push(followKarneWaala._id);
    followKarneWaala.following.push(followHoneWaala._id);
  }

  await followHoneWaala.save();
  await followKarneWaala.save();

  res.redirect("back");
});

router.get('/search', isLoggedIn, async function(req, res) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
  res.render('search', {footer: true, user});
});

router.get('/search/:user', isLoggedIn, async function(req, res) {
  const searchTerm = `^${req.params.user}`;
  const regex = new RegExp(searchTerm);
  
  let users = await userModel
  .find({username: { $regex: regex } })

  res.json(users);
});

router.get('/edit', isLoggedIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('edit', {footer: true, user});
});

router.get('/upload', isLoggedIn, async function(req, res) {
  let user = await userModel
  .findOne({username: req.session.passport.user})
  res.render('upload', {footer: true, user});
});

router.post('/update', isLoggedIn, async function(req, res) {
  const user = await userModel.findOneAndUpdate({username: req.session.passport.user}, {username: req.body.username, name: req.body.name, bio: req.body.bio}, {new: true});
  req.login(user, function(err){
    if(err) throw err;
    res.redirect("/profile");
  });
});

router.post('/post', isLoggedIn, upload.single("image"), async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  if(req.body.uploadkaro == 'post'){

    const post = await postModel.create({
      user: user._id,
      caption: req.body.caption,
      picture: req.file.filename,
    })
    user.posts.push(post._id);
    await user.save();
  }
  else{
    const story = await storyModel.create({
      picture: req.file.filename,
      caption: req.body.caption,
      user : user._id,
    })
    user.stories.push(story._id);
    await user.save();
  }
  res.redirect("/feed");
});

router.post('/upload', isLoggedIn, upload.single('image'), async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImg = req.file.filename;
  await user.save();
  res.redirect('/edit');
});

// POST





//story like
router.get('/storylike/:storyid', async (req, res) => {
  const story = await storyModel.findOne({_id: req.params.storyid})
  const user = await userModel.findOne({username: req.session.passport.user})

  if(story.likes.indexOf(user._id) === -1 ){
    story.likes.push(user._id);
  }else{
    story.likes.splice(story.likes.indexOf(user._id), 1);
  }

  await story.save();

  const storynow = await storyModel.findOne({_id: req.params.storyid}).populate('likes')

  res.json(storynow);
})


router.post('/register', function(req, res) {
  const user = new userModel({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name
  })

  userModel.register(user, req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/feed",
  failureRedirect: "/login"
}), function(req, res){});

router.get("/logout", function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})


router.get('/saveposts/:savepostid',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user});
  if(user.saved.includes(req.params.savepostid)){
    user.saved.splice(user.saved.indexOf(req.params.savepostid), 1);
  }
  else{
    user.saved.push(req.params.savepostid)
  }
    await user.save();
  res.json(user)
});

router.get('/saveposts',isLoggedIn,async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user}).
  populate( {path:'saved',
  populate:{path:"user"} }).exec();

  const savedPostDets  = user.saved.map((post) => (post))
  console.log(savedPostDets);



  res.render('saved.ejs',{footer:true, user, savedPostDets })
})
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect("/login");
  }
}





module.exports = router;
