import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, QrCode } from "lucide-react";
import { showPaymentSuccess, showError, showSuccess } from "@/lib/sweetalert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: "monthly" | "yearly" | "lifetime" | null;
}

const planDetails = {
  monthly: { name: "Monthly", price: "$4.99", amount: "4.99" },
  yearly: { name: "Yearly", price: "$28.99", amount: "28.99" },
  lifetime: { name: "Lifetime", price: "$99.99", amount: "99.99" },
};

const networkAddresses = {
  TRC20: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
  BEP20: "0x742d35CC6634C0532925a3b8D4C8F2E5aa6e1234",
  ERC20: "0x742d35CC6634C0532925a3b8D4C8F2E5aa6e5678",
};

export default function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("TRC20");
  const [transactionId, setTransactionId] = useState("");
  const queryClient = useQueryClient();

  const submitPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      return apiRequest("POST", "/api/payments", paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      showPaymentSuccess();
      onClose();
      setTransactionId("");
    },
    onError: () => {
      showError("Payment Error", "Failed to submit payment. Please try again.");
    },
  });

  if (!plan) return null;

  const currentPlan = planDetails[plan];
  const paymentAddress = networkAddresses[selectedNetwork as keyof typeof networkAddresses];

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(paymentAddress);
      showSuccess("Copied!", "Payment address copied to clipboard");
    } catch (error) {
      showError("Copy Failed", "Unable to copy address. Please copy manually.");
    }
  };

  const handleSubmitPayment = () => {
    if (!transactionId.trim()) {
      showError("Error", "Please enter a transaction ID");
      return;
    }

    // TODO: In a real app, you'd get the user ID from authentication context
    const userId = "demo-user-id";

    submitPaymentMutation.mutate({
      userId,
      plan,
      network: selectedNetwork,
      walletAddress: paymentAddress,
      amountUSD: currentPlan.amount,
      txid: transactionId.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full" data-testid="modal-payment">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900" data-testid="text-modal-title">
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Details */}
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900" data-testid={`text-plan-${plan}`}>
                    {currentPlan.name} Plan
                  </h3>
                  <p className="text-sm text-gray-600">Premium access</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-500" data-testid={`text-price-${plan}`}>
                    {currentPlan.price}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Selection */}
          <div className="space-y-2">
            <Label htmlFor="network" className="text-sm font-medium text-gray-700">
              Select Network
            </Label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger data-testid="select-network">
                <SelectValue placeholder="Select payment network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRC20" data-testid="option-trc20">TRC20 (Tron)</SelectItem>
                <SelectItem value="BEP20" data-testid="option-bep20">BEP20 (BSC)</SelectItem>
                <SelectItem value="ERC20" data-testid="option-erc20">ERC20 (Ethereum)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Address */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Payment Address</Label>
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <p className="font-mono text-sm break-all mb-2" data-testid="text-payment-address">
                  {paymentAddress}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="text-primary-500 p-0 h-auto hover:underline"
                  data-testid="button-copy-address"
                >
                  <Copy size={14} className="mr-1" />
                  Copy Address
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* QR Code Placeholder */}
          <div className="text-center">
            <Card className="w-32 h-32 mx-auto">
              <CardContent className="w-full h-full flex items-center justify-center p-4">
                <QrCode size={64} className="text-gray-400" />
              </CardContent>
            </Card>
            <p className="text-sm text-gray-600 mt-2" data-testid="text-qr-description">
              QR Code for easy payment
            </p>
          </div>

          {/* Transaction ID Input */}
          <div className="space-y-2">
            <Label htmlFor="txid" className="text-sm font-medium text-gray-700">
              Transaction ID
            </Label>
            <Input
              id="txid"
              type="text"
              placeholder="Enter your transaction ID..."
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              data-testid="input-transaction-id"
            />
          </div>

          {/* Submit Button */}
          <Button
            className="btn-3d w-full text-white py-3 rounded-xl font-semibold"
            onClick={handleSubmitPayment}
            disabled={submitPaymentMutation.isPending || !transactionId.trim()}
            data-testid="button-submit-payment"
          >
            {submitPaymentMutation.isPending ? "Submitting..." : "Submit Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
