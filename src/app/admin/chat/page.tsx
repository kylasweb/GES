'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    BarChart3,
    TrendingUp,
    Users,
    MessageSquare,
    Star,
    Clock,
} from 'lucide-react';

export default function AdminChatPage() {
    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
    const [newArticle, setNewArticle] = useState({
        title: '',
        content: '',
        keywords: '',
        category: '',
    });
    const [loading, setLoading] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [newDepartment, setNewDepartment] = useState({
        name: '',
        slug: '',
        description: '',
        email: '',
        isActive: true,
        sortOrder: 0,
    });

    useEffect(() => {
        fetchChats();
        fetchKnowledgeBase();
        fetchAnalytics();
        fetchDepartments();
    }, []);

    const fetchChats = async (status?: string) => {
        try {
            const token = localStorage.getItem('token');
            const url = status
                ? `/api/v1/admin/chat?status=${status}`
                : '/api/v1/admin/chat';

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setChats(data.data.chats);
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    };

    const fetchKnowledgeBase = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/admin/chat/knowledge-base', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setKnowledgeBase(data.data.articles);
            }
        } catch (error) {
            console.error('Failed to fetch knowledge base:', error);
        }
    };

    const fetchAnalytics = async (days = 7) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/v1/admin/chat/analytics?days=${days}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/admin/chat/departments', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setDepartments(data.data.departments);
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };

    const selectChat = async (chat: any) => {
        setSelectedChat(chat);
        // Mark messages as read
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/v1/chat?sessionId=${chat.sessionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    };

    const sendMessage = async () => {
        if (!message.trim() || !selectedChat) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/admin/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    chatId: selectedChat.id,
                    message: message.trim(),
                }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('');
                // Refresh chat
                const updatedChat = chats.find(c => c.id === selectedChat.id);
                if (updatedChat) {
                    selectChat(updatedChat);
                }
                toast.success('Message sent');
            }
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const updateChatStatus = async (chatId: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/admin/chat', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ chatId, status }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Chat status updated');
                fetchChats();
            }
        } catch (error) {
            toast.error('Failed to update chat status');
        }
    };

    const createKnowledgeBaseArticle = async () => {
        if (!newArticle.title || !newArticle.content) {
            toast.error('Title and content are required');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/admin/chat/knowledge-base', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...newArticle,
                    keywords: newArticle.keywords.split(',').map(k => k.trim()),
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Article created');
                setNewArticle({ title: '', content: '', keywords: '', category: '' });
                fetchKnowledgeBase();
            }
        } catch (error) {
            toast.error('Failed to create article');
        } finally {
            setLoading(false);
        }
    };

    const deleteKnowledgeBaseArticle = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/v1/admin/chat/knowledge-base?id=${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Article deleted');
                fetchKnowledgeBase();
            }
        } catch (error) {
            toast.error('Failed to delete article');
        }
    };

    const createDepartment = async () => {
        if (!newDepartment.name || !newDepartment.slug) {
            toast.error('Name and slug are required');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/v1/admin/chat/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newDepartment),
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Department created');
                fetchDepartments();
                setNewDepartment({
                    name: '',
                    slug: '',
                    description: '',
                    email: '',
                    isActive: true,
                    sortOrder: 0,
                });
            }
        } catch (error) {
            toast.error('Failed to create department');
        } finally {
            setLoading(false);
        }
    };

    const deleteDepartment = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/v1/admin/chat/departments?id=${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Department deleted');
                fetchDepartments();
            }
        } catch (error) {
            toast.error('Failed to delete department');
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: any = {
            ACTIVE: 'bg-green-500',
            WAITING: 'bg-yellow-500',
            ASSIGNED: 'bg-blue-500',
            RESOLVED: 'bg-gray-500',
            CLOSED: 'bg-red-500',
        };
        return <Badge className={colors[status]}>{status}</Badge>;
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Live Chat Management</h1>

            <Tabs defaultValue="chats" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="chats">Active Chats</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
                </TabsList>

                <TabsContent value="chats">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chat List */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="flex gap-2 mb-4">
                                <Button variant="outline" size="sm" onClick={() => fetchChats()}>
                                    All
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => fetchChats('ACTIVE')}>
                                    Active
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => fetchChats('WAITING')}>
                                    Waiting
                                </Button>
                            </div>

                            {chats.map((chat) => (
                                <Card
                                    key={chat.id}
                                    className={`cursor-pointer hover:shadow-md transition ${selectedChat?.id === chat.id ? 'ring-2 ring-primary' : ''
                                        }`}
                                    onClick={() => selectChat(chat)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm">
                                                {chat.visitorName || 'Anonymous'}
                                            </CardTitle>
                                            {getStatusBadge(chat.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-gray-500">{chat.visitorEmail}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {chat._count.messages} messages
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(chat.lastMessageAt).toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Chat Messages */}
                        <div className="lg:col-span-2">
                            {selectedChat ? (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{selectedChat.visitorName || 'Anonymous'}</CardTitle>
                                                <p className="text-sm text-gray-500">{selectedChat.visitorEmail}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateChatStatus(selectedChat.id, 'RESOLVED')}
                                                >
                                                    Resolve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateChatStatus(selectedChat.id, 'CLOSED')}
                                                >
                                                    Close
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                                            {selectedChat.messages?.map((msg: any) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'
                                                        }`}
                                                >
                                                    <div
                                                        className={`max-w-xs p-3 rounded-lg ${msg.senderType === 'ADMIN'
                                                            ? 'bg-primary text-white'
                                                            : 'bg-gray-100'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{msg.message}</p>
                                                        <p className="text-xs opacity-70 mt-1">
                                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <Textarea
                                                placeholder="Type your message..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        sendMessage();
                                                    }
                                                }}
                                            />
                                            <Button onClick={sendMessage} disabled={loading}>
                                                Send
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="flex items-center justify-center h-96">
                                        <p className="text-gray-500">Select a chat to view messages</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="knowledge">
                    <div className="space-y-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Add New Article</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create Knowledge Base Article</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Title</Label>
                                        <Input
                                            value={newArticle.title}
                                            onChange={(e) =>
                                                setNewArticle({ ...newArticle, title: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Category</Label>
                                        <Input
                                            value={newArticle.category}
                                            onChange={(e) =>
                                                setNewArticle({ ...newArticle, category: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Keywords (comma-separated)</Label>
                                        <Input
                                            value={newArticle.keywords}
                                            onChange={(e) =>
                                                setNewArticle({ ...newArticle, keywords: e.target.value })
                                            }
                                            placeholder="solar, panels, installation"
                                        />
                                    </div>
                                    <div>
                                        <Label>Content</Label>
                                        <Textarea
                                            rows={6}
                                            value={newArticle.content}
                                            onChange={(e) =>
                                                setNewArticle({ ...newArticle, content: e.target.value })
                                            }
                                        />
                                    </div>
                                    <Button onClick={createKnowledgeBaseArticle} disabled={loading}>
                                        Create Article
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {knowledgeBase.map((article) => (
                                <Card key={article.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{article.title}</CardTitle>
                                                {article.category && (
                                                    <Badge variant="outline" className="mt-2">
                                                        {article.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteKnowledgeBaseArticle(article.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-2">{article.content}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {article.keywords.map((keyword: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                    {keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 mt-3 text-xs text-gray-500">
                                            <span>👁 {article.views} views</span>
                                            <span>👍 {article.helpful}</span>
                                            <span>👎 {article.notHelpful}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                    <div className="space-y-6">
                        {analytics && (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Total Chats
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{analytics.summary.totalChats}</div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {analytics.summary.activeChats} active
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                Resolution Rate
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{analytics.summary.resolutionRate}%</div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {analytics.summary.resolvedChats} resolved
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <Star className="w-4 h-4" />
                                                Avg Rating
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{analytics.summary.avgRating}/5</div>
                                            <div className="flex gap-1 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3 h-3 ${i < Math.round(analytics.summary.avgRating)
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Avg Response Time
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {Math.round(analytics.summary.avgResponseTime / 60)}m
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {analytics.summary.avgResponseTime}s
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Department Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Department Statistics</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {Object.entries(analytics.departmentStats).map(([dept, stats]: [string, any]) => (
                                                <div key={dept} className="border rounded p-3">
                                                    <p className="text-sm font-medium capitalize">{dept}</p>
                                                    <p className="text-2xl font-bold mt-1">{stats.count}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {stats.resolved} resolved
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Rating Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Rating Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {[5, 4, 3, 2, 1].map(rating => (
                                                <div key={rating} className="flex items-center gap-3">
                                                    <span className="text-sm font-medium w-12">{rating} stars</span>
                                                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                                                        <div
                                                            className="bg-primary h-4 rounded-full"
                                                            style={{
                                                                width: `${((analytics.ratingDistribution[rating] || 0) /
                                                                        analytics.summary.totalChats) *
                                                                    100
                                                                    }%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-600 w-12">
                                                        {analytics.ratingDistribution[rating] || 0}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Top Rated Chats */}
                                {analytics.topRatedChats.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Top Rated Conversations</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {analytics.topRatedChats.map((chat: any) => (
                                                    <div key={chat.sessionId} className="border rounded p-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{chat.visitorName}</span>
                                                            <div className="flex gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3 h-3 ${i < chat.rating
                                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                                : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {chat.ratingComment && (
                                                            <p className="text-sm text-gray-600 mt-2">
                                                                "{chat.ratingComment}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>
                </TabsContent>

                {/* Departments Tab */}
                <TabsContent value="departments">
                    <div className="space-y-6">
                        {/* Create Department Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Department</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="dept-name">Name</Label>
                                        <Input
                                            id="dept-name"
                                            placeholder="Technical Support"
                                            value={newDepartment.name}
                                            onChange={(e) =>
                                                setNewDepartment({ ...newDepartment, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dept-slug">Slug</Label>
                                        <Input
                                            id="dept-slug"
                                            placeholder="technical"
                                            value={newDepartment.slug}
                                            onChange={(e) =>
                                                setNewDepartment({ ...newDepartment, slug: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dept-email">Email</Label>
                                        <Input
                                            id="dept-email"
                                            type="email"
                                            placeholder="tech@company.com"
                                            value={newDepartment.email}
                                            onChange={(e) =>
                                                setNewDepartment({ ...newDepartment, email: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dept-sort">Sort Order</Label>
                                        <Input
                                            id="dept-sort"
                                            type="number"
                                            placeholder="0"
                                            value={newDepartment.sortOrder}
                                            onChange={(e) =>
                                                setNewDepartment({
                                                    ...newDepartment,
                                                    sortOrder: parseInt(e.target.value) || 0,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="dept-desc">Description</Label>
                                        <Textarea
                                            id="dept-desc"
                                            placeholder="Technical support for installation and troubleshooting"
                                            value={newDepartment.description}
                                            onChange={(e) =>
                                                setNewDepartment({
                                                    ...newDepartment,
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <Button onClick={createDepartment} disabled={loading} className="mt-4">
                                    Create Department
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Departments List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {departments.map((dept) => (
                                <Card key={dept.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{dept.name}</CardTitle>
                                            <Badge variant={dept.isActive ? 'default' : 'secondary'}>
                                                {dept.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                                        <div className="space-y-1 text-sm">
                                            <p>
                                                <span className="font-medium">Slug:</span> {dept.slug}
                                            </p>
                                            {dept.email && (
                                                <p>
                                                    <span className="font-medium">Email:</span> {dept.email}
                                                </p>
                                            )}
                                            <p>
                                                <span className="font-medium">Sort Order:</span> {dept.sortOrder}
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => deleteDepartment(dept.id)}
                                        >
                                            Delete
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
