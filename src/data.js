/* Données du catalogue : prix et disponibilité à confirmer auprès de la boutique. */

export const CONTACT = {
  "shop": "Play Tech Manouba",
  "phone1": "54 097 202",
  "phone2": "23 641 343",
  "tel1": "+21654097202",
  "tel2": "+21623641343",
  "whatsapp": "21654097202",
  "instagram": "https://www.instagram.com/playtech_manouba/",
  "address": "Manouba, Tunisie",
  "mapsUrl": "https://maps.google.com/?q=Manouba,+Tunisie",
  "hours": "Horaires à confirmer",
  "hoursNote": "Contactez-nous avant votre visite"
};

export const CATEGORIES = [
  {
    "id": "all",
    "label": "Tous"
  },
  {
    "id": "portable",
    "label": "PC portables"
  },
  {
    "id": "bureau",
    "label": "PC de bureau"
  },
  {
    "id": "gaming",
    "label": "Gaming"
  },
  {
    "id": "simracing",
    "label": "Sim Racing"
  }
];

export const BADGES = {
  "new": {
    "label": "Nouveau",
    "cls": "badge--new"
  },
  "promo": {
    "label": "Bonne affaire",
    "cls": "badge--promo"
  },
  "gaming": {
    "label": "Gaming",
    "cls": "badge--gaming"
  },
  "reco": {
    "label": "Reconditionné",
    "cls": "badge--reco"
  },
  "devis": {
    "label": "Sur devis",
    "cls": "badge--devis"
  }
};

