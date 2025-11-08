'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, MessageCircle, Send } from 'lucide-react';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [visitorInfo, setVisitorInfo] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [hasStartedChat, setHasStartedChat] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load session ID from localStorage
        const storedSessionId = localStorage.getItem('chatSessionId');
        if (storedSessionId) {
            setSessionId(storedSessionId);
            setHasStartedChat(true);
            loadChat(storedSessionId);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && sessionId) {
            // Poll for new messages every 3 seconds
            const interval = setInterval(() => {
                loadChat(sessionId);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, sessionId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChat = async (sid: string) => {
        try {
            const res = await fetch(`/api/v1/chat?sessionId=${sid}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data.chat.messages);
            }
        } catch (error) {
            console.error('Failed to load chat:', error);
        }
    };

    const searchKnowledgeBase = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(`/api/v1/chat/knowledge-base?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                setSuggestions(data.data.articles);
            }
        } catch (error) {
            console.error('Failed to search knowledge base:', error);
        }
    };

    const startChat = async () => {
        if (!inputMessage.trim()) return;

        try {
            const res = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...visitorInfo,
                    message: inputMessage.trim(),
                    metadata: {
                        url: window.location.href,
                        userAgent: navigator.userAgent,
                    },
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSessionId(data.data.sessionId);
                localStorage.setItem('chatSessionId', data.data.sessionId);
                setHasStartedChat(true);
                setMessages(data.data.chat.messages);
                setInputMessage('');
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !sessionId) return;

        try {
            const res = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    message: inputMessage.trim(),
                }),
            });

            const data = await res.json();
            if (data.success) {
                setMessages([...messages, data.data.message]);
                setInputMessage('');
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleInputChange = (value: string) => {
        setInputMessage(value);
        searchKnowledgeBase(value);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:scale-110 transition z-50"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] z-50 shadow-2xl rounded-lg overflow-hidden">
            <Card className="h-full flex flex-col">
                <CardHeader className="bg-primary text-white p-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Live Chat Support</CardTitle>
                        <button onClick={() => setIsOpen(false)}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm opacity-90">We're here to help!</p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                    {!hasStartedChat ? (
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-gray-600">
                                Please provide your details to start chatting:
                            </p>
                            <Input
                                placeholder="Your Name"
                                value={visitorInfo.name}
                                onChange={(e) =>
                                    setVisitorInfo({ ...visitorInfo, name: e.target.value })
                                }
                            />
                            <Input
                                type="email"
                                placeholder="Your Email"
                                value={visitorInfo.email}
                                onChange={(e) =>
                                    setVisitorInfo({ ...visitorInfo, email: e.target.value })
                                }
                            />
                            <Input
                                type="tel"
                                placeholder="Your Phone (optional)"
                                value={visitorInfo.phone}
                                onChange={(e) =>
                                    setVisitorInfo({ ...visitorInfo, phone: e.target.value })
                                }
                            />
                            <Textarea
                                placeholder="How can we help you?"
                                value={inputMessage}
                                onChange={(e) => handleInputChange(e.target.value)}
                                rows={3}
                            />
                            {suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500">Suggested articles:</p>
                                    {suggestions.map((article) => (
                                        <div
                                            key={article.id}
                                            className="p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                setInputMessage(
                                                    inputMessage + '\n\nI saw this article: ' + article.title
                                                );
                                                setSuggestions([]);
                                            }}
                                        >
                                            <p className="font-medium">{article.title}</p>
                                            <p className="text-gray-600 line-clamp-2">{article.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Button onClick={startChat} className="w-full">
                                Start Chat
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.senderType === 'VISITOR' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[75%] p-3 rounded-lg ${msg.senderType === 'VISITOR'
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            {msg.senderType === 'ADMIN' && (
                                                <p className="text-xs opacity-70 mb-1">Support Agent</p>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {suggestions.length > 0 && (
                                <div className="border-t p-2 max-h-32 overflow-y-auto">
                                    <p className="text-xs text-gray-500 mb-1">Suggested articles:</p>
                                    {suggestions.slice(0, 2).map((article) => (
                                        <div
                                            key={article.id}
                                            className="p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100 mb-1"
                                            onClick={() => {
                                                setInputMessage(article.title);
                                                setSuggestions([]);
                                            }}
                                        >
                                            <p className="font-medium line-clamp-1">{article.title}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t p-4 flex gap-2">
                                <Input
                                    placeholder="Type your message..."
                                    value={inputMessage}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                />
                                <Button onClick={sendMessage} size="icon">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
