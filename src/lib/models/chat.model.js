import mongoose, { Schema, models } from "mongoose";

const chatSchema = new Schema(
    {
        userQuestion: {
            type: String,
            required: true
        },
        botAnswer: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    },
    { timestamps: true }
);

const Chat = models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;