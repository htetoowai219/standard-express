import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connectionResponse = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("DB connected successfully : ", connectionResponse.connection.host);
    } catch(error) {
        console.error("DB connection error :", error);
        process.exit(1);
    }
}