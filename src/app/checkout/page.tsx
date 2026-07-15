'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, mapDbOrderToFrontendOrder } from '@/store/useStore';
import { useHydrated } from '@/hooks/useHydrated';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  CreditCard, 
  Check, 
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  ShieldCheck,
  Building,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const deliverySlots = [
  { id: 'slot-1', label: 'Morning (8:00 AM - 11:00 AM)', fee: 'FREE' },
  { id: 'slot-2', label: 'Midday (12:00 PM - 3:00 PM)', fee: 'FREE' },
  { id: 'slot-3', label: 'Evening (5:00 PM - 8:00 PM)', fee: 'FREE' },
  { id: 'slot-4', label: 'Express (Within 1 hour)', fee: '$1.99' }
];

export const CheckoutPage = () => {
  const router = useRouter();
  const isHydrated = useHydrated();

  // Zustand State
  // Zustand State
  const cart = useStore((state) => state.cart);
  const addresses = useStore((state) => state.addresses);
  const addAddress = useStore((state) => state.addAddress);
  const updateAddress = useStore((state) => state.updateAddress);
  const deleteAddress = useStore((state) => state.deleteAddress);
  const setDefaultAddress = useStore((state) => state.setDefaultAddress);
  const fetchAddresses = useStore((state) => state.fetchAddresses);
  const validateCheckoutOnServer = useStore((state) => state.validateCheckoutOnServer);
  const checkoutSummary = useStore((state) => state.checkoutSummary);
  const coupon = useStore((state) => state.coupon);
  const placeOrderOnServer = useStore((state) => state.placeOrderOnServer);
  const clearLocalCart = useStore((state) => state.clearLocalCart);

  const getCartSubtotal = useStore((state) => state.getCartSubtotal);
  const getCartDiscount = useStore((state) => state.getCartDiscount);
  const getCartTax = useStore((state) => state.getCartTax);
  const getCartTotal = useStore((state) => state.getCartTotal);

  // Flow State
  const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Slot, 3: Payment, 4: Confirmed
  const [selectedAddressId, setSelectedAddressId] = useState(addresses.find(a => a.isDefault)?.id || addresses[0]?.id || '');
  const [selectedSlotId, setSelectedSlotId] = useState('slot-1');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'RAZORPAY'>('RAZORPAY');
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);

  // Address Form State
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddrTitle, setNewAddrTitle] = useState('Home');
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Bengaluru');
  const [newAddrState, setNewAddrState] = useState('Karnataka');
  const [newAddrZip, setNewAddrZip] = useState('');

  // Checkout Validation State
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Map Picker Modal Simulation
  const [mapOpen, setMapOpen] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });
  const [mapAddressResult, setMapAddressResult] = useState('');

  // Razorpay Overlay State
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [razorpayStep, setRazorpayStep] = useState<'LOADING' | 'INPUT' | 'OTP' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  const [razorpayPhone, setRazorpayPhone] = useState('+91 98765 43210');
  const [razorpayOTP, setRazorpayOTP] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeRazorpayOrderId, setActiveRazorpayOrderId] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);

  // Sync addresses on mount
  React.useEffect(() => {
    if (isHydrated) {
      fetchAddresses().catch(err => console.error('Failed to sync addresses:', err));
    }
  }, [isHydrated, fetchAddresses]);

  // Set initial selected address to default address if loaded
  React.useEffect(() => {
    if (isHydrated && addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses.find(a => a.isDefault)?.id || addresses[0]?.id || '');
    }
  }, [isHydrated, addresses, selectedAddressId]);

  // Validate checkout whenever address changes
  React.useEffect(() => {
    if (isHydrated && selectedAddressId) {
      setCheckoutLoading(true);
      setCheckoutError(null);
      validateCheckoutOnServer(selectedAddressId).then((res) => {
        if (!res.success) {
          setCheckoutError(res.message || 'Checkout validation failed.');
        }
      }).catch(() => {
        setCheckoutError('Network error occurred during checkout validation.');
      }).finally(() => {
        setCheckoutLoading(false);
      });
    }
  }, [selectedAddressId, isHydrated, validateCheckoutOnServer]);

  const subtotal = isHydrated ? (checkoutSummary ? checkoutSummary.summary.subtotal : getCartSubtotal()) : 0;
  const discount = isHydrated ? (checkoutSummary ? checkoutSummary.summary.discount : getCartDiscount()) : 0;
  const tax = isHydrated ? (checkoutSummary ? checkoutSummary.summary.gst : getCartTax()) : 0;
  const deliveryFeeBase = isHydrated ? (checkoutSummary ? checkoutSummary.summary.deliveryFee : (subtotal > 499 ? 0 : subtotal === 0 ? 0 : 49)) : 0;
  
  // Express fee addition
  const slotObj = deliverySlots.find(s => s.id === selectedSlotId);
  const slotExtraFee = slotObj?.id === 'slot-4' ? 49 : 0;
  const totalDeliveryFee = deliveryFeeBase + slotExtraFee;
  const total = subtotal - discount + tax + totalDeliveryFee;

  const handleStartEdit = (addr: any) => {
    setEditingAddressId(addr.id);
    setIsAddingNewAddress(true);
    setNewAddrTitle(addr.title);
    setNewAddrName(addr.name);
    setNewAddrPhone(addr.phone);
    setNewAddrStreet(addr.streetAddress);
    setNewAddrCity(addr.city);
    setNewAddrState(addr.state);
    setNewAddrZip(addr.zipCode);
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAddrName && newAddrPhone && newAddrStreet && newAddrZip) {
      const addressData = {
        title: newAddrTitle,
        name: newAddrName,
        phone: newAddrPhone,
        streetAddress: newAddrStreet,
        city: newAddrCity,
        state: newAddrState,
        zipCode: newAddrZip,
        isDefault: false
      };

      if (editingAddressId) {
        updateAddress(editingAddressId, addressData);
        setEditingAddressId(null);
      } else {
        addAddress(addressData);
      }

      setIsAddingNewAddress(false);
      // Reset form
      setNewAddrName('');
      setNewAddrPhone('');
      setNewAddrStreet('');
      setNewAddrZip('');
    }
  };

  const triggerMapSelection = () => {
    setMapOpen(true);
    setMapAddressResult('Locating coordinates...');
    setTimeout(() => {
      setMapAddressResult('Sector 4, HSR Layout, Bengaluru, Karnataka 560102');
    }, 1500);
  };

  const confirmMapSelection = () => {
    setNewAddrStreet(mapAddressResult);
    setNewAddrZip('560102');
    setMapOpen(false);
  };

  const handleRetryPayment = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      if (!activeOrderId) return;
      const res = await fetch('/api/payments/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: activeOrderId }),
      }).then((r) => r.json());

      if (res.success && res.data) {
        setActiveRazorpayOrderId(res.data.razorpayOrderId);
        setRazorpayOpen(true);
        setRazorpayStep('INPUT');
      } else {
        setCheckoutError(res.message || 'Failed to retry payment.');
      }
    } catch (err: any) {
      console.error('Error retrying payment:', err);
      setCheckoutError(err.message || 'Payment retry initialization failed.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
    const deliverySlotLabel = slotObj?.label || 'Morning';

    if (!selectedAddress) return;
    setCheckoutError(null);

    if (paymentMethod === 'RAZORPAY') {
      setCheckoutLoading(true);
      try {
        const res = await placeOrderOnServer({
          addressId: selectedAddress.id,
          paymentMethod: 'RAZORPAY',
          deliverySlot: deliverySlotLabel,
          notes: '',
        });

        if (!res.success || !res.data) {
          setCheckoutError(res.message || 'Failed to place order.');
          setCheckoutLoading(false);
          return;
        }

        const newOrderId = res.data.orderId;
        setActiveOrderId(newOrderId);

        const rpOrderRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: newOrderId }),
        }).then((r) => r.json());

        if (!rpOrderRes.success || !rpOrderRes.data) {
          setCheckoutError(rpOrderRes.message || 'Failed to generate Razorpay order.');
          setCheckoutLoading(false);
          return;
        }

        setActiveRazorpayOrderId(rpOrderRes.data.razorpayOrderId);
        setCheckoutLoading(false);
        setRazorpayOpen(true);
        setRazorpayStep('INPUT');
      } catch (err: any) {
        console.error('Error finalising payment order:', err);
        setCheckoutError(err.message || 'An unexpected error occurred during order initialization.');
        setCheckoutLoading(false);
      }
    } else {
      finalizeOrder(selectedAddress, deliverySlotLabel);
    }
  };

  const handleRazorpayPaymentSubmit = () => {
    setRazorpayStep('PROCESSING');
    setTimeout(() => {
      setRazorpayStep('OTP');
    }, 1000);
  };

  const handleRazorpayOTPSubmit = async () => {
    setRazorpayStep('PROCESSING');
    setCheckoutError(null);
    try {
      if (!activeOrderId || !activeRazorpayOrderId) {
        throw new Error('Transaction tracking ID is missing.');
      }

      const rpPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
      const rpSignature = `sig_mock_${Math.random().toString(36).substring(2, 11)}`;

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrderId,
          razorpayOrderId: activeRazorpayOrderId,
          razorpayPaymentId: rpPaymentId,
          razorpaySignature: rpSignature,
        }),
      }).then((r) => r.json());

      if (verifyRes.success) {
        setRazorpayStep('SUCCESS');
        clearLocalCart();
        setTimeout(async () => {
          setRazorpayOpen(false);
          const detailRes = await fetch(`/api/orders/${activeOrderId}`).then((r) => r.json());
          if (detailRes.success && detailRes.data) {
            const mappedOrder = mapDbOrderToFrontendOrder(detailRes.data);
            setPlacedOrderDetails(mappedOrder);
            setActiveStep(4);

            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 }
            });
          } else {
            setCheckoutError(detailRes.message || 'Failed to retrieve placed order details.');
          }
        }, 1200);
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed.');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setCheckoutError(err.message || 'Payment verification failed.');
      setPaymentFailed(true);
      setRazorpayOpen(false);
    }
  };

  const finalizeOrder = async (address: any, slot: string) => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await placeOrderOnServer({
        addressId: address.id,
        paymentMethod,
        deliverySlot: slot,
        notes: '',
      });

      if (res.success && res.data) {
        // Fetch full order receipt details from server to display
        const detailRes = await fetch(`/api/orders/${res.data.orderId}`).then((r) => r.json());
        if (detailRes.success && detailRes.data) {
          const mappedOrder = mapDbOrderToFrontendOrder(detailRes.data);
          setPlacedOrderDetails(mappedOrder);
          setActiveStep(4);

          // Confetti explosion
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          setCheckoutError(detailRes.message || 'Failed to retrieve placed order details.');
        }
      } else {
        setCheckoutError(res.message || 'Failed to place order.');
      }
    } catch (err: any) {
      console.error('Error finalising order:', err);
      setCheckoutError(err.message || 'An unexpected error occurred.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (isHydrated && cart.length === 0 && activeStep !== 4) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-800">Your checkout bag is empty</h2>
        <p className="text-slate-500 text-xs">Add fresh food items from the shop first.</p>
        <Link href="/products" className="inline-flex items-center gap-1.5 text-primary text-xs font-bold hover:underline">
          <ArrowLeft className="h-4.5 w-4.5" /> Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] font-sans text-slate-800">
      
      {/* STEPS TIMELINE BAR */}
      {activeStep < 4 && !paymentFailed && (
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center z-10">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-xs transition duration-300 ${
                activeStep >= 1 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {activeStep > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-2">Delivery Address</span>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center z-10">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-xs transition duration-300 ${
                activeStep >= 2 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {activeStep > 2 ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-2">Delivery Slot</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center z-10">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-xs transition duration-300 ${
                activeStep >= 3 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                '3'
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-2">Payment</span>
            </div>

            {/* Dotted lines */}
            <div className="absolute top-5 left-[12%] right-[12%] h-0.5 bg-slate-100 z-0" />
            <div 
              className="absolute top-5 left-[12%] h-0.5 bg-primary z-0 transition-all duration-500" 
              style={{ width: `${(activeStep - 1) * 38}%` }}
            />
          </div>
        </div>
      )}

      {activeStep === 1 && !paymentFailed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* STEP 1 Content: Shipping Address */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <h2 className="font-display text-xl font-extrabold flex items-center gap-2">
                <MapPin className="h-5.5 w-5.5 text-primary" />
                Select Delivery Address
              </h2>

              {checkoutError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-xs font-bold flex items-start gap-2 shadow-sm">
                  <span>⚠️</span>
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Saved Addresses list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isHydrated && addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`relative p-4 rounded-2xl border transition flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                        : 'border-slate-200 hover:border-slate-350 bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId(addr.id)}
                      className="text-left w-full focus:outline-none flex-grow"
                    >
                      <div className="flex items-center gap-1.5 font-extrabold text-[10px] text-slate-800 uppercase">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {addr.title}
                        {addr.isDefault && (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded ml-2 normal-case">Default</span>
                        )}
                      </div>
                      <p className="font-bold text-xs mt-2 text-slate-700 truncate">{addr.name}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-semibold">
                        {addr.streetAddress}, {addr.city}, {addr.state} - {addr.zipCode}
                      </p>
                    </button>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-slate-200">
                      <div className="flex items-center gap-1 text-[10px] text-slate-450 font-bold">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{addr.phone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => setDefaultAddress(addr.id)}
                            className="text-[10px] text-primary hover:underline font-bold"
                          >
                            Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(addr)}
                          className="text-[10px] text-slate-500 hover:underline font-bold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAddress(addr.id)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          Delete
                        </button>
                        {selectedAddressId === addr.id && (
                          <span className="bg-primary text-white h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Address Form toggle */}
              {!isAddingNewAddress ? (
                <button
                  onClick={() => setIsAddingNewAddress(true)}
                  className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-primary text-slate-500 hover:text-primary rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <MapPin className="h-4.5 w-4.5" />
                  Add New Delivery Address
                </button>
              ) : (
                <form onSubmit={handleAddNewAddress} className="space-y-4 border border-dashed border-slate-200 p-5 rounded-2xl bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-sm">{editingAddressId ? 'Edit Delivery Address' : 'New Delivery Address'}</h3>
                  
                  {/* Map Picker trigger */}
                  <button
                    type="button"
                    onClick={triggerMapSelection}
                    className="w-full py-2.5 bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    🗺️ Locate Address on Google Maps (Simulated)
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Title (e.g. Home, Work)</label>
                      <input
                        type="text"
                        value={newAddrTitle}
                        onChange={(e) => setNewAddrTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Receiver Name</label>
                      <input
                        type="text"
                        placeholder="Nishitha Reddy"
                        value={newAddrName}
                        onChange={(e) => setNewAddrName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={newAddrPhone}
                        onChange={(e) => setNewAddrPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Zip Code</label>
                      <input
                        type="text"
                        placeholder="560035"
                        value={newAddrZip}
                        onChange={(e) => setNewAddrZip(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="Apartment name, building number, street name..."
                      value={newAddrStreet}
                      onChange={(e) => setNewAddrStreet(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white text-xs px-3 py-2 outline-none focus:border-primary text-slate-800 font-semibold"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="px-5 py-2 text-slate-500 hover:bg-slate-200 rounded-full text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition shadow"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Next Step trigger */}
              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  disabled={!selectedAddressId || checkoutLoading || !!checkoutError}
                  onClick={() => setActiveStep(2)}
                  className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold shadow-md hover:shadow-primary/20 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  Proceed to Slots
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>
          
          {/* Order Brief side widget */}
          <div className="lg:col-span-1">
            <CheckoutSummaryWidget subtotal={subtotal} discount={discount} tax={tax} deliveryFee={totalDeliveryFee} total={total} />
          </div>
        </div>
      )}

      {activeStep === 2 && !paymentFailed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* STEP 2 Content: Delivery Slots */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <h2 className="font-display text-xl font-extrabold flex items-center gap-2">
                <Clock className="h-5.5 w-5.5 text-primary" />
                Choose Delivery Slot
              </h2>

              {checkoutError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-xs font-bold flex items-start gap-2 shadow-sm">
                  <span>⚠️</span>
                  <span>{checkoutError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deliverySlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`text-left p-5 rounded-2xl border transition flex items-center justify-between ${
                      selectedSlotId === slot.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                        : 'border-slate-200 hover:border-slate-350 bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{slot.label}</span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">Delivery fee: {slot.fee}</p>
                    </div>
                    {selectedSlotId === slot.id && (
                      <span className="bg-primary text-white h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Navigation triggers */}
              <div className="pt-6 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-full text-xs font-bold hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  disabled={checkoutLoading || !!checkoutError}
                  onClick={() => setActiveStep(3)}
                  className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold shadow-md hover:shadow-primary/20 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  Proceed to Payment
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>

          <div className="lg:col-span-1">
            <CheckoutSummaryWidget subtotal={subtotal} discount={discount} tax={tax} deliveryFee={totalDeliveryFee} total={total} />
          </div>
        </div>
      )}

      {activeStep === 3 && !paymentFailed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* STEP 3 Content: Payment Option */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <h2 className="font-display text-xl font-extrabold flex items-center gap-2">
                <CreditCard className="h-5.5 w-5.5 text-primary" />
                Select Payment Method
              </h2>

              {checkoutError && (
                <div className="bg-rose-50 border border-rose-150 text-rose-700 p-4 rounded-2xl text-xs font-bold space-y-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <span>⚠️</span>
                    <span>{checkoutError}</span>
                  </div>
                  {activeOrderId && paymentMethod === 'RAZORPAY' && (
                    <button
                      onClick={handleRetryPayment}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] font-extrabold transition shadow"
                    >
                      Retry Payment
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-4">
                
                {/* Razorpay Option */}
                <button
                  onClick={() => { setPaymentMethod('RAZORPAY'); setCheckoutError(null); }}
                  className={`w-full text-left p-5 rounded-2xl border transition flex items-center justify-between ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                      : 'border-slate-200 hover:border-slate-350 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-800 text-white rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0">
                      💳
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">Secure Razorpay Checkout</span>
                      <p className="text-[10px] text-slate-450 font-semibold mt-1">Pay instantly via UPI, NetBanking, Credit/Debit cards.</p>
                    </div>
                  </div>
                  {paymentMethod === 'RAZORPAY' && (
                    <span className="bg-primary text-white h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>

                {/* Cash on Delivery Option */}
                <button
                  onClick={() => { setPaymentMethod('COD'); setCheckoutError(null); }}
                  className={`w-full text-left p-5 rounded-2xl border transition flex items-center justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                      : 'border-slate-200 hover:border-slate-350 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0">
                      💵
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">Cash on Delivery (COD)</span>
                      <p className="text-[10px] text-slate-450 font-semibold mt-1">Pay with cash or scan QR code during delivery partner arrival.</p>
                    </div>
                  </div>
                  {paymentMethod === 'COD' && (
                    <span className="bg-primary text-white h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>

              </div>

              {/* Navigation triggers */}
              <div className="pt-6 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-full text-xs font-bold hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  disabled={checkoutLoading || !!checkoutError}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3 bg-[#FF6B00] hover:bg-accent text-white rounded-full text-xs font-bold shadow-lg hover:shadow-orange-500/20 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {paymentMethod === 'RAZORPAY' ? 'Pay & Place Order' : 'Place Order (COD)'}
                </button>
              </div>

            </div>
          </div>

          <div className="lg:col-span-1">
            <CheckoutSummaryWidget subtotal={subtotal} discount={discount} tax={tax} deliveryFee={totalDeliveryFee} total={total} />
          </div>
        </div>
      )}

      {/* PAYMENT FAILED PAGE */}
      {paymentFailed && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-xl text-center space-y-6 animate-fade-in font-sans">
          <div className="h-16 w-16 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center mx-auto text-2xl shadow">
            ⚠️
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800">Payment Failed</h1>
            <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wide">
              Order ID: <span className="text-primary">{activeOrderId}</span>
            </p>
            <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto mt-2">
              We couldn't verify your payment. Please retry below to secure your organic food delivery order.
            </p>
            {checkoutError && (
              <p className="text-[10px] text-rose-600 font-bold mt-1">
                Reason: {checkoutError}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => {
                setPaymentFailed(false);
                handleRetryPayment();
              }}
              className="py-3 px-6 bg-[#FF6B00] hover:bg-accent text-white rounded-full text-xs font-bold shadow-md transition"
            >
              Retry Payment
            </button>
            <button
              onClick={() => {
                setPaymentFailed(false);
                setActiveStep(3);
                setCheckoutError(null);
              }}
              className="py-3 px-6 border border-slate-250 text-slate-700 hover:bg-slate-50 rounded-full text-xs font-bold transition"
            >
              Choose Other Method
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ORDER PLACED SUCCESSFULLY */}
      {activeStep === 4 && placedOrderDetails && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-xl text-center space-y-6 animate-fade-in font-sans">
          
          <div className="h-16 w-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl shadow">
            🎉
          </div>
          
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800">Freshness is on its Way!</h1>
            <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wide">
              Order Number: <span className="text-primary">{placedOrderDetails.orderNumber || placedOrderDetails.id}</span>
            </p>
            <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto mt-2">
              Your order has been registered successfully. A confirmation message was sent to {placedOrderDetails.address.phone}.
            </p>
          </div>

          {/* Receipt detail box */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 text-left border border-slate-200/80 divide-y divide-slate-200/60 text-xs font-semibold text-slate-650">
            <div className="pb-3 flex justify-between text-slate-800">
              <span className="font-extrabold">Delivery Location</span>
              <span className="text-right font-bold text-slate-600 truncate max-w-[200px]">
                {placedOrderDetails.address.streetAddress}
              </span>
            </div>
            <div className="py-3 flex justify-between text-slate-800">
              <span className="font-extrabold">Delivery Slot</span>
              <span className="font-bold text-slate-600">{placedOrderDetails.deliverySlot}</span>
            </div>
            <div className="py-3 flex justify-between text-slate-800">
              <span className="font-extrabold">Payment Method</span>
              <span className="font-bold text-slate-600">{placedOrderDetails.paymentMethod}</span>
            </div>
            <div className="pt-3 flex justify-between items-center text-sm font-bold text-slate-800">
              <span>Paid Total</span>
              <span className="text-primary text-base font-extrabold">₹{Math.round(placedOrderDetails.total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/profile?tab=orders"
              className="py-3 px-6 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold shadow-md transition"
            >
              Track Order Status
            </Link>
            <Link
              href="/products"
              className="py-3 px-6 border border-slate-250 text-slate-700 hover:bg-slate-50 rounded-full text-xs font-bold transition"
            >
              Continue Shopping
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Guaranteed organic food delivery. Freshness served.</span>
          </div>

        </div>
      )}

      {/* SIMULATED GOOGLE MAPS POPUP */}
      {mapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMapOpen(false)} />
          
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full z-10 border border-slate-100 text-slate-800">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
              <h4 className="font-bold text-xs">Simulated Google Maps API</h4>
              <button onClick={() => setMapOpen(false)} className="text-xs text-slate-400 font-extrabold hover:text-slate-600">Close</button>
            </div>
            
            {/* Map Canvas Illustration */}
            <div className="h-64 bg-emerald-50 relative flex items-center justify-center overflow-hidden">
              {/* Fake grid map */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="absolute h-36 w-36 rounded-full border-4 border-dashed border-primary/20 animate-pulse-slow" />
              
              {/* Fake roads */}
              <div className="absolute h-2 w-full bg-slate-200/60 top-1/2 transform -translate-y-1/2" />
              <div className="absolute w-2 h-full bg-slate-200/60 left-1/3" />
              
              {/* Map pin */}
              <div className="relative z-10 flex flex-col items-center">
                <MapPin className="h-10 w-10 text-rose-500 fill-current animate-bounce" />
                <span className="bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-md mt-1">
                  Delivery Point
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Reverse Geocoded Address</p>
                <p className="font-bold text-xs text-slate-700 leading-tight mt-1">{mapAddressResult}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setMapOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMapSelection}
                  className="flex-grow py-2 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold transition shadow"
                >
                  Confirm Address Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED RAZORPAY PAYMENT GATEWAY GATE */}
      {razorpayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
          
          <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full z-10 border border-slate-800 font-sans text-xs">
            {/* Header */}
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="h-5 w-5 bg-blue-600 rounded-md flex items-center justify-center font-black text-[9px] text-white">R</span>
                <span className="font-extrabold tracking-tight">Razorpay Checkout</span>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-extrabold">SECURE MODE</span>
            </div>

            {razorpayStep === 'LOADING' && (
              <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-slate-400 text-[10px] font-bold">Initializing gateway tunnel...</p>
              </div>
            )}

            {razorpayStep === 'INPUT' && (
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center bg-slate-850 p-3 rounded-xl">
                  <div>
                    <p className="text-slate-455 text-[9px] font-bold uppercase">Transaction Amount</p>
                    <p className="text-sm font-extrabold text-blue-400 mt-0.5">₹{Math.round(total).toLocaleString('en-IN')}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Pure O Fresh</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-450 text-[9px] font-bold block mb-1 uppercase">Payment Phone</label>
                    <input
                      type="text"
                      value={razorpayPhone}
                      onChange={(e) => setRazorpayPhone(e.target.value)}
                      className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-white font-bold outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-slate-500 text-[9px] leading-relaxed">
                    By proceeding, you agree to pay ${total.toFixed(2)} using your Razorpay-linked profiles. An OTP verification card will follow.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setRazorpayOpen(false);
                      setCheckoutError('Payment cancelled by user.');
                      setPaymentFailed(true);
                    }}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl text-slate-300 font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRazorpayPaymentSubmit}
                    className="flex-grow py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg shadow-blue-550/20"
                  >
                    Send OTP Verification
                  </button>
                </div>
              </div>
            )}

            {razorpayStep === 'OTP' && (
              <div className="p-5 space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-slate-450 text-[9px] font-bold uppercase">Enter OTP Code</p>
                  <p className="text-[10px] text-slate-500 font-semibold">We sent a 4-digit code to {razorpayPhone}</p>
                </div>

                <div className="flex justify-center pt-2">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="XXXX"
                    value={razorpayOTP}
                    onChange={(e) => setRazorpayOTP(e.target.value)}
                    className="w-28 text-center text-base font-extrabold tracking-widest bg-slate-800 border border-slate-700 rounded-xl py-2 outline-none focus:border-blue-500"
                  />
                </div>

                <p className="text-slate-500 text-[8px] text-center font-bold">Hint: Type any 4 numbers and click verify!</p>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setRazorpayStep('INPUT')}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl text-slate-350 font-bold transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleRazorpayOTPSubmit}
                    className="flex-grow py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-lg"
                  >
                    Verify & Pay Now
                  </button>
                </div>
              </div>
            )}

            {razorpayStep === 'PROCESSING' && (
              <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-slate-400 text-[10px] font-bold">Authorizing bank funds transfer...</p>
              </div>
            )}

            {razorpayStep === 'SUCCESS' && (
              <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
                <div className="h-10 w-10 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-lg font-bold">
                  ✓
                </div>
                <p className="text-white font-bold">Payment Verified</p>
                <p className="text-slate-400 text-[9px] font-medium leading-none">Redirecting order confirmation...</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

// Subcomponent: Order brief side widget
interface SummaryProps {
  subtotal: number;
  discount: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

const CheckoutSummaryWidget: React.FC<SummaryProps> = ({ subtotal, discount, tax, deliveryFee, total }) => {
  const isHydrated = useHydrated();
  const cart = useStore((state) => state.cart);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-6">
      <h3 className="font-bold text-slate-800 text-sm pb-2.5 border-b border-slate-150 flex items-center justify-between">
        <span>Order Summary</span>
        <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
          {isHydrated ? cart.reduce((s, i) => s + i.quantity, 0) : 0} items
        </span>
      </h3>

      {/* Mini items list */}
      <div className="max-h-40 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
        {isHydrated && cart.map((item) => {
          const discPrice = item.product.price * (1 - item.product.discount / 100);
          return (
            <div key={item.product.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs font-semibold text-slate-600">
              <span className="truncate max-w-[130px]">{item.product.name}</span>
              <div className="flex gap-2 items-center text-[10px] text-slate-400 font-bold shrink-0">
                <span>x{item.quantity}</span>
                <span className="text-slate-700 font-extrabold">₹{Math.round(discPrice * item.quantity)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing breakdown */}
      <div className="space-y-2 text-xs text-slate-500 font-semibold border-t border-slate-150 pt-4">
        <div className="flex justify-between">
          <span>Bag Subtotal</span>
          <span className="text-slate-700">₹{Math.round(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Savings</span>
            <span>-₹{Math.round(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Estimated Tax</span>
          <span className="text-slate-700">₹{Math.round(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span className="text-slate-750">
            {deliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${Math.round(deliveryFee)}`}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm font-bold border-t border-slate-150 pt-4">
        <span>Grand Total</span>
        <span className="text-base font-extrabold text-primary">₹{Math.round(total)}</span>
      </div>

      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-medium leading-relaxed flex items-start gap-1.5">
        <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <span>Secure checkout protected by Razorpay. Zero risk organic food guarantee.</span>
      </div>
    </div>
  );
};

export default CheckoutPage;
