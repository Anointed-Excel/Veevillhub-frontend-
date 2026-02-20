export const initializeMockData = () => {
  // FORCE UPDATE: Always ensure admin credentials are correct
  const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Define default users with CORRECT admin email
  const defaultUsers = [
    {
      id: '1',
      email: 'admin@veevillhub.com', // CORRECT EMAIL
      password: 'admin123',
      name: 'VeeVill Admin',
      role: 'brand',
      verificationStatus: 'approved',
      avatar: 'https://ui-avatars.com/api/?name=VeeVill+Admin&background=BE220E&color=fff',
    },
    {
      id: '2',
      email: 'manufacturer@test.com',
      password: 'test123',
      name: 'Test Manufacturer',
      role: 'manufacturer',
      verificationStatus: 'approved',
      avatar: 'https://ui-avatars.com/api/?name=Test+Manufacturer&background=BE220E&color=fff',
    },
    {
      id: '3',
      email: 'retailer@test.com',
      password: 'test123',
      name: 'Test Retailer',
      role: 'retailer',
      verificationStatus: 'approved',
      avatar: 'https://ui-avatars.com/api/?name=Test+Retailer&background=BE220E&color=fff',
    },
    {
      id: '4',
      email: 'buyer@test.com',
      password: 'test123',
      name: 'Test Buyer',
      role: 'buyer',
      verificationStatus: 'approved',
      avatar: 'https://ui-avatars.com/api/?name=Test+Buyer&background=BE220E&color=fff',
    },
  ];

  // FORCE UPDATE: Remove any old admin with wrong email
  const filteredUsers = existingUsers.filter((u: any) => 
    u.id !== '1' && u.email !== 'admin@veevill.com' // Remove old admin
  );

  // Add all default users (admin will always be fresh)
  const updatedUsers = [...filteredUsers];
  
  defaultUsers.forEach(defaultUser => {
    const existingIndex = updatedUsers.findIndex((u: any) => u.id === defaultUser.id);
    if (existingIndex >= 0) {
      // Force update existing default user
      updatedUsers[existingIndex] = defaultUser;
    } else {
      // Add new default user
      updatedUsers.push(defaultUser);
    }
  });
  
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  
  // Console log for debugging
  console.log('✅ Mock data initialized');
  console.log('📧 Admin email:', defaultUsers[0].email);
  console.log('🔑 Admin password:', defaultUsers[0].password);

  // Initialize products
  if (!localStorage.getItem('products')) {
    const products = [
      {
        id: '1',
        name: 'Premium African Print Fabric',
        description: 'High-quality African print fabric, perfect for clothing and accessories',
        price: 25.99,
        moq: 100,
        stock: 5000,
        images: ['https://images.unsplash.com/photo-1558769132-cb1aea9c5b0d?w=500'],
        category: 'Textiles',
        manufacturerId: '2',
        manufacturerName: 'Test Manufacturer',
      },
      {
        id: '2',
        name: 'Handcrafted Leather Bag',
        description: 'Authentic handcrafted leather bag, made with premium materials',
        price: 89.99,
        moq: 50,
        stock: 1000,
        images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500'],
        category: 'Accessories',
        manufacturerId: '2',
        manufacturerName: 'Test Manufacturer',
      },
      {
        id: '3',
        name: 'Artisan Coffee Beans',
        description: 'Premium Ethiopian coffee beans, freshly roasted',
        price: 15.99,
        moq: 200,
        stock: 10000,
        images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500'],
        category: 'Food & Beverage',
        manufacturerId: '1',
        manufacturerName: 'VeeVill Admin',
      },
    ];
    localStorage.setItem('products', JSON.stringify(products));
  }

  // Initialize orders
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([]));
  }

  // Initialize cart
  if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
  }

  // Initialize wishlist
  if (!localStorage.getItem('wishlist')) {
    localStorage.setItem('wishlist', JSON.stringify([]));
  }

  // Initialize addresses
  if (!localStorage.getItem('addresses')) {
    localStorage.setItem('addresses', JSON.stringify([]));
  }

  // Initialize payment methods
  if (!localStorage.getItem('paymentMethods')) {
    localStorage.setItem('paymentMethods', JSON.stringify([]));
  }

  // Initialize messages
  if (!localStorage.getItem('messages')) {
    localStorage.setItem('messages', JSON.stringify([]));
  }

  // Initialize wallet transactions
  if (!localStorage.getItem('walletTransactions')) {
    localStorage.setItem('walletTransactions', JSON.stringify([]));
  }
};