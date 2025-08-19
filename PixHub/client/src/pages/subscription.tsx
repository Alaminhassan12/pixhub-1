import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PaymentModal from "@/components/payment-modal";
import { Check, Star, Crown, Zap } from "lucide-react";

export default function Subscription() {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "lifetime" | null>(null);

  const plans = [
    {
      id: "monthly" as const,
      name: "Monthly",
      price: "$4.99",
      period: "/month",
      savings: null,
      icon: Zap,
      popular: false,
      features: [
        "Unlimited downloads",
        "High-resolution images", 
        "No watermarks",
        "Premium support",
        "Commercial license",
      ],
    },
    {
      id: "yearly" as const,
      name: "Yearly",
      price: "$28.99",
      period: "/year",
      savings: "Save 52%",
      icon: Star,
      popular: true,
      features: [
        "Everything in Monthly",
        "Priority downloads",
        "Early access to new content",
        "Advanced search filters",
        "Extended commercial license",
      ],
    },
    {
      id: "lifetime" as const,
      name: "Lifetime",
      price: "$99.99",
      period: "/forever",
      savings: "Best Value",
      icon: Crown,
      popular: false,
      features: [
        "Everything in Yearly",
        "Lifetime access",
        "Exclusive content",
        "VIP support",
        "Full commercial rights",
      ],
    },
  ];

  const networks = [
    { name: "TRC20", description: "Tron Network" },
    { name: "BEP20", description: "Binance Smart Chain" },
    { name: "ERC20", description: "Ethereum Network" },
  ];

  const handlePlanSelect = (planId: "monthly" | "yearly" | "lifetime") => {
    setSelectedPlan(planId);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-hero-title">
              Choose Your Plan
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto" data-testid="text-hero-description">
              Unlock unlimited downloads, exclusive content, and premium features
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={`card-3d relative ${
                    plan.popular
                      ? "transform scale-105 border-primary-500 bg-gradient-to-b from-white to-primary-50"
                      : "bg-white"
                  }`}
                  data-testid={`card-plan-${plan.id}`}
                >
                  {plan.popular && (
                    <Badge className="premium-badge absolute -top-3 left-1/2 transform -translate-x-1/2 text-white px-6 py-2 rounded-full font-bold" data-testid="badge-popular">
                      MOST POPULAR
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2" data-testid={`text-plan-name-${plan.id}`}>
                      {plan.name}
                    </CardTitle>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-primary-500" data-testid={`text-plan-price-${plan.id}`}>
                        {plan.price}
                      </span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700" data-testid={`badge-savings-${plan.id}`}>
                        {plan.savings}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start" data-testid={`feature-${plan.id}-${index}`}>
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      className={`w-full py-3 rounded-xl font-semibold ${
                        plan.popular
                          ? "btn-3d text-white"
                          : "border border-primary-500 text-primary-500 hover:bg-primary-50"
                      }`}
                      onClick={() => handlePlanSelect(plan.id)}
                      data-testid={`button-select-${plan.id}`}
                    >
                      {plan.popular ? "Best Value" : plan.id === "lifetime" ? "One Time Payment" : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment Networks */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8" data-testid="text-networks-title">
            Accepted Payment Networks
          </h2>
          <div className="flex justify-center space-x-8 max-w-2xl mx-auto">
            {networks.map((network, index) => (
              <Card key={index} className="card-3d bg-white p-6 flex-1 text-center" data-testid={`card-network-${network.name.toLowerCase()}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg" data-testid={`text-network-name-${network.name.toLowerCase()}`}>
                    {network.name}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900" data-testid={`text-network-title-${network.name.toLowerCase()}`}>
                  {network.name}
                </h3>
                <p className="text-sm text-gray-600" data-testid={`text-network-description-${network.name.toLowerCase()}`}>
                  {network.description}
                </p>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 max-w-2xl mx-auto">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-blue-900 mb-2" data-testid="text-payment-info-title">
                  How It Works
                </h3>
                <div className="text-sm text-blue-800 space-y-2 text-left">
                  <p data-testid="step-1">1. Select your preferred plan and payment network</p>
                  <p data-testid="step-2">2. Send payment to the provided wallet address</p>
                  <p data-testid="step-3">3. Submit your transaction ID for verification</p>
                  <p data-testid="step-4">4. Enjoy premium access once payment is confirmed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" data-testid="text-faq-title">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" data-testid="faq-question-1">
                  How long does payment verification take?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600" data-testid="faq-answer-1">
                  Payment verification typically takes 1-24 hours. Our team manually verifies each transaction on the blockchain to ensure security and accuracy.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" data-testid="faq-question-2">
                  Can I cancel my subscription?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600" data-testid="faq-answer-2">
                  Yes, you can cancel your subscription at any time. For monthly and yearly plans, you'll continue to have access until the end of your billing period. Lifetime plans cannot be refunded after payment confirmation.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" data-testid="faq-question-3">
                  What's included with commercial license?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600" data-testid="faq-answer-3">
                  Commercial license allows you to use images for business purposes, marketing materials, websites, and any commercial projects. Attribution is not required but appreciated.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
}
