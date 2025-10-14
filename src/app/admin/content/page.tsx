'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  GripVertical,
  RefreshCw,
  Image,
  Type,
  Star,
  Package,
  Info,
  Megaphone,
  Download,
  Sparkles,
  Bot,
  Lightbulb
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';

interface ContentBlock {
  id: string;
  type: string;
  title?: string;
  content: any;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const contentTypeIcons = {
  HERO_BANNER: Megaphone,
  FEATURED_PRODUCTS: Package,
  TESTIMONIALS: Star,
  CATEGORIES: Package,
  INFO_SECTION: Info,
  PROMOTION_BANNER: Megaphone
};

const contentTypeLabels = {
  HERO_BANNER: 'Hero Banner',
  FEATURED_PRODUCTS: 'Featured Products',
  TESTIMONIALS: 'Testimonials',
  CATEGORIES: 'Categories',
  INFO_SECTION: 'Info Section',
  PROMOTION_BANNER: 'Promotion Banner'
};

export default function ContentManagementPage() {
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  useEffect(() => {
    fetchContentBlocks();
  }, []);

  const fetchContentBlocks = async () => {
    try {
      const response = await fetch('/api/v1/content', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setContentBlocks(data.data);
      } else {
        setError(data.error || 'Failed to load content blocks');
      }
    } catch (err) {
      setError('Failed to load content blocks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (block: ContentBlock) => {
    try {
      const url = isCreating ? '/api/v1/content' : `/api/v1/content/${block.id}`;
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: block.type,
          title: block.title,
          content: block.content,
          order: block.order,
          isActive: block.isActive
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Content block saved successfully!');
        setEditingBlock(null);
        setIsCreating(false);
        fetchContentBlocks();
      } else {
        setError(data.error || 'Failed to save content block');
      }
    } catch (err) {
      setError('Failed to save content block');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content block?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/content/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Content block deleted successfully!');
        fetchContentBlocks();
      } else {
        setError(data.error || 'Failed to delete content block');
      }
    } catch (err) {
      setError('Failed to delete content block');
    }
  };

  const handleToggleActive = async (block: ContentBlock) => {
    try {
      const response = await fetch(`/api/v1/content/${block.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...block,
          isActive: !block.isActive
        })
      });

      const data = await response.json();

      if (data.success) {
        fetchContentBlocks();
      } else {
        setError(data.error || 'Failed to update content block');
      }
    } catch (err) {
      setError('Failed to update content block');
    }
  };

  const startEditing = (block: ContentBlock) => {
    setEditingBlock({ ...block });
    setIsCreating(false);
  };

  const startCreating = (type: string) => {
    const newBlock: ContentBlock = {
      id: '',
      type,
      title: '',
      content: {},
      order: contentBlocks.length,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditingBlock(newBlock);
    setIsCreating(true);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} content block${selectedItems.size !== 1 ? 's' : ''}?`)) {
      return;
    }

    try {
      const results = await Promise.all(
        Array.from(selectedItems).map(id =>
          fetch(`/api/v1/content/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.json())
        )
      );

      const successCount = results.filter(result => result.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        setSuccess(`${successCount} content block${successCount !== 1 ? 's' : ''} deleted successfully!`);
        setSelectedItems(new Set());
        setIsBulkMode(false);
        fetchContentBlocks();
        if (failCount > 0) {
          setError(`${failCount} deletion${failCount !== 1 ? 's' : ''} failed`);
        }
      } else {
        setError('Failed to delete content blocks');
      }
    } catch (err) {
      setError('Failed to delete content blocks');
    }
  };

  const handleBulkToggleActive = async (activate: boolean) => {
    if (selectedItems.size === 0) return;

    try {
      const results = await Promise.all(
        Array.from(selectedItems).map(id => {
          const block = contentBlocks.find(b => b.id === id);
          if (!block) return Promise.resolve({ success: false });

          return fetch(`/api/v1/content/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...block,
              isActive: activate
            })
          }).then(res => res.json());
        })
      );

      const successCount = results.filter(result => result.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        setSuccess(`${successCount} content block${successCount !== 1 ? 's' : ''} ${activate ? 'activated' : 'deactivated'} successfully!`);
        setSelectedItems(new Set());
        setIsBulkMode(false);
        fetchContentBlocks();
        if (failCount > 0) {
          setError(`${failCount} update${failCount !== 1 ? 's' : ''} failed`);
        }
      } else {
        setError('Failed to update content blocks');
      }
    } catch (err) {
      setError('Failed to update content blocks');
    }
  };

  const handleBulkExport = () => {
    if (selectedItems.size === 0) return;

    const selectedContent = contentBlocks.filter(block => selectedItems.has(block.id));
    const csvContent = [
      ['Type', 'Title', 'Order', 'Active', 'Created', 'Updated'],
      ...selectedContent.map(block => [
        contentTypeLabels[block.type as keyof typeof contentTypeLabels] || block.type,
        block.title || '',
        block.order.toString(),
        block.isActive ? 'Yes' : 'No',
        new Date(block.createdAt).toLocaleDateString(),
        new Date(block.updatedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content_blocks_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderContentForm = (block: ContentBlock) => {
    switch (block.type) {
      case 'HERO_BANNER':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Headline</Label>
              <Input
                id="title"
                value={block.content.headline || ''}
                onChange={(e) => setEditingBlock({
                  ...block,
                  content: { ...block.content, headline: e.target.value }
                })}
                placeholder="Welcome to Green Energy Solutions"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={block.content.subtitle || ''}
                onChange={(e) => setEditingBlock({
                  ...block,
                  content: { ...block.content, subtitle: e.target.value }
                })}
                placeholder="Discover our range of eco-friendly batteries and solar solutions"
              />
            </div>
            <div>
              <Label htmlFor="ctaText">Button Text</Label>
              <Input
                id="ctaText"
                value={block.content.ctaText || ''}
                onChange={(e) => setEditingBlock({
                  ...block,
                  content: { ...block.content, ctaText: e.target.value }
                })}
                placeholder="Shop Now"
              />
            </div>
            <div>
              <Label htmlFor="ctaLink">Button Link</Label>
              <Input
                id="ctaLink"
                value={block.content.ctaLink || ''}
                onChange={(e) => setEditingBlock({
                  ...block,
                  content: { ...block.content, ctaLink: e.target.value }
                })}
                placeholder="/products"
              />
            </div>
            <div>
              <Label htmlFor="backgroundImage">Background Image URL</Label>
              <Input
                id="backgroundImage"
                value={block.content.backgroundImage || ''}
                onChange={(e) => setEditingBlock({
                  ...block,
                  content: { ...block.content, backgroundImage: e.target.value }
                })}
                placeholder="/images/hero-bg.jpg"
              />
            </div>
          </div>
        );

      case 'INFO_SECTION':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Section Title</Label>
              <Input
                id="title"
                value={block.title || ''}
                onChange={(e) => setEditingBlock({ ...block, title: e.target.value })}
                placeholder="Why Choose Us"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={block.content.description || ''}
                onChange={(e) => setEditingBlock({
                  ...block,
                  content: { ...block.content, description: e.target.value }
                })}
                placeholder="Learn about our commitment to sustainability"
              />
            </div>
            <div>
              <Label>Features (JSON)</Label>
              <Textarea
                value={JSON.stringify(block.content.features || [], null, 2)}
                onChange={(e) => {
                  try {
                    const features = JSON.parse(e.target.value);
                    setEditingBlock({
                      ...block,
                      content: { ...block.content, features }
                    });
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                placeholder='[{"title": "Feature 1", "description": "Description", "icon": "icon-name"}]'
                rows={6}
              />
            </div>
          </div>
        );

      case 'PROMOTION_BANNER':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Banner Title</Label>
              <Input
                id="title"
                value={block.title || ''}
                onChange={(e) => setEditingBlock({ ...block, title: e.target.value })}
                placeholder="Special Offer"
              />
            </div>
            <div>
              <Label htmlFor="content">Banner Text</Label>
              <Textarea
                id="content"
                value={block.content.text || ''}
                onChange={(e) => setEditingBlock({
                  ...block,
                  content: { ...block.content, text: e.target.value }
                })}
                placeholder="Get 20% off on all solar products this month!"
              />
            </div>
            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                value={block.content.backgroundColor || '#10b981'}
                onChange={(e) => setEditingBlock({
                  ...block,
                  content: { ...block.content, backgroundColor: e.target.value }
                })}
                placeholder="#10b981"
              />
            </div>
            <div>
              <Label htmlFor="textColor">Text Color</Label>
              <Input
                id="textColor"
                value={block.content.textColor || '#ffffff'}
                onChange={(e) => setEditingBlock({
                  ...block,
                  content: { ...block.content, textColor: e.target.value }
                })}
                placeholder="#ffffff"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={block.title || ''}
                onChange={(e) => setEditingBlock({ ...block, title: e.target.value })}
                placeholder="Content Block Title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content (JSON)</Label>
              <Textarea
                value={JSON.stringify(block.content, null, 2)}
                onChange={(e) => {
                  try {
                    const content = JSON.parse(e.target.value);
                    setEditingBlock({ ...block, content });
                  } catch (err) {
                    // Invalid JSON, don't update
                  }
                }}
                rows={8}
              />
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your landing page content and layout.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Blocks List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedItems.size === contentBlocks.length && contentBlocks.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(new Set(contentBlocks.map(block => block.id)));
                          setIsBulkMode(true);
                        } else {
                          setSelectedItems(new Set());
                          setIsBulkMode(false);
                        }
                      }}
                    />
                    <CardTitle>Content Blocks</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchContentBlocks}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>

                  {/* Bulk Actions Toolbar */}
                  {isBulkMode && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-blue-900">
                            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkToggleActive(true)}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                          >
                            Activate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkToggleActive(false)}
                            className="text-orange-700 border-orange-300 hover:bg-orange-50"
                          >
                            Deactivate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkDelete}
                            className="text-red-700 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkExport}
                            className="text-purple-700 border-purple-300 hover:bg-purple-50"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItems(new Set());
                            setIsBulkMode(false);
                          }}
                        >
                          Clear Selection
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {contentBlocks.map((block, index) => {
                      const IconComponent = contentTypeIcons[block.type as keyof typeof contentTypeIcons];
                      return (
                        <div key={block.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={selectedItems.has(block.id)}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(selectedItems);
                                  if (checked) {
                                    newSelected.add(block.id);
                                  } else {
                                    newSelected.delete(block.id);
                                  }
                                  setSelectedItems(newSelected);
                                  setIsBulkMode(newSelected.size > 0);
                                }}
                                className="mt-1"
                              />
                              <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <IconComponent className="w-4 h-4 text-blue-600" />
                                  <Badge variant="outline">
                                    {contentTypeLabels[block.type as keyof typeof contentTypeLabels]}
                                  </Badge>
                                  <Badge className={block.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                    {block.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-lg mb-1">
                                  {block.title || `${contentTypeLabels[block.type as keyof typeof contentTypeLabels]} ${index + 1}`}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Order: {block.order} |
                                  Created: {new Date(block.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleActive(block)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditing(block)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(block.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {contentBlocks.length === 0 && (
                      <div className="text-center py-12">
                        <Type className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No content blocks yet</h3>
                        <p className="text-gray-600 mb-6">
                          Create your first content block to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Assistant */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Get AI-powered suggestions for your content:
                  </p>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      const suggestions = [
                        "Create a hero banner with compelling headline about solar energy benefits",
                        "Add customer testimonials showcasing successful installations",
                        "Include a featured products section highlighting best-sellers",
                        "Create an info section about government solar subsidies"
                      ];
                      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
                      alert(`💡 AI Suggestion: ${randomSuggestion}`);
                    }}
                  >
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                    Content Ideas
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      const headlines = [
                        "Power Your Future with Clean Energy",
                        "Go Solar Today - Save Tomorrow",
                        "Sustainable Energy for a Better World",
                        "Join the Solar Revolution"
                      ];
                      const randomHeadline = headlines[Math.floor(Math.random() * headlines.length)];
                      alert(`📝 AI Generated Headline: "${randomHeadline}"`);
                    }}
                  >
                    <Bot className="w-4 h-4 mr-2 text-blue-500" />
                    Generate Headlines
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      alert("🎯 AI Tip: Use action-oriented language in your CTAs. Words like 'Start Saving', 'Get Started', or 'Learn More' perform better than passive phrases.");
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                    Optimization Tips
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Add New Content Block */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Block</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Choose a content block type to add to your landing page:
                  </p>

                  {Object.entries(contentTypeLabels).map(([type, label]) => {
                    const IconComponent = contentTypeIcons[type as keyof typeof contentTypeIcons];
                    return (
                      <Button
                        key={type}
                        variant="outline"
                        className="w-full justify-start h-auto p-4"
                        onClick={() => startCreating(type)}
                      >
                        <IconComponent className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-gray-500">
                            {type.replace(/_/g, ' ').toLowerCase()}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Edit/Create Modal */}
          {editingBlock && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                      {isCreating ? 'Create Content Block' : 'Edit Content Block'}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBlock(null);
                        setIsCreating(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="order">Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={editingBlock.order}
                        onChange={(e) => setEditingBlock({
                          ...editingBlock,
                          order: parseInt(e.target.value) || 0
                        })}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={editingBlock.isActive}
                        onCheckedChange={(checked) => setEditingBlock({
                          ...editingBlock,
                          isActive: checked
                        })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>

                    {renderContentForm(editingBlock)}

                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingBlock(null);
                          setIsCreating(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => handleSave(editingBlock)}>
                        <Save className="w-4 h-4 mr-2" />
                        {isCreating ? 'Create' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}