export const PRODUCTS = [
  {
    "id": "macbook-air-m2",
    "brand": "Apple",
    "name": "MacBook Air 15\" M2",
    "category": "portable",
    "price": 3280,
    "image": "/images/macbook.jpg",
    "desc": "MacBook Air 2023 avec puce M2, 8 Go de mémoire et 256 Go de stockage.",
    "chips": [
      "M2",
      "8 Go",
      "256 Go",
      "15\""
    ],
    "specs": [
      [
        "Processeur",
        "Apple M2"
      ],
      [
        "Mémoire",
        "8 Go"
      ],
      [
        "Stockage",
        "256 Go"
      ],
      [
        "Écran",
        "15 pouces"
      ]
    ],
    "featured": true
  },
  {
    "id": "alienware-m17",
    "brand": "Dell",
    "name": "Alienware · i7 10e gén",
    "category": "gaming",
    "price": 2980,
    "image": "/images/gaming.jpg",
    "desc": "Un PC portable Dell Alienware pour le gaming, équipé d’un processeur i7 et de 16 Go de mémoire.",
    "chips": [
      "i7-10870H",
      "16 Go",
      "512 Go"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core i7-10870H"
      ],
      [
        "Mémoire",
        "16 Go"
      ],
      [
        "Stockage",
        "512 Go SSD"
      ]
    ],
    "featured": true,
    "badge": "gaming"
  },
  {
    "id": "elitebook-1040",
    "brand": "HP",
    "name": "EliteBook 1040 G7 x360",
    "category": "portable",
    "price": 1980,
    "image": "/images/business.jpg",
    "desc": "Un ordinateur convertible HP EliteBook avec processeur i5 vPro et 16 Go de mémoire.",
    "chips": [
      "i5-10310U",
      "16 Go",
      "x360"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core i5-10310U vPro"
      ],
      [
        "Mémoire",
        "16 Go DDR4 3200 MHz"
      ],
      [
        "Format",
        "Convertible x360"
      ]
    ],
    "featured": false
  },
  {
    "id": "hp-15-core5",
    "brand": "HP",
    "name": "HP 15 · Core 5 120U",
    "category": "portable",
    "price": 1680,
    "image": "/images/laptop-silver.jpg",
    "desc": "Un PC portable HP 15 équipé d’un processeur Intel Core 5 120U et de 16 Go de mémoire.",
    "chips": [
      "Core 5 120U",
      "16 Go"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core 5 120U"
      ],
      [
        "Mémoire",
        "16 Go"
      ]
    ],
    "featured": true
  },
  {
    "id": "hp-i5-11",
    "brand": "HP",
    "name": "HP · i5 11e gén",
    "category": "portable",
    "price": 1480,
    "image": "/images/laptop-silver.jpg",
    "desc": "Un ordinateur HP avec processeur Intel Core i5 de 11e génération et 16 Go de mémoire.",
    "chips": [
      "i5 11e gén",
      "16 Go",
      "512 Go"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core i5 11e génération"
      ],
      [
        "Mémoire",
        "16 Go"
      ],
      [
        "Stockage",
        "512 Go SSD"
      ]
    ],
    "featured": false
  },
  {
    "id": "ideapad-5i",
    "brand": "Lenovo",
    "name": "IdeaPad 5i 2-en-1",
    "category": "portable",
    "price": 2480,
    "image": "/images/laptop-2in1.jpg",
    "desc": "Un PC convertible Lenovo IdeaPad 5i tactile avec processeur Intel Core i7.",
    "chips": [
      "i7-13620H",
      "Tactile",
      "2-en-1"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core i7-13620H"
      ],
      [
        "Écran",
        "Tactile"
      ],
      [
        "Format",
        "2-en-1"
      ]
    ],
    "featured": true
  },
  {
    "id": "latitude-7430",
    "brand": "Dell",
    "name": "Latitude 7430 · Tactile",
    "category": "portable",
    "price": 1980,
    "image": "/images/business.jpg",
    "desc": "Un Dell Latitude 7430 Carbon tactile équipé d’un processeur Intel Core i5 de 12e génération.",
    "chips": [
      "i5-1245U",
      "Tactile",
      "Carbon"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core i5-1245U"
      ],
      [
        "Écran",
        "Tactile"
      ],
      [
        "Finition",
        "Carbon"
      ]
    ],
    "featured": false
  },
  {
    "id": "latitude-7410",
    "brand": "Dell",
    "name": "Latitude 7410",
    "category": "portable",
    "price": 1480,
    "image": "/images/hero.jpg",
    "desc": "Un Dell Latitude 7410 Carbon équipé d’un processeur i5 et de 16 Go de mémoire.",
    "chips": [
      "i5 10e gén",
      "16 Go",
      "Carbon"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core i5 10e génération"
      ],
      [
        "Mémoire",
        "16 Go"
      ],
      [
        "Finition",
        "Carbon"
      ]
    ],
    "featured": false
  },
  {
    "id": "asus-vivobook-i5",
    "brand": "ASUS",
    "name": "ASUS · i5 8e gén",
    "category": "portable",
    "price": 880,
    "image": "/images/laptop-silver.jpg",
    "desc": "Un ordinateur ASUS avec processeur i5, 8 Go de mémoire et double carte graphique.",
    "chips": [
      "i5 8e gén",
      "8 Go",
      "256 Go"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core i5 8e génération"
      ],
      [
        "Mémoire",
        "8 Go DDR4"
      ],
      [
        "Stockage",
        "256 Go SSD"
      ],
      [
        "Graphismes",
        "Double carte graphique"
      ]
    ],
    "featured": false
  },
  {
    "id": "asus-vivobook-i3",
    "brand": "ASUS",
    "name": "ASUS · i3",
    "category": "portable",
    "price": 680,
    "image": "/images/laptop-silver.jpg",
    "desc": "Un ordinateur ASUS équipé d’un processeur Intel Core i3, de 8 Go de mémoire et d’un SSD.",
    "chips": [
      "i3-7020U",
      "8 Go",
      "240 Go"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core i3-7020U"
      ],
      [
        "Mémoire",
        "8 Go"
      ],
      [
        "Stockage",
        "240 Go SSD"
      ]
    ],
    "featured": false
  },
  {
    "id": "optiplex-5050",
    "brand": "Dell",
    "name": "OptiPlex 5050",
    "category": "bureau",
    "price": 880,
    "image": "/images/desktop.jpg",
    "desc": "Un ordinateur de bureau Dell OptiPlex 5050 avec processeur i5 et stockage SSD.",
    "chips": [
      "i5 7e gén",
      "8 Go",
      "256 Go"
    ],
    "specs": [
      [
        "Processeur",
        "Intel Core i5 7e génération"
      ],
      [
        "Mémoire",
        "8 Go"
      ],
      [
        "Stockage",
        "256 Go SSD"
      ]
    ],
    "featured": false
  },
  {
    "id": "pack-simracing",
    "brand": "Play Tech",
    "name": "Pack SimRacing Complet",
    "category": "simracing",
    "price": null,
    "image": "/images/simracing.jpg",
    "desc": "Un pack SimRacing complet avec baquet RECARO, châssis, volant et pédalier.",
    "chips": [
      "Baquet RECARO",
      "Châssis",
      "Volant",
      "Pédalier"
    ],
    "specs": [
      [
        "Siège",
        "Baquet RECARO"
      ],
      [
        "Structure",
        "Châssis"
      ],
      [
        "Commandes",
        "Volant et pédalier"
      ]
    ],
    "featured": false,
    "badge": "devis"
  }
];
