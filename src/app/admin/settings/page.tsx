'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Settings,
    Save,
    Mail,
    CreditCard,
    Shield,
    Bell,
    Globe,
    Database,
    Key,
    User,
    Upload,
    X,
    Search
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';

interface SettingsData {
    general: {
        siteName: string;
        siteDescription: string;
        contactEmail: string;
        supportPhone: string;
        businessAddress: string;
        logo: string;
        favicon: string;
        seoTitle: string;
        seoDescription: string;
        seoKeywords: string;
    };
    payment: {
        stripeEnabled: boolean;
        paypalEnabled: boolean;
        phonepeEnabled: boolean;
        razorpayEnabled: boolean;
        currency: string;
        taxRate: number;
    };
    notifications: {
        emailNotifications: boolean;
        smsNotifications: boolean;
        orderConfirmations: boolean;
        paymentReminders: boolean;
        lowStockAlerts: boolean;
    };
    security: {
        twoFactorAuth: boolean;
        sessionTimeout: number;
        passwordPolicy: string;
        ipWhitelist: string[];
    };
}

export default function SettingsPage() {
    const { token } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SettingsData>({
        general: {
            siteName: 'Green Energy Solutions',
            siteDescription: 'Your trusted partner for solar energy solutions',
            contactEmail: 'support@ges.com',
            supportPhone: '+91-1234567890',
            businessAddress: '123 Solar Street, Green City, India',
            logo: '',
            favicon: '',
            seoTitle: 'Green Energy Solutions - Solar Energy Solutions',
            seoDescription: 'Leading provider of solar panels, batteries, and renewable energy solutions. Quality products and expert installation services.',
            seoKeywords: 'solar panels, solar energy, renewable energy, solar batteries, green energy'
        },
        payment: {
            stripeEnabled: false,
            paypalEnabled: false,
            phonepeEnabled: true,
            razorpayEnabled: true,
            currency: 'INR',
            taxRate: 18
        },
        notifications: {
            emailNotifications: true,
            smsNotifications: true,
            orderConfirmations: true,
            paymentReminders: true,
            lowStockAlerts: true
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordPolicy: 'strong',
            ipWhitelist: []
        }
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/v1/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                setSettings(data.data);
            }
        } catch (err) {
            // Use default settings if API fails
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/v1/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Settings saved successfully!');
            } else {
                setError(data.error || 'Failed to save settings');
            }
        } catch (err) {
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (section: keyof SettingsData, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 1 * 1024 * 1024; // 2MB for logo, 1MB for favicon
        if (file.size > maxSize) {
            setError(`${type === 'logo' ? 'Logo' : 'Favicon'} file size must be less than ${type === 'logo' ? '2MB' : '1MB'}`);
            return;
        }

        // Validate file type
        const allowedTypes = type === 'logo' ? ['image/jpeg', 'image/png', 'image/svg+xml'] : ['image/x-icon', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setError(`Invalid file type for ${type}. ${type === 'logo' ? 'PNG, JPG, SVG allowed' : 'ICO, PNG allowed'}`);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const response = await fetch('/api/v1/admin/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                updateSetting('general', type, data.data.url);
                setSuccess(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`);
            } else {
                setError(data.error || `Failed to upload ${type}`);
            }
        } catch (err) {
            setError(`Failed to upload ${type}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                                <p className="text-gray-600 mt-2">
                                    Configure your application settings and preferences.
                                </p>
                            </div>
                            <Button onClick={handleSave} disabled={saving}>
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
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

                    <Tabs defaultValue="general" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="general" className="flex items-center">
                                <Globe className="w-4 h-4 mr-2" />
                                General
                            </TabsTrigger>
                            <TabsTrigger value="seo" className="flex items-center">
                                <Search className="w-4 h-4 mr-2" />
                                SEO
                            </TabsTrigger>
                            <TabsTrigger value="payment" className="flex items-center">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Payment
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex items-center">
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center">
                                <Shield className="w-4 h-4 mr-2" />
                                Security
                            </TabsTrigger>
                        </TabsList>

                        {/* General Settings */}
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Globe className="w-5 h-5 mr-2" />
                                        General Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="siteName">Site Name</Label>
                                            <Input
                                                id="siteName"
                                                value={settings.general.siteName}
                                                onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contactEmail">Contact Email</Label>
                                            <Input
                                                id="contactEmail"
                                                type="email"
                                                value={settings.general.contactEmail}
                                                onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="siteDescription">Site Description</Label>
                                        <Textarea
                                            id="siteDescription"
                                            value={settings.general.siteDescription}
                                            onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="supportPhone">Support Phone</Label>
                                            <Input
                                                id="supportPhone"
                                                value={settings.general.supportPhone}
                                                onChange={(e) => updateSetting('general', 'supportPhone', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="businessAddress">Business Address</Label>
                                            <Textarea
                                                id="businessAddress"
                                                value={settings.general.businessAddress}
                                                onChange={(e) => updateSetting('general', 'businessAddress', e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <Label>Site Logo</Label>
                                        <div className="mt-2">
                                            {settings.general.logo ? (
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={settings.general.logo}
                                                        alt="Site Logo"
                                                        className="w-16 h-16 object-contain border rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                                        >
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Change Logo
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => updateSetting('general', 'logo', '')}
                                                            className="ml-2"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                                        <p className="mb-2 text-sm text-gray-500">
                                                            <span className="font-semibold">Click to upload logo</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500">PNG, JPG, SVG up to 2MB</p>
                                                    </div>
                                                    <input
                                                        id="logo-upload"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, 'logo')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Favicon Upload */}
                                    <div>
                                        <Label>Site Favicon</Label>
                                        <div className="mt-2">
                                            {settings.general.favicon ? (
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={settings.general.favicon}
                                                        alt="Site Favicon"
                                                        className="w-8 h-8 object-contain border rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => document.getElementById('favicon-upload')?.click()}
                                                        >
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            Change Favicon
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => updateSetting('general', 'favicon', '')}
                                                            className="ml-2"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                                        <p className="mb-1 text-sm text-gray-500">
                                                            <span className="font-semibold">Click to upload favicon</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500">ICO, PNG up to 1MB</p>
                                                    </div>
                                                    <input
                                                        id="favicon-upload"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, 'favicon')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* SEO Settings */}
                        <TabsContent value="seo">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Search className="w-5 h-5 mr-2" />
                                        SEO Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <Label htmlFor="seoTitle">SEO Title</Label>
                                        <Input
                                            id="seoTitle"
                                            value={settings.general.seoTitle}
                                            onChange={(e) => updateSetting('general', 'seoTitle', e.target.value)}
                                            placeholder="Main title for search engines"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Recommended: 50-60 characters. Current: {settings.general.seoTitle.length} characters
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="seoDescription">SEO Description</Label>
                                        <Textarea
                                            id="seoDescription"
                                            value={settings.general.seoDescription}
                                            onChange={(e) => updateSetting('general', 'seoDescription', e.target.value)}
                                            rows={3}
                                            placeholder="Description for search engines"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Recommended: 150-160 characters. Current: {settings.general.seoDescription.length} characters
                                        </p>
                                    </div>

                                    <div>
                                        <Label htmlFor="seoKeywords">SEO Keywords</Label>
                                        <Input
                                            id="seoKeywords"
                                            value={settings.general.seoKeywords}
                                            onChange={(e) => updateSetting('general', 'seoKeywords', e.target.value)}
                                            placeholder="Comma-separated keywords"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Separate keywords with commas. Focus on 5-10 relevant keywords.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Payment Settings */}
                        <TabsContent value="payment">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Payment Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Payment Methods</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="phonepeEnabled">PhonePe</Label>
                                                <Switch
                                                    id="phonepeEnabled"
                                                    checked={settings.payment.phonepeEnabled}
                                                    onCheckedChange={(checked) => updateSetting('payment', 'phonepeEnabled', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="razorpayEnabled">Razorpay</Label>
                                                <Switch
                                                    id="razorpayEnabled"
                                                    checked={settings.payment.razorpayEnabled}
                                                    onCheckedChange={(checked) => updateSetting('payment', 'razorpayEnabled', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="stripeEnabled">Stripe</Label>
                                                <Switch
                                                    id="stripeEnabled"
                                                    checked={settings.payment.stripeEnabled}
                                                    onCheckedChange={(checked) => updateSetting('payment', 'stripeEnabled', checked)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="paypalEnabled">PayPal</Label>
                                                <Switch
                                                    id="paypalEnabled"
                                                    checked={settings.payment.paypalEnabled}
                                                    onCheckedChange={(checked) => updateSetting('payment', 'paypalEnabled', checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="currency">Currency</Label>
                                            <Select
                                                value={settings.payment.currency}
                                                onValueChange={(value) => updateSetting('payment', 'currency', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                                                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                            <Input
                                                id="taxRate"
                                                type="number"
                                                value={settings.payment.taxRate}
                                                onChange={(e) => updateSetting('payment', 'taxRate', parseFloat(e.target.value) || 0)}
                                                min="0"
                                                max="100"
                                                step="0.1"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notification Settings */}
                        <TabsContent value="notifications">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Bell className="w-5 h-5 mr-2" />
                                        Notification Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="emailNotifications">Email Notifications</Label>
                                                <p className="text-sm text-gray-600">Receive notifications via email</p>
                                            </div>
                                            <Switch
                                                id="emailNotifications"
                                                checked={settings.notifications.emailNotifications}
                                                onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                                                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                                            </div>
                                            <Switch
                                                id="smsNotifications"
                                                checked={settings.notifications.smsNotifications}
                                                onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="orderConfirmations">Order Confirmations</Label>
                                                <p className="text-sm text-gray-600">Send confirmation emails for new orders</p>
                                            </div>
                                            <Switch
                                                id="orderConfirmations"
                                                checked={settings.notifications.orderConfirmations}
                                                onCheckedChange={(checked) => updateSetting('notifications', 'orderConfirmations', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="paymentReminders">Payment Reminders</Label>
                                                <p className="text-sm text-gray-600">Send payment reminder notifications</p>
                                            </div>
                                            <Switch
                                                id="paymentReminders"
                                                checked={settings.notifications.paymentReminders}
                                                onCheckedChange={(checked) => updateSetting('notifications', 'paymentReminders', checked)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                                                <p className="text-sm text-gray-600">Get notified when products are low on stock</p>
                                            </div>
                                            <Switch
                                                id="lowStockAlerts"
                                                checked={settings.notifications.lowStockAlerts}
                                                onCheckedChange={(checked) => updateSetting('notifications', 'lowStockAlerts', checked)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Settings */}
                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Shield className="w-5 h-5 mr-2" />
                                        Security Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                                                <p className="text-sm text-gray-600">Enable 2FA for admin accounts</p>
                                            </div>
                                            <Switch
                                                id="twoFactorAuth"
                                                checked={settings.security.twoFactorAuth}
                                                onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                            <Input
                                                id="sessionTimeout"
                                                type="number"
                                                value={settings.security.sessionTimeout}
                                                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value) || 30)}
                                                min="5"
                                                max="480"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="passwordPolicy">Password Policy</Label>
                                            <Select
                                                value={settings.security.passwordPolicy}
                                                onValueChange={(value) => updateSetting('security', 'passwordPolicy', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="basic">Basic (6+ characters)</SelectItem>
                                                    <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                                                    <SelectItem value="strong">Strong (12+ chars, mixed case, numbers, symbols)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                                        <Textarea
                                            id="ipWhitelist"
                                            placeholder="Enter IP addresses separated by commas"
                                            value={settings.security.ipWhitelist.join(', ')}
                                            onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value.split(',').map(ip => ip.trim()))}
                                            rows={3}
                                        />
                                        <p className="text-sm text-gray-600 mt-1">
                                            Leave empty to allow all IPs. Enter IP addresses separated by commas.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}