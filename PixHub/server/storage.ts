// server/storage.ts

import { db } from './firebaseAdmin'; // Firebase Admin SDK ইনিশিয়ালাইজেশন থেকে db ইম্পোর্ট করা হচ্ছে
import { 
  type User, type InsertUser, 
  type Category, type InsertCategory, 
  type Image, type InsertImage, 
  type Payment, type InsertPayment 
} from "@shared/schema";

// IStorage ইন্টারফেসটি আগের মতোই থাকবে, কারণ এটি আমাদের কন্ট্রাক্ট।
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Categories
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined>;
  
  // Images
  getAllImages(limit?: number, offset?: number): Promise<Image[]>;
  getImagesByCategory(categoryId: string): Promise<Image[]>;
  getFeaturedImages(): Promise<Image[]>;
  searchImages(query: string): Promise<Image[]>;
  getImageById(id: string): Promise<Image | undefined>;
  createImage(image: InsertImage): Promise<Image>;
  updateImage(id: string, updates: Partial<Image>): Promise<Image | undefined>;
  
  // Payments
  getAllPayments(): Promise<Payment[]>;
  getPendingPayments(): Promise<Payment[]>;
  getPaymentById(id: string): Promise<Payment | undefined>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
}

// MemStorage এর পরিবর্তে FirestoreStorage ক্লাস
export class FirestoreStorage implements IStorage {
  
  // --- Users ---
  async getUser(id: string): Promise<User | undefined> {
    const doc = await db.collection('users').doc(id).get();
    return doc.exists ? (doc.data() as User) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) return undefined;
    return snapshot.docs[0].data() as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('username', '==', username).limit(1).get();
    if (snapshot.empty) return undefined;
    return snapshot.docs[0].data() as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const docRef = db.collection('users').doc(); // Firestore ID তৈরি করবে
    const user: User = {
      ...insertUser,
      id: docRef.id,
      isPremium: false,
      plan: null,
      premiumExpiryDate: null,
      createdAt: new Date(),
    };
    await docRef.set(user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const docRef = db.collection('users').doc(id);
    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return updatedDoc.exists ? (updatedDoc.data() as User) : undefined;
  }

  // --- Categories ---
  async getAllCategories(): Promise<Category[]> {
    const snapshot = await db.collection('categories').orderBy('name', 'asc').get();
    return snapshot.docs.map(doc => doc.data() as Category);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const doc = await db.collection('categories').doc(id).get();
    return doc.exists ? (doc.data() as Category) : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const snapshot = await db.collection('categories').where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) return undefined;
    return snapshot.docs[0].data() as Category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const docRef = db.collection('categories').doc();
    const category: Category = {
      ...insertCategory,
      id: docRef.id,
      imageCount: 0,
      createdAt: new Date(),
    };
    await docRef.set(category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined> {
    const docRef = db.collection('categories').doc(id);
    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return updatedDoc.exists ? (updatedDoc.data() as Category) : undefined;
  }

  // --- Images ---
  async getAllImages(limit = 20, offset = 0): Promise<Image[]> {
    const snapshot = await db.collection('images').orderBy('createdAt', 'desc').limit(limit).offset(offset).get();
    return snapshot.docs.map(doc => doc.data() as Image);
  }

  async getImagesByCategory(categoryId: string): Promise<Image[]> {
    const snapshot = await db.collection('images').where('categoryId', '==', categoryId).get();
    return snapshot.docs.map(doc => doc.data() as Image);
  }

  async getFeaturedImages(): Promise<Image[]> {
    const snapshot = await db.collection('images').orderBy('downloadCount', 'desc').limit(6).get();
    return snapshot.docs.map(doc => doc.data() as Image);
  }

  async searchImages(query: string): Promise<Image[]> {
    // দ্রষ্টব্য: Firestore সরাসরি টেক্সট সার্চ সমর্থন করে না। এটি ট্যাগের উপর ভিত্তি করে একটি সরল সার্চ।
    // প্রোডাকশনের জন্য Algolia বা Typesense এর মতো সার্ভিস ব্যবহার করা ভালো।
    const searchTerm = query.toLowerCase();
    const snapshot = await db.collection('images').where('tags', 'array-contains', searchTerm).get();
    return snapshot.docs.map(doc => doc.data() as Image);
  }

  async getImageById(id: string): Promise<Image | undefined> {
    const doc = await db.collection('images').doc(id).get();
    return doc.exists ? (doc.data() as Image) : undefined;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const docRef = db.collection('images').doc();
    const image: Image = {
      ...insertImage,
      id: docRef.id,
      downloadCount: 0,
      createdAt: new Date(),
    };
    await docRef.set(image);
    return image;
  }

  async updateImage(id: string, updates: Partial<Image>): Promise<Image | undefined> {
    const docRef = db.collection('images').doc(id);
    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return updatedDoc.exists ? (updatedDoc.data() as Image) : undefined;
  }

  // --- Payments ---
  async getAllPayments(): Promise<Payment[]> {
    const snapshot = await db.collection('payments').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => doc.data() as Payment);
  }

  async getPendingPayments(): Promise<Payment[]> {
    const snapshot = await db.collection('payments').where('status', '==', 'pending').get();
    return snapshot.docs.map(doc => doc.data() as Payment);
  }

  async getPaymentById(id: string): Promise<Payment | undefined> {
    const doc = await db.collection('payments').doc(id).get();
    return doc.exists ? (doc.data() as Payment) : undefined;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    const snapshot = await db.collection('payments').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => doc.data() as Payment);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const docRef = db.collection('payments').doc();
    const payment: Payment = {
      ...insertPayment,
      id: docRef.id,
      status: "pending",
      createdAt: new Date(),
      verifiedAt: null,
    };
    await docRef.set(payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const docRef = db.collection('payments').doc(id);
    const updateData: Partial<Payment> = { ...updates };
    if (updates.status === "completed") {
        updateData.verifiedAt = new Date();
    }
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    return updatedDoc.exists ? (updatedDoc.data() as Payment) : undefined;
  }
}

// এখন থেকে MemStorage এর পরিবর্তে FirestoreStorage ব্যবহার করা হবে।
export const storage = new FirestoreStorage();