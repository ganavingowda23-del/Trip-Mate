import type { Destination } from '../types/trip';

export const HERO_IMAGE = '/src/assets/images/hero_coastline_horizon_1795502221323.jpg';

export const DESTINATIONS: Destination[] = [
  {
    id: 'amalfi-coast',
    name: 'Amalfi Coast',
    country: 'Italy',
    region: 'Mediterranean Europe',
    category: 'Beaches',
    image: '/src/assets/images/dest_amalfi_coast_1795502222158.jpg',
    shortDescription:
      'Sun-drenched limestone cliffs, pastel fishing villages, and quiet coves along the Tyrrhenian Sea.',
    fullDescription:
      'Trace coastal footpaths from Positano to Ravello, charter a wooden boat along hidden grottos, and dine on lemon-scented seafood overlooking turquoise water.',
    bestTimeToVisit: 'May – June & September – October',
    recommendedDays: 5,
    dailyBudgetUsd: {
      budget: 135,
      moderate: 260,
      luxury: 580,
    },
    highlights: ['Positano Cliff Walk', 'Ravello Villa Cimbrone', 'Path of the Gods', 'Capri Boat Crossing'],
    signatureDish: 'Scialatielli ai Frutti di Mare & Amalfi Lemon Delizia',
  },
  {
    id: 'kyoto-japan',
    name: 'Kyoto',
    country: 'Japan',
    region: 'East Asia',
    category: 'Historical Places',
    image: '/src/assets/images/dest_kyoto_heritage_1795502222067.jpg',
    shortDescription:
      'Centuries-old wooden pagodas, moss gardens, lantern-lit alleys, and refined seasonal cuisine.',
    fullDescription:
      'Walk quietly through Fushimi Inari before dawn, explore Higashiyama timber lanes, and pause for ceremonial matcha in peaceful Zen temple gardens.',
    bestTimeToVisit: 'March – May & October – November',
    recommendedDays: 6,
    dailyBudgetUsd: {
      budget: 110,
      moderate: 215,
      luxury: 490,
    },
    highlights: ['Kiyomizu-dera Temple', 'Arashiyama Bamboo Grove', 'Gion Heritage Quarter', 'Philosopher’s Path'],
    signatureDish: 'Kaiseki Seasonal Tasting & Uji Matcha Parfait',
  },
  {
    id: 'swiss-alps-zermatt',
    name: 'Zermatt & Bernese Oberland',
    country: 'Switzerland',
    region: 'Central Europe',
    category: 'Mountains',
    image: '/src/assets/images/dest_swiss_alps_1795502222352.jpg',
    shortDescription:
      'Mirror-clear glacial lakes, car-free timber villages, and panoramic cogwheel railways.',
    fullDescription:
      'Ascend high-altitude ridges above emerald alpine valleys, hike ridgeline trails beneath snow-dusted peaks, and unwind in warm wooden chalets.',
    bestTimeToVisit: 'June – September & December – March',
    recommendedDays: 5,
    dailyBudgetUsd: {
      budget: 185,
      moderate: 330,
      luxury: 690,
    },
    highlights: ['Oeschinensee Alpine Lake', 'Gornergrat Ridge Train', 'Lauterbrunnen Waterfalls', 'Five Lakes Walk'],
    signatureDish: 'Alpine Rösti & Gruyère Cheese Fondue',
  },
  {
    id: 'patagonia-torres',
    name: 'Torres del Paine',
    country: 'Chile',
    region: 'South America',
    category: 'Adventure',
    image: '/src/assets/images/dest_patagonia_trail_1795502222581.jpg',
    shortDescription:
      'Towering granite spires, turquoise glacial lagoons, and wind-swept backcountry trekking routes.',
    fullDescription:
      'Trek across suspension bridges beside calving glaciers, spot wild guanacos on the steppe, and watch sunrise paint the granite horns amber.',
    bestTimeToVisit: 'November – March',
    recommendedDays: 7,
    dailyBudgetUsd: {
      budget: 145,
      moderate: 275,
      luxury: 620,
    },
    highlights: ['Base Las Torres Trek', 'Grey Glacier Navigation', 'French Valley Overlook', 'Salto Grande Falls'],
    signatureDish: 'Patagonian Lamb Asado & Calafate Berry Tart',
  },
  {
    id: 'lisbon-portugal',
    name: 'Lisbon',
    country: 'Portugal',
    region: 'Iberian Peninsula',
    category: 'Cities',
    image: '/src/assets/images/dest_lisbon_city_1795502223635.jpg',
    shortDescription:
      'Terracotta hillsides, vintage yellow trams, tiled facades, and breezy riverfront viewpoints.',
    fullDescription:
      'Ride Tram 28 through Alfama’s winding alleys, listen to evening Fado music, and take a day train out to Sintra’s forested palaces and Atlantic cliffs.',
    bestTimeToVisit: 'April – June & September – October',
    recommendedDays: 4,
    dailyBudgetUsd: {
      budget: 95,
      moderate: 185,
      luxury: 410,
    },
    highlights: ['Alfama Viewpoints', 'Belém Jerónimos Monastery', 'LX Factory', 'Sintra Coastal Day Trip'],
    signatureDish: 'Pastéis de Nata & Grilled Atlantic Sardines',
  },
  {
    id: 'petra-jordan',
    name: 'Petra & Wadi Rum',
    country: 'Jordan',
    region: 'Middle East',
    category: 'Historical Places',
    image: '/src/assets/images/dest_petra_jordan_1795502222785.jpg',
    shortDescription:
      'Rose-red sandstone canyons leading to monumental Nabataean facades carved into living rock.',
    fullDescription:
      'Enter through the narrow Siq canyon at first light, climb stone steps to the Monastery overlooking desert valleys, and stargaze in Wadi Rum.',
    bestTimeToVisit: 'March – May & September – November',
    recommendedDays: 5,
    dailyBudgetUsd: {
      budget: 115,
      moderate: 220,
      luxury: 460,
    },
    highlights: ['The Siq & Treasury', 'Ad-Deir Monastery Trail', 'High Place of Sacrifice', 'Wadi Rum Desert Camp'],
    signatureDish: 'Mansaf & Zarb Bedouin Pit-Roasted Supper',
  },
  {
    id: 'mallorca-calas',
    name: 'Mallorca Serra & Calas',
    country: 'Spain',
    region: 'Balearic Islands',
    category: 'Beaches',
    image: '/src/assets/images/hero_coastline_horizon_1795502221323.jpg',
    shortDescription:
      'Secluded turquoise coves framed by pine forests and stone villages nestled in coastal mountains.',
    fullDescription:
      'Swim in sheltered calas at dawn, cycle winding mountain passes in the Serra de Tramuntana, and enjoy long lunches under olive groves.',
    bestTimeToVisit: 'May – June & September – October',
    recommendedDays: 5,
    dailyBudgetUsd: {
      budget: 120,
      moderate: 235,
      luxury: 520,
    },
    highlights: ['Caló des Moro Cove', 'Valldemossa Stone Village', 'Port de Sóller Tram', 'Cap de Formentor'],
    signatureDish: 'Ensaïmada Pastry & Sobrassada Tapas',
  },
  {
    id: 'banff-rockies',
    name: 'Banff & Lake Louise',
    country: 'Canada',
    region: 'North America',
    category: 'Mountains',
    image: '/src/assets/images/dest_swiss_alps_1795502222352.jpg',
    shortDescription:
      'Glacier-fed turquoise lakes, dramatic limestone peaks, and wildlife-rich pine corridors.',
    fullDescription:
      'Paddle across calm alpine water in the early morning, drive the Icefields Parkway past hanging glaciers, and hike high larch ridges.',
    bestTimeToVisit: 'June – September',
    recommendedDays: 5,
    dailyBudgetUsd: {
      budget: 155,
      moderate: 280,
      luxury: 590,
    },
    highlights: ['Moraine Lake Sunrise', 'Icefields Parkway', 'Johnston Canyon', 'Plain of Six Glaciers'],
    signatureDish: 'Alberta Bison Burger & Cedar-Plank Salmon',
  },
];

export const DESTINATION_CATEGORIES = [
  'All',
  'Beaches',
  'Mountains',
  'Adventure',
  'Cities',
  'Historical Places',
] as const;
