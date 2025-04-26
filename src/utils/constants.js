// src/utils/constants.js

/**
 * Application Constants
 */

// Player Status Types
export const PLAYER_STATUS = {
  AVAILABLE: 'available',
  SOLD: 'sold',
  UNSOLD: 'unsold',
  PERMANENTLY_UNSOLD: 'permanently_unsold'
};

// Player Role Types
export const PLAYER_ROLES = {
  BATSMAN: 'Batsman',
  BOWLER: 'Bowler',
  ALL_ROUNDER: 'All-rounder',
  WICKET_KEEPER: 'Wicket-keeper'
};

// Auction Rounds
export const AUCTION_ROUNDS = {
  MAIN: 'main',
  UNSOLD: 'unsold'
};

// Bid Increments based on current bid amount
export const BID_INCREMENTS = [
  { threshold: 1000, increment: 100 },
  { threshold: 5000, increment: 500 },
  { threshold: 10000, increment: 1000 },
  { threshold: 50000, increment: 5000 },
  { threshold: 100000, increment: 10000 }
];

// Default Settings
export const DEFAULT_SETTINGS = {
  // Team defaults
  DEFAULT_WALLET_AMOUNT: 10000,
  
  // Auction defaults
  MIN_BID_INCREMENT: 100,
  UNSOLD_PRICE_REDUCTION: 0.5,
  
  // UI settings
  NOTIFICATION_TIMEOUT: 5000,
  MODAL_TRANSITION_DURATION: 300,
  
  // Date settings
  DEFAULT_AUCTION_DATE: new Date('2025-04-29T09:00:00')
};

// Colors for different player roles (for UI)
export const ROLE_COLORS = {
  [PLAYER_ROLES.BATSMAN]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  },
  [PLAYER_ROLES.BOWLER]: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200'
  },
  [PLAYER_ROLES.ALL_ROUNDER]: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-200'
  },
  [PLAYER_ROLES.WICKET_KEEPER]: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-200'
  },
  default: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  }
};

// Colors for different player statuses (for UI)
export const STATUS_COLORS = {
  [PLAYER_STATUS.AVAILABLE]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  [PLAYER_STATUS.SOLD]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  [PLAYER_STATUS.UNSOLD]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  [PLAYER_STATUS.PERMANENTLY_UNSOLD]: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  }
};

// Navigation links for header
export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Auction', path: '/auction' },
  { name: 'Teams', path: '/teams' },
  { name: 'Results', path: '/results' },
  { name: 'Admin', path: '/admin' }
];

// Admin tabs
export const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'teams', label: 'Team Management' },
  { id: 'players', label: 'Player Import' },
  { id: 'playersList', label: 'Players List' }, // New tab for player list view
  { id: 'auction', label: 'Auction Controls' },
  { id: 'settings', label: 'Settings' }
];


// Required fields for player import
export const PLAYER_IMPORT_REQUIRED_FIELDS = [
  'name|player_name|fullname',  // Multiple alternatives
  'basePrice|base_price|price', // Multiple alternatives
  'role|player_role|position'   // Multiple alternatives
];

// CSV export headers for results
export const RESULT_EXPORT_HEADERS = {
  players: [
    'Player Name',
    'Role',
    'Batting Style',
    'Bowling Style',
    'Base Price',
    'Sold For',
    'Team'
  ],
  teams: [
    'Team Name',
    'Owner',
    'Total Players',
    'Total Spent',
    'Remaining Budget',
    'Players'
  ]
};

export default {
  PLAYER_STATUS,
  PLAYER_ROLES,
  AUCTION_ROUNDS,
  BID_INCREMENTS,
  DEFAULT_SETTINGS,
  ROLE_COLORS,
  STATUS_COLORS,
  NAV_LINKS,
  ADMIN_TABS,
  PLAYER_IMPORT_REQUIRED_FIELDS,
  RESULT_EXPORT_HEADERS
};