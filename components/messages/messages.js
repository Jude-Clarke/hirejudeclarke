"use client";

import { useState, useRef, useEffect } from 'react';
import { PulseLoader } from 'react-spinners';
import DOMPurify from 'dompurify';

const AssistantMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userMessage, setUserMessage] = useState("");
    const [threadId, setThreadId] = useState(null);
    const [isOpen, setIsOpen] = useState(false); // State to toggle chat window

    const loadingRef = useRef(null); // Reference for the loading div
    const messageRef = useRef(null); // Reference to the end of the last message the user sent.

    const fetchMessages = async (message) => {
        setLoading(true);
        try {
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userMessage: message, threadId: threadId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Network response was not ok: ${response.status} - ${errorData.error}`);
            }

            const data = await response.json();
            setThreadId(data.threadId);  // Update the thread ID
            setMessages(data.messages.map(message => ({
                ...message,
                content: parseUrls(message.content) // Parse URLs here
            })));  // Update the messages

            console.log("Messages!!!!", data.messages);
        } catch (error) {
            console.error("Fetch error: ", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const textInput = document.getElementById("text-input");
        const messageDiv = document.getElementById("message-div");
        textInput.disabled = true;
        messageDiv.scrollIntoView(true);
        setUserMessage("");  // Clear the input field after submission
        await fetchMessages(userMessage);
        textInput.disabled = false;
    };

    useEffect(() => {
        if (!loading) {
            messageRef.current?.scrollIntoView({ behavior: "smooth" });
        }

        if (loading && loadingRef.current) {
            loadingRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [loading, messages]);

    function removeAnnotations(text) {
        // Use regex to find and remove all annotations in the form 【...】
        return text.replace(/【.*?】/g, '');
    }

    const parseUrls = (text) => {
        // Regex to find URLs in text
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`);
    };

    return (
        <div className="fixed bottom-4 right-4 w-full max-w-sm md:max-w-md lg:max-w-lg bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-50">
            <button
                className="w-full p-2 bg-blue-500 text-white rounded-t-lg "
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? 'Close Chat' : 'Ask JudeGPT'}
            </button>
            {isOpen && (
                <div className="flex flex-col h-full">
                    <div id="message-div" className="flex-1 max-h-96 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((message, index) => (
                            <div key={index} id={`message-${index}`} className={`mb-3 p-3 rounded-lg max-w-3/4 ${message.role === 'user' ? 'self-end bg-green-100 text-green-900' : 'self-start bg-gray-200 text-gray-900'}`}>
                                <strong>{message.role === "user" ? "prompt" : "JudeGPT"}</strong>: {message.role === "assistant" ? removeAnnotations(parseUrls(message.content)): message.content}
                                {index == (messages.length - 2) && <div ref={messageRef}/>}
                            </div>
                        ))}
                        {loading && <div ref={loadingRef} className="text-center opacity-30"><PulseLoader /></div>}
                        {error && <div className="text-center text-red-500">Error: {error.message}</div>}
                    </div>
                    <form onSubmit={handleSubmit} className="flex p-4 border-t border-gray-300 bg-white">
                        <input
                            id="text-input"
                            type="text"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            placeholder="Ask JudeGPT..."
                            required
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                        />
                        <button type="submit" className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300">
                            Send
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AssistantMessages;
