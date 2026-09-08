export type ProductBadge = "topSale" | "newArrival" | "comingSoon" | null;
export type Product = {
  id: string;
  name: string;
  blurb: string;
  priceCentavos: number;
  pointsMin: number;
  pointsMax: number;
  imageUrl: string;
  badge: ProductBadge;
  isActive: boolean;
  position: number;
  storeLinks: Partial<Record<"tiktok" | "shopee" | "lazada", string>>;
};

export const products: Product[] = [
  { id: "p001", name: "Sakura Glow Soap", blurb: "Gentle wellness soap with sunscreen benefits", priceCentavos: 15000, pointsMin: 7, pointsMax: 11, imageUrl: "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=200&q=80", badge: "topSale", isActive: true, position: 1, storeLinks: { shopee: "https://shopee.ph/", tiktok: "https://www.tiktok.com/" } },
  { id: "p002", name: "Sunscreen SPF50", blurb: "Daily protection made for everyday glow", priceCentavos: 38000, pointsMin: 19, pointsMax: 27, imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=200&q=80", badge: "newArrival", isActive: true, position: 2, storeLinks: { shopee: "https://shopee.ph/", lazada: "https://www.lazada.com.ph/" } },
  { id: "p003", name: "Falcon Coffee", blurb: "Wellness blend with real benefits", priceCentavos: 52000, pointsMin: 26, pointsMax: 36, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80", badge: "comingSoon", isActive: false, position: 3, storeLinks: {} },
  { id: "p004", name: "Herbal Tea", blurb: "Tea with benefits for everyday balance", priceCentavos: 45000, pointsMin: 23, pointsMax: 32, imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&q=80", badge: "comingSoon", isActive: false, position: 4, storeLinks: {} },
  { id: "p005", name: "Body Lotion", blurb: "Light, fast-absorbing daily lotion", priceCentavos: 29000, pointsMin: 14, pointsMax: 20, imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80", badge: null, isActive: true, position: 5, storeLinks: { shopee: "https://shopee.ph/" } },
];

export type Post = { id: string; body: string; media: "none" | "image" | "video"; likes: number; comments: number; publishedAt: string; status: "published" | "draft" };

export const posts: Post[] = [
  { id: "f001", body: "New batch of Sakura Glow Soap is in. Share your code this week — every order counts double toward your streak.", media: "video", likes: 128, comments: 14, publishedAt: "2026-09-08T02:00:00Z", status: "published" },
  { id: "f002", body: "Sunscreen SPF50 restocked. It is the easiest first product to recommend to a friend who is new to the routine.", media: "image", likes: 86, comments: 9, publishedAt: "2026-09-07T09:30:00Z", status: "published" },
  { id: "f003", body: "Payouts now land within 24 hours for GCash and Maya. Nothing to do on your side — it is already live.", media: "none", likes: 204, comments: 31, publishedAt: "2026-09-06T05:15:00Z", status: "published" },
  { id: "f004", body: "Falcon Coffee lands next month. Members who refer three buyers in September get the first bags.", media: "image", likes: 0, comments: 0, publishedAt: "2026-09-12T01:00:00Z", status: "draft" },
];

export type Faq = { id: string; question: string; answer: string; position: number; isActive: boolean };

export const faqs: Faq[] = [
  { id: "q001", question: "How much is a point worth?", answer: "One point is one peso. Cash out from 1,000 points to GCash or Maya.", position: 1, isActive: true },
  { id: "q002", question: "When do I earn points?", answer: "When someone who joined with your code completes a purchase.", position: 2, isActive: true },
  { id: "q003", question: "How long does a cash-out take?", answer: "Requests are reviewed and sent within three business days.", position: 3, isActive: true },
];
