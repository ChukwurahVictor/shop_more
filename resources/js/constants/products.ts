export interface Product {
    id:       number;
    name:     string;
    category: string;
    price:    number;
    emoji:    string;
    gradient: string;
}

export const PRODUCTS: Product[] = [
    {
        id:       1,
        name:     'Wireless Pro Headphones',
        category: 'Electronics',
        price:    100,
        emoji:    '🎧',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
        id:       2,
        name:     'Luxury Skincare Set',
        category: 'Beauty',
        price:    100,
        emoji:    '✨',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
        id:       3,
        name:     'Designer Tote Bag',
        category: 'Fashion',
        price:    100,
        emoji:    '👜',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
        id:       4,
        name:     'Artisan Coffee Bundle',
        category: 'Food & Drink',
        price:    100,
        emoji:    '☕',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
        id:       5,
        name:     'Smart Fitness Watch',
        category: 'Sports',
        price:    100,
        emoji:    '⌚',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
        id:       6,
        name:     'Scented Candle Set',
        category: 'Home & Living',
        price:    100,
        emoji:    '🕯️',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    },
];
