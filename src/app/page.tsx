"use client";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import OpenAI from "openai";
import { Button } from "@/components/ui/button";
import process from "process";
import { SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, currentMessage]);

  async function fetchData() {
    if (!prompt.trim()) {
      toast.error("Please type a message before sending.");
      return;
    }
    setIsLoading(true);

    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      });

      setMessages((prevMessages) => [...prevMessages, { sender: "user", text: prompt }]);
      setPrompt("");

      let currMessage = "";
      for await (const chunk of stream) {
        currMessage += chunk.choices[0].delta.content || "";
        setCurrentMessage(currMessage);
      }
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: currMessage }]);
      setCurrentMessage("");
    } catch (error) {
      toast.error("An error occurred while fetching the response.");
    } finally {
      setIsLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Error copying text"));
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900">
      <header className="bg-slate-800 text-slate-100 py-4 px-6">
        <h1 className="text-2xl font-bold">GPT-powered Chatbot</h1>
      </header>
      <main className="flex-grow overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender === "user" ? "bg-slate-600 text-slate-100" : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                } shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer`}
                onClick={() => copyToClipboard(message.text)}
              >
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {currentMessage && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100 shadow-md">
                <ReactMarkdown>{currentMessage}</ReactMarkdown>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-slate-200 dark:bg-slate-800 border-t border-slate-300 dark:border-slate-700">
          <div className="flex space-x-2">
            <Textarea
              placeholder="Type a message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow resize-none bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  fetchData();
                }
              }}
            />
            <Button onClick={fetchData} disabled={isLoading} className="bg-slate-700 hover:bg-slate-600 text-slate-100">
              <SendHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
      <footer className="bg-slate-800 text-slate-100 py-2 px-6 text-center">
        <p className="text-sm">Made by Khushaalan 2024</p>
      </footer>
    </div>
  );
}
