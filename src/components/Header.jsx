"use client";
import React from "react";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import googleLogo from "../../public/google-logo.png";
import { LogOut } from "lucide-react";

export default function Header() {
  const { status, data: session } = useSession();
  return (
    <header className=" py-10 flex flex-row justify-between">
      <h1 className=" self-center text-xl font-bold text-white md:text-3xl">
        ChatGenius
      </h1>

      {status === "unauthenticated" ? (
        <button
          onClick={() => signIn("google")}
          className=" px-3 py-2 self-center rounded-full font-medium border border-transparent text-black bg-white cursor-pointer flex flex-row gap-1 justify-center items-center md:px-4 md:py-3 hover:bg-gray-200 duration-200"
        >
          <Image
            src={googleLogo}
            alt="Google"
            width={20}
            height={20}
            className="object-contain"
          />
          <span className="font-medium">Signin</span>
        </button>
      ) : (
        <div className=" flex flex-row self-center gap-2 md:gap-5">
          {session ? (
            session?.user && (
              <Image
                title={session?.user?.name}
                src={session?.user?.image}
                alt={session?.user?.name}
                width={45}
                height={45}
                className="rounded-full border border-gray-200 self-center cursor-pointer object-cover"
              />
            )
          ) : (
            <p className=" self-center font-medium text-white">Loading...</p>
          )}
          <button
            onClick={() => signOut()}
            className=" px-3 py-2 self-center rounded-full font-medium border border-transparent text-white bg-blue-950 cursor-pointer flex flex-row gap-1 justify-center items-center md:px-4 md:py-3 hover:bg-blue-900 duration-300"
          >
            <LogOut size={28} color="#ffffff" strokeWidth={1.75} />
            <span>Signout</span>
          </button>
        </div>
      )}
    </header>
  );
}
