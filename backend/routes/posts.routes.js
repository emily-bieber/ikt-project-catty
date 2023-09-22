const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const upload = require("../middleware/upload");
const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.createConnection(process.env.DB_CONNECTION, {
  dbName: "catty_db",
});

const webpush = require("web-push");

const publicVapidKey =
  "BPZb3FBBEzfckB0qMpLE8KWjvMBTOpfKFdgL-ShFCNJ_jZxVgwfsf5fJgUUhrUPjz2mdt4yvENj7vboBIWClmJI";
const privateVapidKey = "Grkzt9cEP-VkAPieuZMojodVT2iMchtocgFQ-0fX8I0";
const pushSubscription = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/cMdUtRW4H9o:APA91bG8p3o-Ta31e1yMrqdvonJCyf3xbPfIFtpS2UbX9PcJwkeNKoQjZhEAWo5nad7eR3NgRQR8__3wk591j7DKWJLGzwWgJYm_GgipU0gTvMRpWA6TpmCtrD9OCo1mB0jZQrTj5a_5",
  keys: {
    auth: "fJRvyO_fnPXsYeDkMy_jAA",
    p256dh:
      "BDhH_TBG4l-PU3wJnT6wHqsPeYusbPqOiw7VvJvupXDC3JZOIIOiz2Ml8ZaZD9wJuGnXs9BFqINEzrFStsjkk6c",
  },
};

function sendNotification() {
  webpush.setVapidDetails(
    "mailto:emily.bieber@student.htw-berlin.de",
    publicVapidKey,
    privateVapidKey
  );
  const payload = JSON.stringify({
    title: "New Push Notification",
    content: "New data in database!",
  });
  webpush
    .sendNotification(pushSubscription, payload)
    .catch((err) => console.error(err));
  console.log("push notification sent");
  // res.status(201).json({ message: 'push notification sent'});
}

/* ----------------- POST ---------------------------- */

// POST one post
router.post('/', upload.single('file'), async(req, res) => {
    if(req.file === undefined)
    {
        return res.send({
            "message": "no file selected"
        })
    } else {
        const newPost = new Post({
          title: req.body.title,
          text: req.body.text,
          date: req.body.date,
          image_id: req.file.filename,
        });
        console.log(req.body.title);
        console.log('newPost', newPost)
        await newPost.save();
        sendNotification();
        return res.send(newPost)
    }
})

/* ----------------- GET ---------------------------- */

function getOnePost(id) {
    return new Promise( async(resolve, reject) => {
        try {
            const post = await Post.findOne({ _id: id });
            let fileName = post.image_id;
            const files = connection.collection('posts.files');
            const chunks = connection.collection('posts.chunks');

            const cursorFiles = files.find({filename: fileName});
            const allFiles = await cursorFiles.toArray();
            const cursorChunks = chunks.find({files_id : allFiles[0]._id});
            const sortedChunks = cursorChunks.sort({n: 1});
            let fileData = [];
            for await (const chunk of sortedChunks) {
                fileData.push(chunk.data.toString('base64'));
            }
            let base64file = 'data:' + allFiles[0].contentType + ';base64,' + fileData.join('');
            let getPost = new Post({
                "title": post.title,
                "text": post.text,
                "date": post.date, 
                "image_id": base64file
            });
            //console.log('getPost', getPost)
            resolve(getPost)
        } catch {
            reject(new Error("Post does not exist!"));
        }
    })
}

function getAllPosts() {
	return new Promise( async(resolve, reject) => {
		const sendAllPosts = [];
		const allPosts = await Post.find();
		try {
			for(const post of allPosts) {
				// console.log('post', post)
				const onePost = await getOnePost(post._id);
				sendAllPosts.push(onePost);
			}
			// console.log('sendAllPosts', sendAllPosts)
			resolve(sendAllPosts)
		} catch {
				reject(new Error("Posts do not exist!"));
    }
	});
}

// GET one post via id
router.get('/:id', async(req, res) => {
    getOnePost(req.params.id)
    .then( (post) => {
        console.log('post', post);
        res.send(post);
    })
    .catch( () => {
        res.status(404);
        res.send({
            error: "Post does not exist!"
        });
    })
});

// GET all posts
router.get('/', async(req, res) => {
    getAllPosts()
    .then( (posts) => {
        res.send(posts);
    })
    .catch( () => {
        res.status(404);
        res.send({
            error: "Posts do not exist!"
        });
    })
});

/* ----------------- PATCH ---------------------------- */

// PATCH (update) one plant
// router.patch("/:id", async (req, res) => {
//   try {
//     const id_obj = new ObjectId(req.params.id);
//     const plant = await collection.findOne({ _id: id_obj });

//     if (req.body.name) {
//       plant.name = req.body.name;
//     }

//     if (req.body.art) {
//       plant.art = req.body.art;
//     }

//     await collection.updateOne({ _id: id_obj }, { $set: plant });
//     res.send(plant);
//   } catch {
//     res.status(404);
//     res.send({ error: "plant does not exist!" });
//   }
// });

/* ----------------- DELETE ---------------------------- */

// DELETE one post via id
router.delete('/:id', async(req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id })
        let fileName = post.image_id;
        await Post.deleteOne({ _id: req.params.id });
        await collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {
            await collectionChunks.deleteMany({files_id : docs[0]._id});
        })
        await collectionFiles.deleteOne({filename: fileName});
        res.status(204).send("deleted")
    } catch {
        res.status(404)
        res.send({ error: "Post does not exist!" })
    }
});


module.exports = router;
