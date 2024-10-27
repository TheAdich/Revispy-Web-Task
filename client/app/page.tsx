'use client'
import React,{useEffect} from "react";
import { useRouter } from "next/navigation";
import ChatInterface from "./components/chatInterface";
import Header from "./components/header";
export default function Home() {
  const router = useRouter();
  useEffect(()=>{
    if(sessionStorage.getItem('jwt')===null){
      router.push('/login') 
    }
  },[])
  return (
    <div className="w-full h-screen">
      <Header/>
     <ChatInterface/>
    </div>
  );
}
