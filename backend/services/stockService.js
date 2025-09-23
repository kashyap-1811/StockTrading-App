const axios = require('axios');

class StockService {
    constructor() {
        this.finnhubBaseUrl = 'https://finnhub.io/api/v1';
        this.finnhubApiKey = process.env.FINNHUB_API_KEY; // Use demo key if no API key provided
        this.yahooBaseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
        this.rateLimitDelay = 500; // 0.5 second delay between requests (faster for 10 companies)
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2 seconds delay for retries
        
        // Cache configuration
        this.cache = new Map();
        this.cacheExpiry = 20 * 1000; // 20 seconds for faster updates
        this.companiesCache = null;
        this.companiesCacheTime = null;
        
        // Historical data cache
        this.historicalCache = new Map();
        this.lastFetchDate = null;
        
        // Real-time update interval
        this.updateInterval = null;
        this.isUpdating = false;
    }

    // Check if cache is valid
    isCacheValid(cacheTime) {
        return cacheTime && (Date.now() - cacheTime) < this.cacheExpiry;
    }

    // Clean expired cache entries
    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheExpiry) {
                this.cache.delete(key);
            }
        }
    }

    // Clear historical cache when date changes
    clearHistoricalCacheIfNeeded() {
        if (this.shouldFetchNewHistoricalData()) {
            this.historicalCache.clear();
            this.lastFetchDate = this.getCurrentDateString();
        }
    }

    // Check if we need to fetch new historical data (only when date changes)
    shouldFetchNewHistoricalData() {
        const today = new Date().toDateString();
        return this.lastFetchDate !== today;
    }

    // Get current date string
    getCurrentDateString() {
        return new Date().toDateString();
    }

    // Broadcast stock updates via socket
    broadcastStockUpdate(companiesData) {
        if (global.io) {
            global.io.emit('stockPricesUpdate', {
                companies: companiesData,
                timestamp: Date.now()
            });
        }
    }

    // Start continuous price updates
    startContinuousUpdates() {
        if (this.updateInterval) {
            return; // Already running
        }

        this.updateInterval = setInterval(async () => {
            if (this.isUpdating) {
                return; // Prevent overlapping updates
            }

            this.isUpdating = true;
            try {
                // Force refresh companies data
                this.companiesCacheTime = null; // Invalidate cache
                await this.getAllCompanies();
            } catch (error) {
                // Silent error handling
            } finally {
                this.isUpdating = false;
            }
        }, 20000); // Update every 20 seconds
    }

    // Stop continuous price updates
    stopContinuousUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Get all 20 US companies data with caching
    async getAllCompanies() {
        // Clean expired cache entries
        this.cleanExpiredCache();
        
        // Check if we have valid cached data
        if (this.isCacheValid(this.companiesCacheTime)) {
            return this.companiesCache;
        }

        try {
            const allSymbols = this.get10USSymbols();
            const stockData = await this.getMultipleStockPrices(allSymbols);
            
            const companiesData = stockData
                .filter(stock => stock.success && stock.data)
                .map(stock => ({
                    symbol: this.cleanSymbolForDisplay(stock.data.symbol),
                    name: this.getCompanyName(stock.data.symbol),
                    price: stock.data.price
                }));
            
            // Cache the results
            this.companiesCache = companiesData;
            this.companiesCacheTime = Date.now();
            
            // Broadcast updated data via socket
            this.broadcastStockUpdate(companiesData);
            
            return companiesData;
        } catch (error) {
            // Return cached data if available, even if expired
            if (this.companiesCache) {
                return this.companiesCache;
            }
            throw error;
        }
    }

    // Search companies
    async searchCompanies(query) {
        try {
            const allCompanies = this.get10USCompanies();
            const searchResults = allCompanies.filter(company => 
                company.symbol.toLowerCase().includes(query.toLowerCase()) ||
                company.name.toLowerCase().includes(query.toLowerCase())
            );

            // Get current prices for search results
            const symbolsToFetch = searchResults.slice(0, 10).map(company => company.symbol);
            const stockData = await this.getMultipleStockPrices(symbolsToFetch);
            
            return searchResults.slice(0, 10).map((company, index) => {
                const stockInfo = stockData[index];
                if (stockInfo && stockInfo.success && stockInfo.data) {
                    return {
                        symbol: this.cleanSymbolForDisplay(company.symbol),
                        name: company.name,
                        price: stockInfo.data.price,
                    };
                } else {
                    // Return without price if API fails
                    return {
                        symbol: this.cleanSymbolForDisplay(company.symbol),
                        name: company.name,
                        price: null
                    };
                }
            });
        } catch (error) {
            console.error('Error searching companies:', error);
            return [];
        }
    }

    // Helper method to add delay between requests
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Helper method to retry API calls with exponential backoff
    async retryApiCall(apiCall, retries = this.maxRetries) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                const isRateLimit = error.response && error.response.status === 429;
                const isLastAttempt = attempt === retries;
                
                if (isRateLimit && !isLastAttempt) {
                    const delayTime = this.retryDelay * Math.pow(2, attempt - 1);
                    await this.delay(delayTime);
                    continue;
                }
                
                if (isLastAttempt) {
                    throw error;
                }
                
                await this.delay(this.retryDelay);
            }
        }
    }

    // Get stock price for a specific symbol with caching
    async getStockPrice(symbol) {
        // Clean expired cache entries
        this.cleanExpiredCache();
        
        // Check cache first
        const cacheKey = `price_${symbol}`;
        const cachedData = this.cache.get(cacheKey);
        
        if (cachedData && this.isCacheValid(cachedData.timestamp)) {
            return cachedData.data;
        }

        try {
            // Try Finnhub API with retry logic
            const stockData = await this.retryApiCall(async () => {
                const response = await axios.get(`${this.finnhubBaseUrl}/quote`, {
                    params: {
                        symbol: symbol,
                        token: this.finnhubApiKey
                    },
                    timeout: 10000
                });

                if (response.data && response.data.c !== 0) {
                    const data = response.data;
                    const currentPrice = data.c;

                    return {
                        symbol: symbol,
                        price: currentPrice
                    };
                } else {
                    throw new Error(`Invalid response data for ${symbol}`);
                }
            });

            // Cache the result
            this.cache.set(cacheKey, {
                data: stockData,
                timestamp: Date.now()
            });

            return stockData;
        } catch (error) {
            // Return cached data if available, even if expired
            if (cachedData) {
                return cachedData.data;
            }
            
            throw error;
        }
    }


    // Get multiple stock prices with rate limiting
    async getMultipleStockPrices(symbols) {
        const results = [];
        
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            
            try {
                const data = await this.getStockPrice(symbol);
                results.push({ success: true, data });
                
                // Add delay between requests to avoid rate limiting
                if (i < symbols.length - 1) {
                    await this.delay(this.rateLimitDelay);
                }
            } catch (error) {
                console.error(`Error fetching price for ${symbol}:`, error);
                results.push({ success: false, symbol, error: error.message });
            }
        }

        return results;
    }

    // 10 US companies symbols
    get10USSymbols() {
        return [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
            'META', 'NVDA', 'BRK-B', 'UNH', 'JNJ'
        ];
    }

    // 10 US companies data
    get10USCompanies() {
        return [
            { symbol: 'AAPL', name: 'Apple Inc.' },
            { symbol: 'MSFT', name: 'Microsoft Corporation' },
            { symbol: 'GOOGL', name: 'Alphabet Inc. Class A' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.' },
            { symbol: 'TSLA', name: 'Tesla Inc.' },
            { symbol: 'META', name: 'Meta Platforms Inc.' },
            { symbol: 'NVDA', name: 'NVIDIA Corporation' },
            { symbol: 'BRK-B', name: 'Berkshire Hathaway Inc. Class B' },
            { symbol: 'UNH', name: 'UnitedHealth Group Incorporated' },
            { symbol: 'JNJ', name: 'Johnson & Johnson' }
        ];
    }

    // Clean symbol for display (US stocks don't need cleaning)
    cleanSymbolForDisplay(symbol) {
        return symbol; // US stocks don't have suffixes like .NS
    }

    // Get company name
    getCompanyName(symbol) {
        const company = this.get10USCompanies().find(c => c.symbol === symbol);
        return company ? company.name : this.cleanSymbolForDisplay(symbol);
    }

    // Cache is disabled - data fetched directly from APIs (Finnhub for quotes, Yahoo for historical data)

    // Get last 15 days price data for a stock with smart caching
    async getLast15DaysData(symbol) {
        // Clear historical cache if date has changed
        this.clearHistoricalCacheIfNeeded();
        
        const cacheKey = `historical_${symbol}`;
        const cachedData = this.historicalCache.get(cacheKey);
        
        // Check if we have cached data and if we need to fetch new data
        if (cachedData && !this.shouldFetchNewHistoricalData()) {
            // Always update current price from Finnhub cache (overwrite Yahoo's current day price)
            try {
                const currentPriceData = await this.getStockPrice(symbol);
                if (currentPriceData && currentPriceData.price) {
                    // Update the cached data with fresh current price from Finnhub
                    const updatedData = {
                        ...cachedData,
                        currentPrice: currentPriceData.price,
                        gainLoss: currentPriceData.price - cachedData.firstPrice,
                        gainLossPercent: cachedData.firstPrice > 0 ? 
                            ((currentPriceData.price - cachedData.firstPrice) / cachedData.firstPrice) * 100 : 0,
                        isGain: (currentPriceData.price - cachedData.firstPrice) >= 0
                    };
                    
                    // Also update the last day's price in the priceData array with fresh Finnhub price
                    if (updatedData.priceData && updatedData.priceData.length > 0) {
                        const lastDayIndex = updatedData.priceData.length - 1;
                        updatedData.priceData[lastDayIndex] = {
                            ...updatedData.priceData[lastDayIndex],
                            price: currentPriceData.price,
                            high: Math.max(updatedData.priceData[lastDayIndex].high, currentPriceData.price),
                            low: Math.min(updatedData.priceData[lastDayIndex].low, currentPriceData.price)
                        };
                    }
                    
                    return updatedData;
                }
            } catch (error) {
                // Silent error handling
            }
            
            return cachedData;
        }

        // Fetch new historical data from Yahoo API
        try {
            const response = await this.retryApiCall(async () => {
                return await axios.get(`${this.yahooBaseUrl}/${symbol}`, {
                    params: {
                        interval: '1d',
                        range: '15d'
                    },
                    timeout: 15000
                });
            });

            if (response.data && response.data.chart && response.data.chart.result) {
                const result = response.data.chart.result[0];
                const meta = result.meta;
                const timestamps = result.timestamp;
                const quote = result.indicators.quote[0];
                
                // Process 15 days data - ensure exactly 15 days
                const allPriceData = timestamps.map((timestamp, index) => ({
                    date: new Date(timestamp * 1000).toISOString().split('T')[0],
                    timestamp: timestamp,
                    price: quote.close[index],
                    high: quote.high[index],
                    low: quote.low[index],
                    volume: quote.volume[index]
                })).filter(item => item.price !== null);
                
                // Take exactly the last 15 days
                const priceData = allPriceData.slice(-15);

                // Calculate gain/loss
                const firstPrice = priceData[0]?.price || 0;
                const lastPrice = meta.regularMarketPrice;
                const gainLoss = lastPrice - firstPrice;
                const gainLossPercent = firstPrice > 0 ? (gainLoss / firstPrice) * 100 : 0;

                const historicalData = {
                    symbol: symbol,
                    name: this.getCompanyName(symbol),
                    currentPrice: lastPrice,
                    firstPrice: firstPrice,
                    gainLoss: gainLoss,
                    gainLossPercent: gainLossPercent,
                    priceData: priceData,
                    isGain: gainLoss >= 0
                };

                // Cache the historical data
                this.historicalCache.set(cacheKey, historicalData);
                this.lastFetchDate = this.getCurrentDateString();

                return historicalData;
            } else {
                throw new Error(`Invalid response data for ${symbol} historical data`);
            }
        } catch (error) {
            // Return cached data if available, even if from previous day
            if (cachedData) {
                return cachedData;
            }
            
            throw new Error(`Unable to fetch historical data for ${symbol}`);
        }
    }
}

module.exports = new StockService();