import OpenAI from "openai";
import mongoose from "mongoose";

require('dotenv').config();


// Body parser middleware
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // dbName: 'clarkebotDB' // Specify the database name
    dbName: "testDB" // DB for testing
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


const openai = new OpenAI(process.env.OPENAI_API_KEY);


    // MongoDB Schema and Model
const threadSchema = await new mongoose.Schema({
    userMessage: String,
    threadId: String,
    messages: [{ role: String, content: String }],
});

// Specify the collection name explicitly
const Thread = await mongoose.model('Thread', threadSchema);


let threads = {};  // In-memory store for threads

const handler = async (req, res) => {
    console.log("Post route hit!!!!!!!!");
    const { userMessage } = req.body;
    let { threadId } = req.body;

        try {
            console.log('Checking for existing thread with threadId:', threadId);
            let thread;

            // create variable for mongoDB thread
            let messageThread = false;

            if (threadId) {
                // find thread in mongoDB
            messageThread = await Thread.findOne({ threadId });

            if(threads[threadId]) {
                thread = threads[threadId];
            } else {
                thread = await openai.beta.threads.create();
                threads[thread.id] = thread;
            }

                console.log('Thread search completed.');
            } else {
                thread = await openai.beta.threads.create();
                threads[thread.id] = thread;
                threadId = thread.id;
            }
            console.log("thread created: ", thread.id)
            if (!messageThread) {
                // create thread for mongoDB
                messageThread = await new Thread({ threadId, messages: [] });
                console.log('New messageThread created: ', messageThread._id);
            }

            const response = await openai.beta.threads.messages.create(
                thread.id,
                {
                    role: "user",
                    content: userMessage
                }
            );

            const run = await openai.beta.threads.runs.createAndPoll(
                thread.id,
                {
                    assistant_id: "asst_a7yxswDj4RqnhRDvT3k0m83Q",
                }
            );

            if (run.status === "completed") {
                console.log("run status completed");
                const messages = await openai.beta.threads.messages.list(
                    run.thread_id
                );

                //Optimize to push the last message to an array instead of sending a brand new array each time.
                const responseMessages = messages.data.reverse().map(msg => ({
                    role: msg.role,
                    content: msg.content[0].text.value
                }));
                threads[thread.id].messages = responseMessages;  // Update the thread with new messages

                //add messages to mongoDB thread
                await messageThread.messages.push({ role: 'user', content: userMessage });
                await messageThread.messages.push(thread.messages[thread.messages.length - 1]);
                console.log("saving thread, ", messageThread._id)




                // // Create and save the test document
                // const test = await new Thread({
                //     userMessage: "Hello",
                //     threadId: "testId",
                //     messages: [{ role: "user", content: "Hello there!"}],
                // });

                // await test.save()
                //     .then(() => console.log('Test thread created'))
                //     .catch(error => console.error('Error creating test thread:', error));
                




                //save thread in mongoDB
                await messageThread.save()




                res.status(200).json({ threadId: thread.id, messages: responseMessages });
            } else {
                res.status(500).json({ error: "Assistant run not completed", status: run.status });
            }

            // Return updated messages to the client
            res.json({ threadId, messages: thread.messages });

        } catch (error) {
            console.error('Error saving thread:', error);
            res.status(500).json({ error: 'Error saving thread' });
        }
};

export default handler;
