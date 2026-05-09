import "./config.js"
import connectToDB from "./db/index.js"
import { app } from "./app.js"
const port = process.env.PORT
connectToDB()
    .then(() => {
        app.on("error", (error) => {
            console.log('Error', error)
            throw error
        })
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        })
    })
    .catch((err) => {
        console.log("Mongodb connection faild", err);

    })