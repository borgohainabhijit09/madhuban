"use client";

import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, CreditCard, Truck, MapPin, Loader2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pinCode: ''
  });
  
  const [shippingRates, setShippingRates] = useState<Record<string, number>>({});
  const [shippingCost, setShippingCost] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [step, setStep] = useState(1); // 1 = Address, 2 = Payment

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = 0; // No taxes for now per user request
  const total = subtotal + tax + shippingCost;

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Fetch Addresses
        const { data: addrs } = await supabase.from('Address').select('*').eq('userId', user.id);
        if (addrs && addrs.length > 0) {
          setAddresses(addrs);
          setSelectedAddress(addrs[0]);
        }
      }

      // Fetch Shipping Rates
      const { data: rates } = await supabase.from('ShippingRate').select('*');
      if (rates) {
        const rateMap: Record<string, number> = {};
        rates.forEach(r => rateMap[r.state] = r.rate);
        setShippingRates(rateMap);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    if (selectedAddress) {
      const state = selectedAddress.state;
      const rate = shippingRates[state] || 0;
      setShippingCost(rate);
    } else if (guestInfo.state) {
      const rate = shippingRates[guestInfo.state] || 0;
      setShippingCost(rate);
    } else {
      setShippingCost(0);
    }
  }, [selectedAddress, guestInfo.state, shippingRates]);

  const handlePlaceOrder = async () => {
    if (!user && (!guestInfo.name || !guestInfo.email || !guestInfo.phone || !guestInfo.address || !guestInfo.city || !guestInfo.state || !guestInfo.pinCode)) {
      alert("Please complete the shipping address first.");
      return;
    }
    if (user && !selectedAddress) {
      alert("Please select a shipping address.");
      return;
    }
    if (items.length === 0) return;
    
    setIsPlacingOrder(true);
    const supabase = createClient();

    try {
      let finalUserId = '';
      let finalAddressId = '';

      if (user) {
        finalUserId = user.id;
        finalAddressId = selectedAddress.id;
      } else {
        // Guest Flow:
        // 1. Check if user already exists in public.User
        const { data: existingUser } = await supabase
          .from('User')
          .select('id')
          .eq('email', guestInfo.email.toLowerCase().trim())
          .maybeSingle();

        if (existingUser) {
          finalUserId = existingUser.id;
        } else {
          // Create a new guest user row
          finalUserId = 'usr_guest_' + Math.random().toString(36).substring(2, 10);
          const { error: userError } = await supabase.from('User').insert({
            id: finalUserId,
            email: guestInfo.email.toLowerCase().trim(),
            name: guestInfo.name.trim(),
            phone: guestInfo.phone.trim(),
            password: 'guest_account_placeholder',
            role: 'CUSTOMER',
            updatedAt: new Date().toISOString()
          });
          if (userError) throw userError;
        }

        // 2. Create a new guest Address row
        finalAddressId = 'addr_guest_' + Math.random().toString(36).substring(2, 10);
        const { error: addressError } = await supabase.from('Address').insert({
          id: finalAddressId,
          userId: finalUserId,
          type: 'SHIPPING',
          address: guestInfo.address.trim(),
          city: guestInfo.city.trim(),
          state: guestInfo.state,
          pinCode: guestInfo.pinCode.trim()
        });
        if (addressError) throw addressError;
      }

      // 3. Create Order
      const orderId = 'ord_' + Math.random().toString(36).substring(2, 10);
      const { error: orderError } = await supabase.from('Order').insert({
        id: orderId,
        userId: finalUserId,
        addressId: finalAddressId,
        status: 'PENDING',
        totalAmount: total,
        taxAmount: tax,
        shippingAmount: shippingCost,
        notes: "COD"
      });

      if (orderError) throw orderError;

      // 4. Create Order Items
      const orderItemsToInsert = items.map(item => ({
        id: 'itm_' + Math.random().toString(36).substring(2, 10),
        orderId: orderId,
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase.from('OrderItem').insert(orderItemsToInsert);
      if (itemsError) throw itemsError;

      // 5. Clear Cart & Redirect
      clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);

    } catch (err) {
      console.error("Order failed:", err);
      alert("There was an error placing your order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <Loader2 className="animate-spin w-10 h-10 text-[#C89F5F]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-300 mb-6 shadow-sm">
          <Truck size={32} />
        </div>
        <h1 className="font-heading text-3xl font-bold text-[#3A1E14] mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">You cannot proceed to checkout without items in your cart.</p>
        <Link href="/shop" className="bg-[#3A1E14] text-white px-8 py-3 rounded-xl font-medium shadow-md hover:bg-[#2A140B] transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] py-6">
      <div className="max-w-[1100px] mx-auto px-6">
        <h1 className="font-heading text-2xl font-bold text-[#3A1E14] mb-6">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Checkout Flow */}
          <div className="lg:w-[60%] space-y-4">
            
            {/* Step 1: Shipping Address */}
            <div className={`bg-white p-5 rounded-xl border ${step === 1 ? 'border-[#C89F5F] shadow-sm' : 'border-gray-200 opacity-80'}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-[#3A1E14] flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full bg-[#C89F5F] text-white text-xs flex items-center justify-center`}>1</span>
                  Shipping Address
                </h2>
                {step > 1 && <button onClick={() => setStep(1)} className="text-[#C89F5F] text-xs font-bold hover:underline">Edit</button>}
              </div>
              
              {step === 1 && (
                <div className="space-y-4">
                  {user ? (
                    addresses.length === 0 ? (
                      <div className="bg-[#FAF8F5] p-6 rounded-xl border border-[#EAE2DB] text-center">
                        <MapPin className="mx-auto mb-3 text-[#C89F5F]" size={24} />
                        <p className="text-gray-600 font-medium mb-4">You have no saved addresses.</p>
                        <Link href="/account/addresses" className="inline-flex items-center gap-2 bg-white border border-[#C89F5F] text-[#5c2a1c] px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#C89F5F] hover:text-white transition-colors">
                          <Plus size={16} /> Add Address First
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {addresses.map(addr => (
                            <div 
                              key={addr.id}
                              onClick={() => setSelectedAddress(addr)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-[#C89F5F] bg-[#FAF8F5]' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-[#3A1E14] text-sm flex items-center gap-2">
                                  {addr.type}
                                  {selectedAddress?.id === addr.id && <CheckCircle2 size={16} className="text-[#C89F5F]" />}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {user.user_metadata?.name || user.name || 'Customer'}<br/>
                                {addr.address}<br/>
                                {addr.city}, {addr.state} - {addr.pinCode}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          <Link href="/account/addresses" className="text-xs font-bold text-[#C89F5F] hover:underline">
                            + Manage Addresses
                          </Link>
                          <button 
                            onClick={() => setStep(2)} 
                            disabled={!selectedAddress}
                            className="bg-[#3A1E14] text-white px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </>
                    )
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                        <span>Already have an account? Sign in for a faster checkout.</span>
                        <Link href="/login?redirect=/checkout" className="bg-[#3A1E14] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2A140B] transition-colors whitespace-nowrap">
                          Sign In
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#3A1E14]">Full Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="John Doe"
                            value={guestInfo.name}
                            onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#3A1E14]">Phone Number *</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="9876543210"
                            value={guestInfo.phone}
                            onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3A1E14]">Email Address *</label>
                        <input 
                          type="email" 
                          required
                          placeholder="john@example.com"
                          value={guestInfo.email}
                          onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3A1E14]">Street Address *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="House No, Street, Area"
                          value={guestInfo.address}
                          onChange={(e) => setGuestInfo({...guestInfo, address: e.target.value})}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F]"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5 col-span-1">
                          <label className="text-xs font-bold text-[#3A1E14]">City *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Guwahati"
                            value={guestInfo.city}
                            onChange={(e) => setGuestInfo({...guestInfo, city: e.target.value})}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F]"
                          />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <label className="text-xs font-bold text-[#3A1E14]">State *</label>
                          <select 
                            required
                            value={guestInfo.state}
                            onChange={(e) => setGuestInfo({...guestInfo, state: e.target.value})}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F] bg-white"
                          >
                            <option value="">Select State</option>
                            {["Assam", "Arunachal Pradesh", "Delhi", "Karnataka", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "West Bengal"].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <label className="text-xs font-bold text-[#3A1E14]">Pin Code *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="781001"
                            value={guestInfo.pinCode}
                            onChange={(e) => setGuestInfo({...guestInfo, pinCode: e.target.value})}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C89F5F]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button 
                          type="button"
                          onClick={() => {
                            if (!guestInfo.name || !guestInfo.email || !guestInfo.phone || !guestInfo.address || !guestInfo.city || !guestInfo.state || !guestInfo.pinCode) {
                              alert("Please fill in all required fields.");
                              return;
                            }
                            setStep(2);
                          }}
                          className="bg-[#3A1E14] text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-[#2A140B] transition-colors"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className={`bg-white p-5 rounded-xl border ${step === 2 ? 'border-[#C89F5F] shadow-sm' : 'border-gray-200 opacity-80'}`}>
              <h2 className="font-bold text-lg text-[#3A1E14] flex items-center gap-2 mb-4">
                <span className={`w-6 h-6 rounded-full ${step === 2 ? 'bg-[#C89F5F]' : 'bg-gray-300'} text-white text-xs flex items-center justify-center`}>2</span>
                Payment Method
              </h2>
              
              {step === 2 && (
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 opacity-50 cursor-not-allowed">
                    <input type="radio" name="payment" disabled className="w-4 h-4 text-gray-300" />
                    <label className="flex-1 font-medium text-sm text-gray-500 flex justify-between items-center">
                      <span>Credit / Debit Card (Coming Soon)</span>
                      <CreditCard size={16} className="text-gray-400" />
                    </label>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 opacity-50 cursor-not-allowed">
                    <input type="radio" name="payment" disabled className="w-4 h-4 text-gray-300" />
                    <label className="flex-1 font-medium text-sm text-gray-500">UPI (Coming Soon)</label>
                  </div>
                  <div className="border border-[#C89F5F] rounded-lg p-3 flex items-center gap-3 bg-[#FAF8F5]">
                    <input type="radio" name="payment" id="cod" className="w-4 h-4 text-[#C89F5F]" defaultChecked />
                    <label htmlFor="cod" className="flex-1 font-bold text-sm text-[#3A1E14] cursor-pointer">Cash on Delivery</label>
                  </div>
                  
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={isPlacingOrder}
                    className="bg-[#C89F5F] hover:bg-[#b08b50] text-white px-6 py-3 rounded-xl font-bold mt-6 w-full flex items-center justify-center gap-2 text-base shadow-sm disabled:opacity-70 transition-all"
                  >
                    {isPlacingOrder ? <Loader2 size={20} className="animate-spin" /> : (
                      <>Place Order - ₹{total.toFixed(2)} <CheckCircle2 size={18} /></>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:w-[40%]">
            <div className="bg-white rounded-xl p-5 border border-gray-200 sticky top-24 shadow-sm">
              <h3 className="font-heading font-bold text-lg text-[#3A1E14] mb-4 border-b border-gray-100 pb-3">Order Summary</h3>
              
              <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg shrink-0 flex items-center justify-center border border-gray-100 relative overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt="item" fill className="object-cover" />
                        ) : (
                          <span className="text-[8px] text-gray-400">IMG</span>
                        )}
                      </div>
                      <span className="text-[#3A1E14] font-medium text-xs truncate pr-2 max-w-[150px]">{item.quantity}x {item.name}</span>
                    </div>
                    <span className="font-bold text-[#5c2a1c] text-xs shrink-0">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span className="text-[#3A1E14]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Shipping Fee</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-bold" : "text-[#3A1E14]"}>
                    {shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-4 flex justify-between items-end">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Final Total</span>
                <span className="font-bold text-xl text-[#2E7D32]">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
