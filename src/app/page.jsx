"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Typewriter } from "react-simple-typewriter";
import Loader from "@/components/loader/Loader";
import { SendHorizontal } from "lucide-react";
import prompts from "./randomPrompts";
import { nanoid } from "nanoid";
import { InferenceClient } from "@huggingface/inference";
import { storeChat } from "@/actions/actions";
import Image from "next/image";
import { deleteChats } from "@/actions/actions";

const client = new InferenceClient(
  `${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`
);

const Home = () => {
  const date = new Date();
  const dayOfWeek = date.getDay();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = days[dayOfWeek];
  const { status, data: session } = useSession();

  const [input, setInput] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState({
    error: false,
    loading: false,
    data: [],
  });

  async function botAnswer() {
    const chatCompletion = await client.chatCompletion({
      provider: "hf-inference",
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [
        {
          role: "user",
          content: `${input}`,
        },
      ],
    });
    console.log(chatCompletion.choices[0].message);
    const response = chatCompletion.choices[0].message.content;
    if (!response) {
      return "No response from the bot.";
    }
    return response;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setIsLoading(true);
      const currentInput = input;

      const response = await botAnswer();

      setBotResponse(response);

      const result = await storeChat(currentInput, response, session?.user?.id);
      console.log("Store chat result:", result);
      setInput("");
      fetchChats();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }
  async function fetchChats() {
    setChatHistory({
      error: false,
      loading: true,
      data: [],
    });
    try {
      const response = await fetch(`/api/get-chat?userId=${session?.user?.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }
      const data = await response.json();
      setChatHistory({
        error: false,
        loading: false,
        data,
      });
    } catch (error) {
      console.log(error);
      setChatHistory({
        error: true,
        loading: false,
        data: [],
      });
    }
  }

  async function ClearChats() {
    try {
      await deleteChats(session?.user?.id);
      fetchChats();
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchChats();
    }
  }, [session]);

  if (status === "loading") {
    return <Loader />;
  }

  return (
    <div className="flex flex-col mt-10 items-center">
      {status === "unauthenticated" ? (
        <h1
          className={`text-3xl text-center max-w-2xl text-gray-100 md:text-4xl font-bold mb-6`}
        >
          <Typewriter
            words={[`Welcome to chatGenius, signin and start chatting with AI`]}
            loop={1}
            cursor
            cursorStyle=""
            typeSpeed={30}
          />
        </h1>
      ) : (
        <div className=" flex flex-col gap-5 items-center">
          <h1
            className={`text-4xl text-gray-300 text-center md:text-5xl font-bold`}
          >
            <Typewriter
              words={[
                `Happy ${currentDay} ${session?.user?.name?.split(" ")[0]}.`,
              ]}
              loop={1}
              cursor
              cursorStyle=""
              typeSpeed={30}
            />
          </h1>
          <p className={`text-xl text-gray-100 text-center font-medium`}>
            <Typewriter
              words={[`What would you like to chat about today ?`]}
              loop={1}
              cursor
              cursorStyle=""
              typeSpeed={35}
            />
          </p>
        </div>
      )}

      {chatHistory?.data &&
        (chatHistory?.data.length === 0 ? (
          <div className=" mt-10 flex flex-wrap justify-center gap-5">
            {prompts.map((prompt) => (
              <div
                key={nanoid(10)}
                className=" italic font-light text-center p-5 flex flex-row justify-center items-center cursor-pointer border border-gray-700 rounded-md bg-[#232323] hover:bg-[#232323e0] duration-300"
                onClick={() => setInput(prompt)}
              >
                <p className="text-lg text-gray-100 font-medium">{prompt}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className=" flex flex-col gap-10 mt-10">
            {chatHistory?.data.map((chat, index) => (
              <div key={index} className="flex flex-col gap-3">
                <div className=" border border-transparent rounded-full px-4 py-2 bg-[#252525f6] self-end flex flex-row gap-2">
                  {session?.user && (
                    <Image
                      src={session?.user?.image}
                      alt={session?.user?.name}
                      width={30}
                      height={30}
                      className="rounded-full self-center object-cover"
                    />
                  )}
                  <p className="text-gray-100 self-center text-lg font-medium">
                    {chat.userQuestion}
                  </p>
                </div>

                <p className="text-gray-100 leading-10 text-sm md:text-lg">
                  {chat.botAnswer}
                </p>
              </div>
            ))}
          </div>
        ))}

      <div className="fixed bottom-0 left-0 right-0 bg-opacity-90 z-10">
        <div className="mx-auto max-w-5xl px-4 md:px-0 py-4 flex flex-col items-center gap-2">
          {" "}
          <form
            onSubmit={handleSubmit}
            className="w-[80%] mx-auto flex flex-row z-50 bg-[#252525f6] gap-2 justify-center items-center px-5 py-3 rounded-full text-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500"
            action=""
          >
            <input
              required
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder="Write here..."
              type="text"
              name="prompt"
              className="w-full outline-0 text-white self-center font-medium bg-transparent"
              disabled={isLoading}
            />
            <button
              disabled={status === "unauthenticated" || isLoading}
              type="submit"
              className={` self-center ${
                status === "unauthenticated" || isLoading || input.length === 0
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
              ) : (
                <SendHorizontal size={28} color="#ffffff" strokeWidth={1.75} />
              )}
            </button>
          </form>
          {chatHistory?.data.length > 0 && (
            <button
              onClick={ClearChats}
              className="px-4 py-2 cursor-pointer rounded-md bg-[#252525f6] text-gray-100 border border-gray-700 hover:bg-[#232323e0] duration-300 flex items-center gap-2 text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-refresh-ccw"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.75L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.75L21 16" />
                <path d="M21 21v-5h-5" />
              </svg>{" "}
              Clear Chat
            </button>
          )}
        </div>
      </div>

      <div className="pb-32"></div>
    </div>
  );
};

export default Home;
