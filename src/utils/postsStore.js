// postsStore.js — shared post state using localStorage
// When backend is ready, replace these functions with API calls

const STORAGE_KEY = "pw-posts";

const defaultPosts = [
  {
    id: 1,
    product: "Garri (1kg)",
    price: 800,
    location: "Mile 12 Market",
    state: "Lagos",
    category: "Food & Groceries",
    image:
      "https://images.unsplash.com/photo-1621956838481-5b13ab190fc1?w=600&q=80",
    date: "March 8, 2026",
    user: "User",
    likes: 24,
    confirms: 18,
    denies: 2,
    comments: ["Great find!", "Cheaper than my area"],
  },
  {
    id: 2,
    product: "Tomatoes (basket)",
    price: 3500,
    location: "Bodija Market",
    state: "Oyo",
    category: "Vegetables",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80",
    date: "March 7, 2026",
    user: "User",
    likes: 18,
    confirms: 5,
    denies: 8,
    comments: ["Wow so expensive!"],
  },
  {
    id: 3,
    product: "Chicken (1kg)",
    price: 2800,
    location: "Wuse Market",
    state: "Abuja",
    category: "Meat & Poultry",
    image:
      "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80",
    date: "March 6, 2026",
    user: "User",
    likes: 31,
    confirms: 22,
    denies: 1,
    comments: [],
  },
  {
    id: 4,
    product: "Rice (50kg bag)",
    price: 45000,
    location: "Kano Central Market",
    state: "Kano",
    category: "Food & Groceries",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
    date: "March 5, 2026",
    user: "User",
    likes: 45,
    confirms: 10,
    denies: 31,
    comments: ["Report this seller!"],
  },
  {
    id: 5,
    product: "Petrol (litre)",
    price: 950,
    location: "NNPC Station",
    state: "Lagos",
    category: "Fuel",
    image:
      "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=80",
    date: "March 4, 2026",
    user: "User",
    likes: 12,
    confirms: 9,
    denies: 0,
    comments: [],
  },
  {
    id: 6,
    product: "Paracetamol (pack)",
    price: 350,
    location: "Idumota Market",
    state: "Lagos",
    category: "Healthcare",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
    date: "March 3, 2026",
    user: "User",
    likes: 9,
    confirms: 6,
    denies: 3,
    comments: ["Cheaper at my chemist"],
  },
];

export function getPosts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPosts;
  } catch {
    return defaultPosts;
  }
}

export function savePosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    console.error("Could not save posts");
  }
}

export function addPost(post) {
  const posts = getPosts();
  const newPost = {
    ...post,
    id: Date.now(),
    date: new Date().toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    user: "User",
    likes: 0,
    confirms: 0,
    denies: 0,
    comments: [],
  };
  const updated = [newPost, ...posts];
  savePosts(updated);
  return updated;
}

export function deletePost(id) {
  const updated = getPosts().filter((p) => p.id !== id);
  savePosts(updated);
  return updated;
}
