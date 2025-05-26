'use server'

import { revalidatePath } from "next/cache";
import User from "@/lib/models/user.model";
import Chat from "@/lib/models/chat.model";
import { connectMongoDB } from "@/lib/db/connectMongoDb";

export async function storeChat(userQuestion, botAnswer, userId) {
    try {

        if (!userQuestion || !botAnswer || !userId) {
            return {
                success: false,
                message: "Missing required parameters"
            }
        }

        if (typeof userQuestion !== 'string' || typeof botAnswer !== 'string') {
            return {
                success: false,
                message: "Question and answer must be strings"
            }
        }

        await connectMongoDB();

        const user = await User.findById(userId);
        if (!user) {
            return {
                success: false,
                message: "User not found"
            }
        }

        const chat = await Chat.create({
            userQuestion: userQuestion.trim(),
            botAnswer: botAnswer.trim(),
            userId
        });

        revalidatePath('/');

        return {
            success: true,
        }
    }
    catch (error) {
        console.error("Error storing chat:", error);

        if (error.name === 'ValidationError') {
            return {
                success: false,
                message: "Invalid data provided",
                error: error.message
            }
        }

        if (error.name === 'CastError') {
            return {
                success: false,
                message: "Invalid user ID format",
                error: error.message
            }
        }

        return {
            success: false,
            message: "Failed to store chat",
            error: error.message
        }
    }
}

export async function deleteChats(userId) {
    try {
        await connectMongoDB();
        const user = await User.findById(userId);
        if (!user) {
            return {
                success: false,
                message: "User not found"
            }
        }
        await Chat.deleteMany({ userId });
    } catch (error) {
        console.error("Error deleting chats:", error);
    }
}