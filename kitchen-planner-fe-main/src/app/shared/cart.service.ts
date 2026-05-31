import { Injectable } from '@angular/core';
import { BillingInfo, DeliveryAddress } from '../api/api-kms-planner-masterdata';

interface CartItem {
  _id: string;
  qty: number;
  name: string;
  price: number;
  image?: string;
  maxQty?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _cartItems: CartItem[] = [];
  private _customerBillingInfo: any = null;
  private _customerDeliveryInfo: any = null;
  private _specialInstructions: string = '';
  private totalOrderCost: number = 0;
  private totalTaxCost: number = 0;
  private deliveryFee: number = 0;
  private discount: number = 0;
  private subtotal: number = 0;
  private orderId: string = '';
  constructor() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this._cartItems = JSON.parse(storedCart);
    }
   }

  get cartItems(): CartItem[] {
    return this._cartItems;
  }

  set cartItems(items: [{ _id: string, qty: number, name: string, price: number }]) {
    this._cartItems = items;
  }

  clearCart() {
    this._cartItems = [];
  }

  setCart(items: CartItem[]) {
    this._cartItems = items;
    localStorage.setItem('cart', JSON.stringify(this._cartItems));
  }

  addToCart(itemId: string, name: string, price: number, image:string, maxQty: string, quantity: number = 1) {
    const itemIndex = this._cartItems.findIndex(item => item._id === itemId);
    if (itemIndex > -1) {
      this._cartItems[itemIndex].qty += quantity;
    } else {
      this._cartItems.push({ _id: itemId, qty: quantity, name: name, price: price, image: image, maxQty: maxQty });
    }
    localStorage.setItem('cart', JSON.stringify(this._cartItems));
  }

  removeFromCart(itemId: string) {
    const itemIndex = this._cartItems.findIndex(item => item._id === itemId);
    if (itemIndex > -1) {
      if (this._cartItems[itemIndex].qty > 1) {
        this._cartItems[itemIndex].qty -= 1;
      } else {
        this._cartItems.splice(itemIndex, 1);
      }
    }
    localStorage.setItem('cart', JSON.stringify(this._cartItems));
  }

 getTotalItems() {
  return Array.isArray(this._cartItems) 
    ? this._cartItems.reduce((total, item) => total + (item.qty || 0), 0) 
    : 0;
}

  getCart(){
    return this._cartItems;
  }

  setCustomerBillingInfo(info: BillingInfo) {
    this._customerBillingInfo = info;
  }

  getCustomerBillingInfo(): BillingInfo | null {
    return this._customerBillingInfo;
  }

  setCustomerDeliveryInfo(info: DeliveryAddress) {
    this._customerDeliveryInfo = info;
  }

  getCustomerDeliveryInfo(): any {
    return this._customerDeliveryInfo;
  }

  setSpecialInstructions(instructions: string) {
    this._specialInstructions = instructions;
  }
  getSpecialInstructions(): string {
    return this._specialInstructions;
  }

  setTotalOrderCost(cost: number) {
    this.totalOrderCost = cost;
  }

  getTotalOrderCost(): number {
    return this.totalOrderCost;
  }

  setTotalTaxCost(tax: number) {
    this.totalTaxCost = tax;
  }

  getTotalTaxCost(): number {
    return this.totalTaxCost;
  }

  setDeliveryFee(fee: number) {
    this.deliveryFee = fee;
  }

  getDeliveryFee(): number {
    return this.deliveryFee;
  }

  setDiscount(discount: number) {
    this.discount = discount;
  }

  getDiscount(): number {
    return this.discount;
  }

  setSubtotal(subtotal: number) {
    this.subtotal = subtotal;
  }

  getSubtotal(): number {
    return this.subtotal;
  }

  resetCartData(){
    this.totalOrderCost = 0;
    this.totalTaxCost = 0;
    this.deliveryFee = 0;
    this.discount = 0;
    this.subtotal = 0;
    this._specialInstructions = '';
    this._customerBillingInfo = null;
    this._customerDeliveryInfo = null;
    this._cartItems = [];
    localStorage.removeItem('cart');
  }

  setOrderId(id: string) {
    this.orderId = id;
  }

  getOrderId(): string {
    return this.orderId;
  }

}
