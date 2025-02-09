const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db();
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
}
//check get
app.get('/', async(req,res)=>{
    res.send("Please visit https://tanvir-asif.web.app");
})
// Get Personal Details
app.get("/personal", async (req, res) => {
    try {
        const personalDetails = await db.collection("personal").findOne({});
        res.json(personalDetails || {});
    } catch (error) {
        res.status(500).json({ message: "Error fetching personal details" });
    }
});

//Update Personal Details (Admin Panel)
app.put("/personal", async (req, res) => {
    try {
        const { name, email, phone, address, bio } = req.body;
        const updateData = { name, email, phone, address, bio };
        const result = await db.collection("personal").updateOne({}, { $set: updateData }, { upsert: true });
        res.json({ message: "Personal details updated" });
    } catch (error) {
        res.status(500).json({ message: "Error updating personal details" });
    }
});

// 3️⃣ **Get All Projects**
app.get("/projects", async (req, res) => {
    try {
        const projects = await db.collection("projects").find().toArray();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "Error fetching projects" });
    }
});

//Add a Project (Admin Panel)
app.post("/projects", async (req, res) => {
    try {
        const { title, description, image, link, repo } = req.body;
        const newProject = { title, description,image, link, repo, createdAt: new Date() };
        await db.collection("projects").insertOne(newProject);
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: "Error adding project" });
    }
});

//Update a Project (Admin Panel)
app.put("/projects/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, link, image, repo } = req.body;
        const result = await db.collection("projects").updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, description, link, image, repo } }
        );
        res.json({ message: "Project updated" });
    } catch (error) {
        res.status(500).json({ message: "Error updating project" });
    }
});

//Delete a Project (Admin Panel)
app.delete("/projects/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.collection("projects").deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.json({ message: "Project deleted" });
        } else {
            res.status(404).json({ message: "Project not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting project" });
    }
});

// Start Server
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
