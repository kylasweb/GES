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
    User
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
            businessAddress: '123 Solar Street, Green City, India'
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
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general" className="flex items-center">
                                <Globe className="w-4 h-4 mr-2" />
                                General
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