import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class ChatService {
  constructor() {
    this.listeners = new Set();
  }

  sendMessage(budgetId, { userId, userName, text }) {
    const messagesRef = collection(db, "budgets", budgetId, "chat");
    return addDoc(messagesRef, {
      userId,
      userName,
      text,
      createdAt: serverTimestamp(),
    });
  }

  subscribe(budgetId, callback) {
    const messagesRef = collection(db, "budgets", budgetId, "chat");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(messages);
    });
    this.listeners.add(unsub);
    return () => {
      unsub();
      this.listeners.delete(unsub);
    };
  }
}

export const chatService = new ChatService();
