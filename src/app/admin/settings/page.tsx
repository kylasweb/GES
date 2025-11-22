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
    Search,
    RefreshCw
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { useToast } from '@/hooks/use-toast';

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
    smtp: {
        smtpHost: string;
        smtpPort: number;
        smtpUser: string;
        smtpPassword: string;
        smtpFromEmail: string;
        smtpFromName: string;
        smtpSecure: boolean;
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
    const { toast } = useToast();
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
        smtp: {
            smtpHost: '',
            smtpPort: 587,
            smtpUser: '',
            smtpPassword: '',
            smtpFromEmail: '',
            smtpFromName: 'Green Energy Solutions',
            smtpSecure: false
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

    const [testEmailAddress, setTestEmailAddress] = useState('');
    const [testingEmail, setTestingEmail] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);

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
            toast({
                title: 'Warning',
                description: 'Failed to load settings, using defaults.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);

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
                toast({
                    title: 'Success',
                    description: 'Settings saved successfully!',
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to save settings',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to save settings',
                variant: 'destructive',
            });
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

    const handleTestEmail = async () => {
        if (!testEmailAddress) {
            toast({
                title: 'Error',
                description: 'Please enter an email address to test',
                variant: 'destructive',
            });
            return;
        }

        setTestingEmail(true);

        try {
            const response = await fetch('/api/v1/admin/settings/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ testEmail: testEmailAddress })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Test email sent successfully to ${testEmailAddress}!`,
                });
                setTestEmailAddress('');
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to send test email',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to send test email. Please check your SMTP settings.',
                variant: 'destructive',
            });
        } finally {
            setTestingEmail(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 1 * 1024 * 1024; // 2MB for logo, 1MB for favicon
        if (file.size > maxSize) {
            toast({
                title: 'Error',
                description: `${type === 'logo' ? 'Logo' : 'Favicon'} file size must be less than ${type === 'logo' ? '2MB' : '1MB'}`,
                variant: 'destructive',
            });
            return;
        }

        // Validate file type
        const allowedTypes = type === 'logo' ? ['image/jpeg', 'image/png', 'image/svg+xml'] : ['image/x-icon', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Error',
                description: `Invalid file type for ${type}. ${type === 'logo' ? 'PNG, JPG, SVG allowed' : 'ICO, PNG allowed'}`,
                variant: 'destructive',
            });
            return;
        }

        if (type === 'logo') setUploadingLogo(true);
        else setUploadingFavicon(true);

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
                toast({
                    title: 'Success',
                    description: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`,
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.error || `Failed to upload ${type}`,
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: `Failed to upload ${type}`,
                variant: 'destructive',
            });
        } finally {
            if (type === 'logo') setUploadingLogo(false);
            else setUploadingFavicon(false);
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

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/v1/admin/settings', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setSettings(data.data);
            }
        } catch (err) {
            // Use default settings if API fails
            toast({
                title: 'Warning',
                description: 'Failed to load settings, using defaults.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const response = await fetch('/api/v1/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token} `
                },
                body: JSON.stringify(settings)
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Success',
                    description: 'Settings saved successfully!',
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to save settings',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to save settings',
                variant: 'destructive',
            });
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

    const handleTestEmail = async () => {
        if (!testEmailAddress) {
            toast({
                title: 'Error',
                description: 'Please enter an email address to test',
                variant: 'destructive',
            });
            return;
        }

        setTestingEmail(true);

        try {
            const response = await fetch('/api/v1/admin/settings/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token} `
                },
                body: JSON.stringify({ testEmail: testEmailAddress })
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Test email sent successfully to ${testEmailAddress} !`,
                });
                setTestEmailAddress('');
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to send test email',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to send test email. Please check your SMTP settings.',
                variant: 'destructive',
            });
        } finally {
            setTestingEmail(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 1 * 1024 * 1024; // 2MB for logo, 1MB for favicon
        if (file.size > maxSize) {
            toast({
                title: 'Error',
                description: `${type === 'logo' ? 'Logo' : 'Favicon'} file size must be less than ${type === 'logo' ? '2MB' : '1MB'} `,
                variant: 'destructive',
            });
            return;
        }

        // Validate file type
        const allowedTypes = type === 'logo' ? ['image/jpeg', 'image/png', 'image/svg+xml'] : ['image/x-icon', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Error',
                description: `Invalid file type for ${type}.${type === 'logo' ? 'PNG, JPG, SVG allowed' : 'ICO, PNG allowed'} `,
                variant: 'destructive',
            });
            return;
        }

        if (type === 'logo') setUploadingLogo(true);
        else setUploadingFavicon(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const response = await fetch('/api/v1/admin/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token} ` },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                updateSetting('general', type, data.data.url);
                toast({
                    title: 'Success',
                    description: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`,
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.error || `Failed to upload ${type} `,
                    variant: 'destructive',
                });
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: `Failed to upload ${type} `,
                variant: 'destructive',
            });
        } finally {
            if (type === 'logo') setUploadingLogo(false);
            else setUploadingFavicon(false);
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
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                                    <p className="text-gray-600 mt-2">
                                        Configure your application settings and preferences.
                                    </p>
                                </div>
                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="general" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="general" className="flex items-center gap-1 text-xs md:text-sm">
                                    <Globe className="w-4 h-4" />
                                    <span className="hidden sm:inline">General</span>
                                </TabsTrigger>
                                <TabsTrigger value="smtp" className="flex items-center gap-1 text-xs md:text-sm">
                                    <Mail className="w-4 h-4" />
                                    <span className="hidden sm:inline">Email/SMTP</span>
                                </TabsTrigger>
                                <TabsTrigger value="seo" className="flex items-center gap-1 text-xs md:text-sm">
                                    <Search className="w-4 h-4" />
                                    <span className="hidden sm:inline">SEO</span>
                                </TabsTrigger>
                                <TabsTrigger value="payment" className="flex items-center gap-1 text-xs md:text-sm">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="hidden sm:inline">Payment</span>
                                </TabsTrigger>
                                <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs md:text-sm">
                                    <Bell className="w-4 h-4" />
                                    <span className="hidden sm:inline">Notifications</span>
                                </TabsTrigger>
                                <TabsTrigger value="security" className="flex items-center gap-1 text-xs md:text-sm">
                                    <Shield className="w-4 h-4" />
                                    <span className="hidden sm:inline">Security</span>
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
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                                                disabled={uploadingLogo}
                                                            >
                                                                {uploadingLogo ? (
                                                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                                                ) : (
                                                                    <Upload className="w-4 h-4 mr-2" />
                                                                )}
                                                                Change Logo
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => updateSetting('general', 'logo', '')}
                                                                className="ml-2"
                                                                disabled={uploadingLogo}
                                                            >
                                                                <X className="w-4 h-4 mr-2" />
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`flex items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => !uploadingLogo && document.getElementById('logo-upload')?.click()}
                                                    >
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            {uploadingLogo ? (
                                                                <RefreshCw className="w-8 h-8 mb-3 text-gray-400 animate-spin" />
                                                            ) : (
                                                                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                                            )}
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
                                                            disabled={uploadingLogo}
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
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => document.getElementById('favicon-upload')?.click()}
                                                                disabled={uploadingFavicon}
                                                            >
                                                                {uploadingFavicon ? (
                                                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                                                ) : (
                                                                    <Upload className="w-4 h-4 mr-2" />
                                                                )}
                                                                Change Favicon
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => updateSetting('general', 'favicon', '')}
                                                                className="ml-2"
                                                                disabled={uploadingFavicon}
                                                            >
                                                                <X className="w-4 h-4 mr-2" />
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`flex items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${uploadingFavicon ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => !uploadingFavicon && document.getElementById('favicon-upload')?.click()}
                                                    >
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            {uploadingFavicon ? (
                                                                <RefreshCw className="w-6 h-6 mb-2 text-gray-400 animate-spin" />
                                                            ) : (
                                                                <Upload className="w-6 h-6 mb-2 text-gray-400" />
                                                            )}
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
                                                            disabled={uploadingFavicon}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SMTP/Email Settings */}
                            <TabsContent value="smtp">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Mail className="w-5 h-5 mr-2" />
                                            SMTP / Email Configuration
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Configure your external email service for sending order confirmations, notifications, and other emails.
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="smtpHost">SMTP Host *</Label>
                                                <Input
                                                    id="smtpHost"
                                                    placeholder="smtp.gmail.com"
                                                    value={settings.smtp.smtpHost}
                                                    onChange={(e) => updateSetting('smtp', 'smtpHost', e.target.value)}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">e.g., smtp.gmail.com, smtp.office365.com</p>
                                            </div>

                                            <div>
                                                <Label htmlFor="smtpPort">SMTP Port *</Label>
                                                <Input
                                                    id="smtpPort"
                                                    type="number"
                                                    placeholder="587"
                                                    value={settings.smtp.smtpPort}
                                                    onChange={(e) => updateSetting('smtp', 'smtpPort', parseInt(e.target.value))}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Common ports: 587 (TLS), 465 (SSL), 25</p>
                                            </div>

                                            <div>
                                                <Label htmlFor="smtpUser">SMTP Username *</Label>
                                                <Input
                                                    id="smtpUser"
                                                    placeholder="your-email@gmail.com"
                                                    value={settings.smtp.smtpUser}
                                                    onChange={(e) => updateSetting('smtp', 'smtpUser', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="smtpPassword">SMTP Password *</Label>
                                                <Input
                                                    id="smtpPassword"
                                                    type="password"
                                                    placeholder="App password or SMTP password"
                                                    value={settings.smtp.smtpPassword}
                                                    onChange={(e) => updateSetting('smtp', 'smtpPassword', e.target.value)}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Use app-specific password for Gmail</p>
                                            </div>

                                            <div>
                                                <Label htmlFor="smtpFromEmail">From Email Address *</Label>
                                                <Input
                                                    id="smtpFromEmail"
                                                    type="email"
                                                    placeholder="noreply@yourdomain.com"
                                                    value={settings.smtp.smtpFromEmail}
                                                    onChange={(e) => updateSetting('smtp', 'smtpFromEmail', e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="smtpFromName">From Name</Label>
                                                <Input
                                                    id="smtpFromName"
                                                    placeholder="Green Energy Solutions"
                                                    value={settings.smtp.smtpFromName}
                                                    onChange={(e) => updateSetting('smtp', 'smtpFromName', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                                            <Switch
                                                id="smtpSecure"
                                                checked={settings.smtp.smtpSecure}
                                                onCheckedChange={(checked) => updateSetting('smtp', 'smtpSecure', checked)}
                                            />
                                            <div>
                                                <Label htmlFor="smtpSecure" className="cursor-pointer">Use SSL/TLS (Port 465)</Label>
                                                <p className="text-xs text-gray-500">Enable for port 465, disable for port 587</p>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Common SMTP Providers:</h4>
                                            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                                                <p><strong>Gmail:</strong> smtp.gmail.com (587) - Use app password</p>
                                                <p><strong>Office 365:</strong> smtp.office365.com (587)</p>
                                                <p><strong>Outlook:</strong> smtp-mail.outlook.com (587)</p>
                                                <p><strong>SendGrid:</strong> smtp.sendgrid.net (587)</p>
                                                <p><strong>Mailgun:</strong> smtp.mailgun.org (587)</p>
                                            </div>
                                        </div>

                                        {/* Test Email Section */}
                                        <div className="border-t pt-6 space-y-4">
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Test SMTP Configuration</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Make sure to save your settings before testing. Enter an email address to receive a test email.
                                            </p>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="email"
                                                    placeholder="Enter email address for test"
                                                    value={testEmailAddress}
                                                    onChange={(e) => setTestEmailAddress(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleTestEmail}
                                                    disabled={testingEmail || !testEmailAddress}
                                                >
                                                    {testingEmail ? (
                                                        <>
                                                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            Send Test
                                                        </>
                                                    )}
                                                </Button>
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
                                                    <p className="text-sm text-gray-600">Send order confirmation emails to customers</p>
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
                                                    <p className="text-sm text-gray-600">Send payment reminders for pending orders</p>
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
                                                    <p className="text-sm text-gray-600">Get notified when product stock is low</p>
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
                                                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication (2FA)</Label>
                                                    <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                                                </div>
                                                <Switch
                                                    id="twoFactorAuth"
                                                    checked={settings.security.twoFactorAuth}
                                                    onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                                <Input
                                                    id="sessionTimeout"
                                                    type="number"
                                                    value={settings.security.sessionTimeout}
                                                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Automatically log out inactive users after this time
                                                </p>
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
                                                        <SelectItem value="standard">Standard (Min 8 chars)</SelectItem>
                                                        <SelectItem value="strong">Strong (Min 10 chars, special char)</SelectItem>
                                                        <SelectItem value="strict">Strict (Min 12 chars, complex)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </form>
                </div>
            </div>
        </div>
    );
}
