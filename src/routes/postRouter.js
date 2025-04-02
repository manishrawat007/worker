const express = require('express')
const { auth } = require('../middleware/adminAuth');
const Posts = require('../models/posts');
const multer = require('multer');
const path = require('path');
const postRouter = express.Router()
const mongoose = require('mongoose');
const User = require('../models/users');

// upload a image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

postRouter.post('/post/upload', upload.single('image'), auth, async (req, res) => {

    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const { message } = req.body
    const imageUrl = req.file
        ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        : undefined;
    try {
        const userPosts = await Posts.findOne({ userId: req.user._id })
        if (userPosts) {
            userPosts.profile.push({
                url: imageUrl,
                isArchieve: false,
                message: message
            });
            const updatedPhotos = await userPosts.save();
            return res.status(200).json({
                message: 'Image added successfully!',
                data: updatedPhotos,
            });
        } else {
            const newPhoto = new Posts({
                userId: req.user._id,
                profile: [
                    {
                        id: new mongoose.Types.ObjectId(),
                        url: imageUrl,
                        isArchieve: false,
                        message: message
                    },
                ],
            });

            const savedPhoto = await newPhoto.save();
            return res.status(201).json({
                message: 'User and image added successfully!',
                data: savedPhoto,
            });
        }

    } catch (err) {
        res.status(400).send("Photo is not uploaded" + err.message)
    }
})

// get user profile
postRouter.get('/posts/:id', auth, async (req, res) => {
    const { id } = req.params
    try {
        const posts = await Posts.findOne({ userId: id }).populate('userId', ['firstName', 'lastName', 'profile', 'gender', 'age', 'skills','cover'])
        if (!posts || !posts.profile) {
            const user = await User.findOne({_id:id})
            const { firstName, lastName, email, age, gender, profile, bio, skills,cover } = user
            return res.json({ user: { firstName, lastName, email, age, gender, profile, bio, skills,cover }, profile: [] })
        }
        const filterposts =posts.profile.filter((post) => post.isArchieve==false)

        res.json({ user: posts.userId, profile: filterposts })
    } catch (err) {
        res.status(400).send("Can not find posts " + err.message)
    }
})

//delete a post by post id
postRouter.delete('/post/delete/:id', auth, async (req, res) => {
    const { id } = req.params
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const posts = await Posts.findOne({ userId: req.user._id })
        const remainingImages = posts.profile.filter((image) => image.id != id)
        posts.profile = remainingImages
        await posts.save()
        res.send("Posts deleted Successfully")
    } catch (err) {
        res.status(400).send("User is not deleted " + err.message)
    }
})

// get archieve posts
postRouter.get('/archieve/posts', auth, async (req, res) => {
    try {
        const posts = await Posts.findOne({ userId: req.user._id })
        if(!posts){
            return res.json({posts:[]}) 
        }
        const archievePosts = posts.profile.filter((images) => images.isArchieve == true)
        res.json({ posts: archievePosts })
    } catch (err) {
        res.status(404).json({ message: "No posts found", error: err.message })
    }
})

//archieve or not archive a post
postRouter.patch('/posts/is/archieve/:id', auth, async (req, res) => {
    const { id } = req.params
    const { archieve } = req.body

    try {
        if (!id && !archieve) {
            throw new Error("Payload is incorrect");
        }
        const posts = await Posts.findOne({ userId: req.user._id })
        if(!posts){
            throw new Error("No posts is found by the given Id");
            
        }
        const updatedPost = posts.profile.find((image) => image.id == id)
        updatedPost.isArchieve = archieve
        const index = posts.profile.findIndex(item => item.id === id);
        posts.profile.splice(index, 1, updatedPost)
        await posts.save()
        res.json({ posts })
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
})

module.exports = postRouter