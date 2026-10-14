export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  options?: {
    name: string;
    choices: string[];
  }[];
}

export interface DemoWebsiteConfig {
  slug: string;
  categoryTitle: string;
  businessName: string;
  tagline: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroImage: string;
  accentColor: string;
  themeBadge: string;
  ctaActionLabel: string;
  actionType: 'checkout' | 'order' | 'booking' | 'survey';
  items: DemoProduct[];
  stats: { label: string; value: string }[];
}

export const DEMO_WEBSITES: Record<string, DemoWebsiteConfig> = {
  'toko-baju': {
    slug: 'toko-baju',
    categoryTitle: 'Toko Baju & Fashion',
    businessName: 'AURA Atelier',
    tagline: 'Contemporary Minimalist Fashion & Daily Wear',
    heroHeadline: 'Koleksi Busana Minimalis untuk Gaya Hidup Modern',
    heroSubtitle: 'Bahan serat alami premium, potongan siluet elegan, dan kenyamanan maksimal sepanjang hari.',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#172554',
    themeBadge: 'Fashion & Apparel',
    ctaActionLabel: 'Lanjut ke Checkout Pesanan',
    actionType: 'checkout',
    stats: [
      { label: 'Bahan', value: '100% Linen & Katun' },
      { label: 'Rating Pembeli', value: '4.9 / 5.0' },
      { label: 'Garansi Ukuran', value: 'Tukar 7 Hari' }
    ],
    items: [
      {
        id: 'BAJU-01',
        name: 'Oversized Linen Resort Shirt',
        category: 'Atasan Pria & Wanita',
        price: 349000,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
        description: 'Kemeja potongan oversized dari 100% French linen yang adem dan bernapas untuk iklim tropis.',
        options: [
          { name: 'Ukuran', choices: ['S', 'M', 'L', 'XL'] },
          { name: 'Warna', choices: ['Oatmeal', 'Olive Sage', 'Pure White'] }
        ]
      },
      {
        id: 'BAJU-02',
        name: 'Tailored Structured Blazer',
        category: 'Outerwear Formal',
        price: 699000,
        image: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=600&q=80',
        description: 'Blazer formal berstruktur rapi dengan jahitan ganda dan furing sutra lembut.',
        options: [
          { name: 'Ukuran', choices: ['S', 'M', 'L'] },
          { name: 'Warna', choices: ['Midnight Charcoal', 'Sand Taupe'] }
        ]
      },
      {
        id: 'BAJU-03',
        name: 'Pleated Wide-Leg Trousers',
        category: 'Bawahan',
        price: 429000,
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
        description: 'Celana kulot lipit dengan pinggang elastis tersembunyi untuk mobilitas tinggi.',
        options: [
          { name: 'Ukuran', choices: ['M', 'L', 'XL'] },
          { name: 'Warna', choices: ['Classic Black', 'Mocca'] }
        ]
      },
      {
        id: 'BAJU-04',
        name: 'Silk Slip Midi Dress',
        category: 'Dress Wanita',
        price: 549000,
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
        description: 'Gaun midi sutra satin berkilau halus cocok untuk acara malam maupun kasual elegan.',
        options: [
          { name: 'Ukuran', choices: ['S', 'M', 'L'] },
          { name: 'Warna', choices: ['Emerald Green', 'Champagne'] }
        ]
      }
    ]
  },

  'toko-sepatu': {
    slug: 'toko-sepatu',
    categoryTitle: 'Toko Sepatu & Footwear',
    businessName: 'STRIDE Lab',
    tagline: 'High-Performance Urban & Athletic Footwear',
    heroHeadline: 'Langkah Lebih Jauh dengan Desain Ergonomis',
    heroSubtitle: 'Bantalan responsif nitrogen-infused dan material knit elastis untuk aktivitas tanpa batas.',
    heroImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#0284C7',
    themeBadge: 'Footwear & Sportswear',
    ctaActionLabel: 'Lanjut ke Checkout Pesanan',
    actionType: 'checkout',
    stats: [
      { label: 'Teknologi Sole', value: 'HyperCushion™' },
      { label: 'Bobot Rata-rata', value: '230 gram' },
      { label: 'Uji Durabilitas', value: '800 KM Teruji' }
    ],
    items: [
      {
        id: 'SPT-01',
        name: 'AeroGlide Carbon Runner Pro',
        category: 'Running Shoes',
        price: 1299000,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
        description: 'Sepatu lari pelat karbon dengan energi pantul tinggi untuk maraton dan lari harian.',
        options: [
          { name: 'Ukuran (EU)', choices: ['40', '41', '42', '43', '44'] },
          { name: 'Colorway', choices: ['Neon Crimson', 'Volt Black'] }
        ]
      },
      {
        id: 'SPT-02',
        name: 'Monochrome Urban Court Sneaker',
        category: 'Casual Lifestyle',
        price: 899000,
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80',
        description: 'Sneaker kulit premium dengan siluet retro minimalis, mudah dipadukan dengan berbagai outfit.',
        options: [
          { name: 'Ukuran (EU)', choices: ['39', '40', '41', '42', '43'] },
          { name: 'Colorway', choices: ['Triple White', 'Raw Vintage'] }
        ]
      },
      {
        id: 'SPT-03',
        name: 'TerraGrip Waterproof Trail Walker',
        category: 'Outdoor & Trekking',
        price: 1450000,
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
        description: 'Outsole Vibram tahan licin di medan basah dengan membran waterproof bernapas.',
        options: [
          { name: 'Ukuran (EU)', choices: ['41', '42', '43', '44', '45'] },
          { name: 'Colorway', choices: ['Deep Olive', 'Earth Brown'] }
        ]
      },
      {
        id: 'SPT-04',
        name: 'Velocity Knit Slip-On Casual',
        category: 'Daily Comfort',
        price: 749000,
        image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80',
        description: 'Slip-on rajut stretch tanpa tali, ringan dipakai berjalan seharian tanpa lelah.',
        options: [
          { name: 'Ukuran (EU)', choices: ['39', '40', '41', '42', '43'] },
          { name: 'Colorway', choices: ['Storm Grey', 'Navy Blue'] }
        ]
      }
    ]
  },

  'restoran': {
    slug: 'restoran',
    categoryTitle: 'Restoran & Kuliner',
    businessName: 'Nusantara Bistro & Grill',
    tagline: 'Modern Heritage Indonesian Dining Experience',
    heroHeadline: 'Cita Rasa Nusantara Otentik Berstandar Bintang Lima',
    heroSubtitle: 'Rempah asli pilihan, daging berkualitas tinggi, dan teknik masak slow-cooked tradisional.',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#059669',
    themeBadge: 'Culinary & Dining',
    ctaActionLabel: 'Lanjut ke Pemesanan Menu',
    actionType: 'order',
    stats: [
      { label: 'Sertifikasi', value: '100% Halal' },
      { label: 'Chef Experience', value: '15+ Tahun' },
      { label: 'Waktu Penyajian', value: '15-20 Menit' }
    ],
    items: [
      {
        id: 'MENU-01',
        name: 'Wagyu Beef Rendang 48 Jam',
        category: 'Hidangan Utama',
        price: 185000,
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        description: 'Daging wagyu melt-in-mouth dimasak lambat 48 jam dengan karamelisasi santan kelapa murni.',
        options: [
          { name: 'Tingkat Pedas', choices: ['Sedang', 'Pedas Gurih', 'Ekstra Pedas'] },
          { name: 'Nasi', choices: ['Nasi Putih Pandan', 'Nasi Jeruk Rempah (+Rp 10.000)'] }
        ]
      },
      {
        id: 'MENU-02',
        name: 'Ayam Betutu Asap Jimbaran',
        category: 'Hidangan Utama',
        price: 135000,
        image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
        description: 'Ayam kampung utuh dipanggang dengan balutan bumbu genep dan daun singkong aromatik.',
        options: [
          { name: 'Porsi', choices: ['Setengah Ekor', 'Satu Ekor (+Rp 110.000)'] }
        ]
      },
      {
        id: 'MENU-03',
        name: 'Sop Buntut Bakar Madu Rempah',
        category: 'Sup & Kuah',
        price: 165000,
        image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=600&q=80',
        description: 'Buntut sapi Australia panggang madu gurih disajikan dengan kuah kaldu rempah bening kaya rasa.',
        options: [
          { name: 'Kuah Kaldu', choices: ['Original Rempah', 'Pedas Asam Segar'] }
        ]
      },
      {
        id: 'MENU-04',
        name: 'Es Cendol Nangka Organik',
        category: 'Pencuci Mulut',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
        description: 'Cendol daun pandan asli, santan segar peras pertama, gula aren kelapa organik, dan nangka madu.',
        options: [
          { name: 'Manis', choices: ['Normal', 'Less Sugar'] }
        ]
      }
    ]
  },

  'skincare': {
    slug: 'skincare',
    categoryTitle: 'Skincare & Kecantikan',
    businessName: 'Lumina Botanica',
    tagline: 'Science-Backed Clean Dermatological Skincare',
    heroHeadline: 'Kilau Kulit Sehat Alami Didukung Riset Klinis',
    heroSubtitle: 'Bebas paraben, tanpa pewangi buatan, teruji dermatologis aman untuk kulit sensitif tropis.',
    heroImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#BE185D',
    themeBadge: 'Beauty & Skincare',
    ctaActionLabel: 'Lanjut ke Checkout Pembelian',
    actionType: 'checkout',
    stats: [
      { label: 'Sertifikasi BPOM', value: 'Terdaftar Resmi' },
      { label: 'Cruelty-Free', value: '100% Vegan' },
      { label: 'Dermatologist', value: 'Tested Safe' }
    ],
    items: [
      {
        id: 'SKIN-01',
        name: 'Barrier Defense Ceramide Gel Cream',
        category: 'Moisturizer',
        price: 195000,
        image: 'https://images.unsplash.com/photo-1608248597359-251f47c32bf1?auto=format&fit=crop&w=600&q=80',
        description: 'Pelembap ringan dengan 5 jenis ceramide esensial dan Centella Asiatica untuk memperbaiki skin barrier.',
        options: [
          { name: 'Ukuran', choices: ['50 ml Jar', '100 ml Tube (+Rp 90.000)'] }
        ]
      },
      {
        id: 'SKIN-02',
        name: '10% Niacinamide + Zinc Glowing Serum',
        category: 'Serum Pencerah',
        price: 175000,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
        description: 'Mencerahkan noda hitam bekas jerawat, mengontrol sebum berlebih, dan meratakan tekstur pori.',
        options: [
          { name: 'Ukuran Botol', choices: ['30 ml Pipet', '50 ml Jumbo (+Rp 65.000)'] }
        ]
      },
      {
        id: 'SKIN-03',
        name: 'Invisible Dewy Sunscreen SPF 50+ PA++++',
        category: 'Sun Protection',
        price: 160000,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        description: 'Tabir surya hibrid tanpa whitecast, cepat meresap, dan kaya antioksidan teh hijau Jeju.',
        options: [
          { name: 'Finishing', choices: ['Matte Oil-Control', 'Dewy Hydrating'] }
        ]
      },
      {
        id: 'SKIN-04',
        name: 'Gentle Calming Oat Foaming Cleanser',
        category: 'Pembersih Wajah',
        price: 135000,
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
        description: 'Sabun cuci muka pH 5.5 seimbang dengan ekstrak colloidal oatmeal murni, tidak bikin kulit kesat.',
        options: [
          { name: 'Volume', choices: ['100 ml', '200 ml Refill (+Rp 75.000)'] }
        ]
      }
    ]
  },

  'furniture': {
    slug: 'furniture',
    categoryTitle: 'Furniture & Interior',
    businessName: 'KAYU Living',
    tagline: 'Handcrafted Solid Teak & Japandi Architectural Furniture',
    heroHeadline: 'Kehangatan Kayu Solid untuk Ruang Idaman Anda',
    heroSubtitle: 'Dibuat dengan presisi pengrajin Jepara, kayu jati bersertifikat FSC, dan garansi konstruksi 5 tahun.',
    heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#B45309',
    themeBadge: 'Interior & Living',
    ctaActionLabel: 'Lanjut ke Pemesanan Furniture',
    actionType: 'checkout',
    stats: [
      { label: 'Bahan Kayu', value: 'Kayu Jati Grade A' },
      { label: 'Garansi Rangka', value: '5 Tahun Resmi' },
      { label: 'Finishing', value: 'Water-based Eco' }
    ],
    items: [
      {
        id: 'FRN-01',
        name: 'Meja Makan Jati Scandinavian (6 Kursi)',
        category: 'Ruang Makan',
        price: 4800000,
        image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80',
        description: 'Meja makan solid tebal 4cm dengan sudut melengkung halus dan kaki kokoh bergaya Nordic.',
        options: [
          { name: 'Finishing Kayu', choices: ['Natural Matte', 'Walnut Dark', 'Bleached Teak'] },
          { name: 'Panjang Meja', choices: ['180 cm (6 Kursi)', '220 cm (8 Kursi) (+Rp 1.200.000)'] }
        ]
      },
      {
        id: 'FRN-02',
        name: 'Sofa Modular 3-Seater Cloud Linen',
        category: 'Ruang Tamu',
        price: 6200000,
        image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=600&q=80',
        description: 'Sofa berbusa densitas tinggi dengan cover linen katun yang bisa dilepas-pasang untuk dicuci.',
        options: [
          { name: 'Warna Cover', choices: ['Sand Beige', 'Slate Grey', 'Forest Green'] }
        ]
      },
      {
        id: 'FRN-03',
        name: 'Kursi Lounge Sandaran Rotan Alami',
        category: 'Kursi Santai',
        price: 1650000,
        image: 'https://images.unsplash.com/photo-1580481077195-c3a9a3229613?auto=format&fit=crop&w=600&q=80',
        description: 'Kombinasi kayu jati tua dan anyaman rotan manual berkualitas ekspor, estetis di sudut baca.',
        options: [
          { name: 'Bantalan Duduk', choices: ['Termasuk Cushion Katun', 'Tanpa Cushion'] }
        ]
      },
      {
        id: 'FRN-04',
        name: 'Rak Buku Minimalis Modular Teak',
        category: 'Penyimpanan & Display',
        price: 2900000,
        image: 'https://images.unsplash.com/photo-1594614271360-0ed9a570af1b?auto=format&fit=crop&w=600&q=80',
        description: 'Rak terbuka 5 tingkat multifungsi untuk memajang buku, tanaman hias, dan pajangan seni.',
        options: [
          { name: 'Dimensi', choices: ['Tinggi 180 x Lebar 90 cm', 'Tinggi 180 x Lebar 120 cm (+Rp 650.000)'] }
        ]
      }
    ]
  },

  'bengkel': {
    slug: 'bengkel',
    categoryTitle: 'Bengkel & Otomotif',
    businessName: 'AutoSpeed Garage',
    tagline: 'Modern Diagnostic & Performance Auto Workshop',
    heroHeadline: 'Perawatan Mobil Presisi dengan Scanner Komputer',
    heroSubtitle: 'Mekanik tersertifikasi, suku cadang original bergaransi, dan ruang tunggu ber-AC dengan Wi-Fi kencang.',
    heroImage: 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#DC2626',
    themeBadge: 'Automotive & Repair',
    ctaActionLabel: 'Lanjut ke Booking Servis',
    actionType: 'booking',
    stats: [
      { label: 'Garansi Servis', value: '30 Hari / 1.000 KM' },
      { label: 'Scanner OBD-II', value: 'Multi-Brand Diagnostic' },
      { label: 'Oli & Parts', value: '100% Genuine' }
    ],
    items: [
      {
        id: 'OTO-01',
        name: 'Paket Servis Berkala 10.000 KM',
        category: 'Paket Servis Rutin',
        price: 650000,
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
        description: 'Ganti oli mesin, filter oli, cek rem 4 roda, tune-up busi, dan general inspection 45 titik.',
        options: [
          { name: 'Jenis Kendaraan', choices: ['Sedan / Hatchback', 'SUV / MPV', 'Mobil Diesel Turbo (+Rp 200.000)'] }
        ]
      },
      {
        id: 'OTO-02',
        name: 'Tune-Up Karbon Gurah Ruang Bakar',
        category: 'Performa Mesin',
        price: 480000,
        image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80',
        description: 'Membersihkan kerak deposit karbon di piston dan throttle body untuk mengembalikan tarikan mesin.',
        options: [
          { name: 'Kapasitas Mesin', choices: ['1.000cc - 1.500cc', '1.600cc - 2.500cc (+Rp 150.000)'] }
        ]
      },
      {
        id: 'OTO-03',
        name: 'Servis Rem & Kuras Minyak Rem ABS',
        category: 'Keselamatan & Rem',
        price: 350000,
        image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&q=80',
        description: 'Pembersihan rotor caliper rem, bleeding minyak rem dengan alat vacuum otomatis, cek sensor ABS.',
        options: [
          { name: 'Grade Minyak Rem', choices: ['DOT 3 Standard', 'DOT 4 High Temp (+Rp 80.000)'] }
        ]
      },
      {
        id: 'OTO-04',
        name: 'Coating Nano Ceramic 3 Layers',
        category: 'Auto Detailing',
        price: 2500000,
        image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
        description: 'Pelapisan kaca nano ceramic 9H tahan gores ringan, efek hydrophobic daun talas, kilau kaca 3 tahun.',
        options: [
          { name: 'Ukuran Mobil', choices: ['Small / Medium Car', 'Large / Luxury SUV (+Rp 700.000)'] }
        ]
      }
    ]
  },

  'properti': {
    slug: 'properti',
    categoryTitle: 'Properti & Real Estate',
    businessName: 'Grand Horizon Landmark',
    tagline: 'Premium Residential, Private Villas & Commercial Spaces',
    heroHeadline: 'Investasi Masa Depan di Lokasi Paling Bernilai',
    heroSubtitle: 'Sertifikat Hak Milik (SHM) legal aman, akses tol langsung, fasilitas clubhouse, dan sistem keamanan 24 jam.',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#4338CA',
    themeBadge: 'Real Estate & Living',
    ctaActionLabel: 'Lanjut ke Jadwal Survei Lokasi',
    actionType: 'survey',
    stats: [
      { label: 'Legalitas Dokumen', value: 'SHM & PBG Lengkap' },
      { label: 'Fasilitas Kawasan', value: 'Smart Home Ready' },
      { label: 'Kenaikan Nilai', value: '12% Per Tahun' }
    ],
    items: [
      {
        id: 'PROP-01',
        name: 'Villa Sanctuary Sunset Ubud',
        category: 'Private Resort Villa',
        price: 3800000000,
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
        description: 'Villa 3 kamar tidur dengan infinity pool pemandangan lembah sawah hijau abadi, full furnished.',
        options: [
          { name: 'Status Kepemilikan', choices: ['Freehold (SHM)', 'Leasehold 30 Tahun (Diskon 35%)'] },
          { name: 'Tipe Survei', choices: ['Survei Langsung di Lokasi', 'Video Tour Online 360°'] }
        ]
      },
      {
        id: 'PROP-02',
        name: 'Cluster Emerald BSD City 2 Lantai',
        category: 'Rumah Tinggal Modern',
        price: 2100000000,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
        description: 'Hunian kompak 4 KT + 3 KM, solar panel atap, garasi 2 mobil, 5 menit dari stasiun KRL & Mall.',
        options: [
          { name: 'Skema Pembayaran', choices: ['KPR Bank Rekanan (DP 10%)', 'Cash Keras (Diskon 5%)'] }
        ]
      },
      {
        id: 'PROP-03',
        name: 'Senopati Luxury Skyline Penthouse',
        category: 'Apartemen Mewah',
        price: 7500000000,
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
        description: 'Penthouse lantai atas dengan lift pribadi, balkon luas pemandangan SCBD, dan 3 private parking slots.',
        options: [
          { name: 'Kondisi Unit', choices: ['Fully Furnished Interior', 'Semi Furnished'] }
        ]
      },
      {
        id: 'PROP-04',
        name: 'Green Valley Eco Residence',
        category: 'Rumah Pertama Strategis',
        price: 1350000000,
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
        description: 'Kawasan asri berkonsep eco-green living dengan jogging track, danau buatan, dan security biometrik.',
        options: [
          { name: 'Tipe Unit', choices: ['Tipe 60/72 (2 Lantai)', 'Tipe 85/90 (3 KT) (+Rp 300.000.000)'] }
        ]
      }
    ]
  },

  'kafe': {
    slug: 'kafe',
    categoryTitle: 'Kafe & Coffee Shop',
    businessName: 'Kopi Seduh Jiwa',
    tagline: 'Artisanal Roastery & Specialty Pastry Bar',
    heroHeadline: 'Seduhan Kopi Berkualitas dari Biji Pilihan Petani Nusantara',
    heroSubtitle: 'Dipanggang segar setiap minggu oleh Q-Grader, disajikan dengan pastry renyah mentega Prancis.',
    heroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    accentColor: '#78350F',
    themeBadge: 'Cafe & Specialty Coffee',
    ctaActionLabel: 'Lanjut ke Pemesanan Kopi',
    actionType: 'order',
    stats: [
      { label: 'Asal Biji Kopi', value: 'Gayo, Kintamani, Toraja' },
      { label: 'Metode Roasting', value: 'Small-Batch Drum' },
      { label: 'Pilihan Susu', value: 'Dairy & Oat Milk' }
    ],
    items: [
      {
        id: 'KOP-01',
        name: 'Kopi Susu Gula Aren Spesial',
        category: 'Espresso-Based',
        price: 28000,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
        description: 'Double shot espresso blend house, susu segar pasteurisasi, dan gula aren organik nira kelapa.',
        options: [
          { name: 'Pilihan Susu', choices: ['Susu Sapi Segar', 'Oat Milk (+Rp 8.000)'] },
          { name: 'Tingkat Manis', choices: ['Normal', 'Less Sweet (50%)', 'Tanpa Gula'] },
          { name: 'Es Batu', choices: ['Normal Ice', 'Less Ice'] }
        ]
      },
      {
        id: 'KOP-02',
        name: 'Manual Brew V60 Single Origin Gayo Anaerob',
        category: 'Filter Coffee',
        price: 38000,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        description: 'Notes: Markisa manis, floral melati, dan aftertaste karamel yang bersih dan kompleks.',
        options: [
          { name: 'Penyajian', choices: ['Disajikan Panas (Hot Cup)', 'Disajikan Dingin (On the Rocks)'] }
        ]
      },
      {
        id: 'KOP-03',
        name: 'Sparkling Cold Brew Citrus Tonic',
        category: 'Signature Mocktail',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
        description: 'Seduhan kopi dingin 16 jam dipadu air tonik segar, perasan jeruk nipis, dan daun mint.',
        options: [
          { name: 'Tingkat Sodaan', choices: ['Normal Fizz', 'Extra Ice'] }
        ]
      },
      {
        id: 'KOP-04',
        name: 'French Butter Croissant',
        category: 'Artisan Pastry',
        price: 26000,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
        description: 'Croissant renyah berlapis dengan mentega Elle & Vire Prancis asli, dipanaskan hangat saat dipesan.',
        options: [
          { name: 'Penyajian', choices: ['Dihangatkan (Warm)', 'Suhu Ruangan'] }
        ]
      }
    ]
  }
};
