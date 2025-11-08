'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Gift, CreditCard, Check, AlertCircle } from 'lucide-react';

export default function GiftCardsPage() {
    const [purchaseOpen, setPurchaseOpen] = useState(false);
    const [checkOpen, setCheckOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [senderName, setSenderName] = useState('');
    const [message, setMessage] = useState('');
    const [purchasing, setPurchasing] = useState(false);
    const [purchasedCard, setPurchasedCard] = useState<any>(null);

    // Check balance
    const [checkCode, setCheckCode] = useState('');
    const [checking, setChecking] = useState(false);
    const [balanceInfo, setBalanceInfo] = useState<any>(null);

    const { toast } = useToast();

    const handlePurchase = async () => {
        // Validation
        const amountNum = parseFloat(amount);
        if (!amount || isNaN(amountNum) || amountNum < 100 || amountNum > 50000) {
            toast({
                title: 'Validation Error',
                description: 'Amount must be between ₹100 and ₹50,000',
                variant: 'destructive',
            });
            return;
        }

        if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a valid recipient email',
                variant: 'destructive',
            });
            return;
        }

        try {
            setPurchasing(true);
            const token = localStorage.getItem('token');

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch('/api/v1/gift-cards', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    amount: amountNum,
                    recipientEmail,
                    recipientName: recipientName || undefined,
                    senderName: senderName || undefined,
                    message: message || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setPurchasedCard(data.data);
                toast({
                    title: 'Success',
                    description: 'Gift card purchased successfully!',
                });

                // Reset form
                setAmount('');
                setRecipientName('');
                setRecipientEmail('');
                setSenderName('');
                setMessage('');
                setPurchaseOpen(false);

                // Show success message with code
                setTimeout(() => {
                    toast({
                        title: 'Gift Card Code',
                        description: `Your gift card code is: ${data.data.code}`,
                    });
                }, 500);
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to purchase gift card',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to purchase gift card',
                variant: 'destructive',
            });
        } finally {
            setPurchasing(false);
        }
    };

    const handleCheckBalance = async () => {
        if (!checkCode.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a gift card code',
                variant: 'destructive',
            });
            return;
        }

        try {
            setChecking(true);
            setBalanceInfo(null);

            const response = await fetch(`/api/v1/gift-cards?code=${encodeURIComponent(checkCode)}`);
            const data = await response.json();

            if (data.success) {
                setBalanceInfo(data.data);
            } else {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to check balance',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to check balance',
                variant: 'destructive',
            });
        } finally {
            setChecking(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'USED':
                return 'bg-blue-100 text-blue-800';
            case 'EXPIRED':
                return 'bg-gray-100 text-gray-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Gift Cards</h1>
                <p className="text-muted-foreground">
                    Purchase gift cards or check your balance
                </p>
            </div>

            {/* Main Actions */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Purchase Gift Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-5 w-5" />
                            Purchase Gift Card
                        </CardTitle>
                        <CardDescription>
                            Send a gift card to friends or family
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                                <CreditCard className="h-8 w-8 mb-3 opacity-80" />
                                <p className="text-sm opacity-90 mb-2">Perfect for any occasion</p>
                                <p className="text-2xl font-bold">₹100 - ₹50,000</p>
                                <p className="text-sm opacity-80 mt-2">Valid for 1 year</p>
                            </div>

                            <Button
                                onClick={() => setPurchaseOpen(true)}
                                className="w-full"
                                size="lg"
                            >
                                <Gift className="mr-2 h-4 w-4" />
                                Purchase Gift Card
                            </Button>

                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    Instant delivery via email
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    Valid for 1 year from purchase
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-600" />
                                    Can be used for any product
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Check Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Check Gift Card Balance
                        </CardTitle>
                        <CardDescription>
                            Enter your gift card code to check the balance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label>Gift Card Code</Label>
                                <Input
                                    value={checkCode}
                                    onChange={(e) => setCheckCode(e.target.value)}
                                    placeholder="GC-XXXXXXXXXXXX"
                                    className="font-mono"
                                />
                            </div>

                            <Button
                                onClick={handleCheckBalance}
                                className="w-full"
                                disabled={checking}
                            >
                                {checking ? 'Checking...' : 'Check Balance'}
                            </Button>

                            {/* Balance Info */}
                            {balanceInfo && (
                                <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Card Code</p>
                                            <p className="font-mono font-semibold">{balanceInfo.code}</p>
                                        </div>
                                        <Badge className={getStatusColor(balanceInfo.status)}>
                                            {balanceInfo.status}
                                        </Badge>
                                    </div>

                                    <div className="border-t pt-3">
                                        <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            ₹{balanceInfo.currentBalance.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            of ₹{balanceInfo.initialAmount.toFixed(2)} initial amount
                                        </p>
                                    </div>

                                    <div className="border-t pt-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Expires:</span>
                                            <span>{new Date(balanceInfo.expiresAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {balanceInfo.status === 'EXPIRED' && (
                                        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                            <p className="text-sm text-red-800">
                                                This gift card has expired and can no longer be used.
                                            </p>
                                        </div>
                                    )}

                                    {balanceInfo.status === 'CANCELLED' && (
                                        <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                                            <p className="text-sm text-red-800">
                                                This gift card has been cancelled.
                                            </p>
                                        </div>
                                    )}

                                    {balanceInfo.status === 'USED' && balanceInfo.currentBalance === 0 && (
                                        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                                            <p className="text-sm text-blue-800">
                                                This gift card has been fully used.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recently Purchased */}
            {purchasedCard && (
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-900">
                            <Check className="h-5 w-5" />
                            Gift Card Purchased!
                        </CardTitle>
                        <CardDescription className="text-green-800">
                            Your gift card has been created and sent to the recipient
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-white rounded-lg p-4 space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Gift Card Code</p>
                                <p className="font-mono font-bold text-lg">{purchasedCard.code}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Save this code or forward the email to the recipient
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t pt-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Amount</p>
                                    <p className="font-semibold">₹{purchasedCard.initialAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Expires</p>
                                    <p className="font-semibold">
                                        {new Date(purchasedCard.expiresAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {purchasedCard.recipientEmail && (
                                <div className="border-t pt-3">
                                    <p className="text-sm text-muted-foreground">Sent to</p>
                                    <p className="font-medium">{purchasedCard.recipientEmail}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* How It Works */}
            <Card>
                <CardHeader>
                    <CardTitle>How Gift Cards Work</CardTitle>
                    <CardDescription>Everything you need to know about our gift cards</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold mb-3">For Purchasers</h3>
                            <ol className="space-y-2 text-sm text-muted-foreground">
                                <li>1. Choose an amount between ₹100 and ₹50,000</li>
                                <li>2. Enter recipient's email and optional personal message</li>
                                <li>3. Complete the purchase</li>
                                <li>4. Recipient receives the gift card code via email</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">For Recipients</h3>
                            <ol className="space-y-2 text-sm text-muted-foreground">
                                <li>1. Receive gift card code via email</li>
                                <li>2. Shop for any products on our store</li>
                                <li>3. Apply gift card code at checkout</li>
                                <li>4. Balance is deducted from the order total</li>
                            </ol>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Purchase Dialog */}
            <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Purchase Gift Card</DialogTitle>
                        <DialogDescription>
                            Fill in the details to purchase a gift card
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Amount (₹) *</Label>
                            <Input
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount (100 - 50,000)"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Minimum ₹100, Maximum ₹50,000
                            </p>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Recipient Details</h3>

                            <div className="space-y-3">
                                <div>
                                    <Label>Recipient Name</Label>
                                    <Input
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                        placeholder="Their name"
                                    />
                                </div>

                                <div>
                                    <Label>Recipient Email *</Label>
                                    <Input
                                        type="email"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        placeholder="their@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Personal Touch (Optional)</h3>

                            <div className="space-y-3">
                                <div>
                                    <Label>Your Name</Label>
                                    <Input
                                        value={senderName}
                                        onChange={(e) => setSenderName(e.target.value)}
                                        placeholder="From..."
                                    />
                                </div>

                                <div>
                                    <Label>Personal Message</Label>
                                    <Textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Add a personal message..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPurchaseOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handlePurchase} disabled={purchasing}>
                            {purchasing ? 'Processing...' : 'Purchase Gift Card'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
