# WatchList API Integration Guide

## Overview
The WatchList component now fetches real-time data from stock APIs instead of using hardcoded data. It includes search functionality to find companies by name or symbol.

## New Features

### 1. Real-time Top Companies
- **Endpoint**: `GET /stocks/top-companies`
- **Description**: Fetches the top 50 popular companies with current prices
- **Response**: Array of company objects with symbol, name, price, change, and change percentage

### 2. Company Search
- **Endpoint**: `GET /stocks/search?q={query}`
- **Description**: Search for companies by name or symbol
- **Parameters**: 
  - `q`: Search query (minimum 2 characters)
- **Response**: Array of matching companies with current prices

### 3. Individual Stock Price
- **Endpoint**: `GET /stocks/price/{symbol}`
- **Description**: Get current price for a specific stock symbol
- **Response**: Detailed stock information including price, change, volume, etc.

## Frontend Implementation

### WatchList Component Features

1. **Automatic Loading**: Loads top 50 companies on component mount
2. **Real-time Search**: 
   - Debounced search (500ms delay)
   - Searches by company name or symbol
   - Shows search results in real-time
3. **Dynamic Display**: 
   - Shows watchlist when no search query
   - Shows search results when searching
   - Loading states for better UX

### Search Functionality

```javascript
// Search for companies
const searchResults = await axios.get(`/stocks/search?q=Apple`);
// Returns companies matching "Apple" in name or symbol

// Search by symbol
const searchResults = await axios.get(`/stocks/search?q=AAPL`);
// Returns Apple Inc. (AAPL)
```

### Data Structure

Each company object contains:
```javascript
{
  symbol: "AAPL",           // Stock symbol
  name: "Apple Inc.",       // Company name
  price: 175.43,           // Current price
  change: 2.15,            // Price change
  changePercent: "1.24",   // Percentage change
  isDown: false            // Whether price is down
}
```

## API Usage Examples

### Get Top Companies
```javascript
const response = await fetch('/stocks/top-companies');
const data = await response.json();
console.log(data.data); // Array of top companies
```

### Search Companies
```javascript
const response = await fetch('/stocks/search?q=Microsoft');
const data = await response.json();
console.log(data.data); // Array of matching companies
```

### Get Stock Price
```javascript
const response = await fetch('/stocks/price/AAPL');
const data = await response.json();
console.log(data.data); // Apple stock details
```

## Supported Companies

The system supports major tech companies including:
- **AAPL** - Apple Inc.
- **GOOGL** - Alphabet Inc.
- **MSFT** - Microsoft Corporation
- **AMZN** - Amazon.com Inc.
- **TSLA** - Tesla Inc.
- **META** - Meta Platforms Inc.
- **NVDA** - NVIDIA Corporation
- **NFLX** - Netflix Inc.
- And many more...

## Error Handling

- **API Failures**: Falls back to mock data if real APIs fail
- **Search Errors**: Shows "No companies found" message
- **Loading States**: Displays loading indicators during API calls
- **Empty States**: Shows appropriate messages when no data is available

## Search Tips

1. **Search by Company Name**: "Apple", "Microsoft", "Tesla"
2. **Search by Symbol**: "AAPL", "MSFT", "TSLA"
3. **Partial Matches**: "App" will find "Apple Inc."
4. **Case Insensitive**: "apple" and "APPLE" both work

## Performance Features

- **Debounced Search**: Prevents excessive API calls
- **Caching**: Top companies loaded once on mount
- **Fallback Data**: Mock data available if APIs fail
- **Loading States**: Better user experience during API calls

## Environment Setup

Make sure to set up your environment variables:
```env
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

For development, the system will use mock data if no API key is provided.

## Testing

You can test the functionality by:
1. Opening the WatchList component
2. Seeing the top 50 companies load automatically
3. Typing in the search box to find specific companies
4. Clicking "Buy" on any company to test the purchase flow

The search is responsive and will show results as you type (with a 500ms debounce).
