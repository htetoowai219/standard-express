import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    content : {
        type : String,
        required : true,
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "Post",
    },
}, { timestamps : true });

export const Post = mongoose.model("Post", postSchema);