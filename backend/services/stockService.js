const axios = require('axios');

class StockService {
    constructor() {
        this.yahooBaseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
        this.cache = new Map();
        this.cacheExpiry = 6000000; // 100 minute cache
        this.currentPage = 0; // For pagination
    }

    // Get 20 companies per page from 100 Indian companies
    async getTopCompanies(page = 0) {
        try {
            const allIndianSymbols = this.getTop100IndianSymbols();
            
            // Calculate pagination for 20 companies per page
            const companiesPerPage = 20;
            const startIndex = page * companiesPerPage;
            const endIndex = startIndex + companiesPerPage;
            
            // Slice the array to get correct page data
            const symbolsToFetch = allIndianSymbols.slice(startIndex, endIndex);
            
            console.log(`Fetching page ${page + 1}: companies ${startIndex + 1}-${Math.min(endIndex, allIndianSymbols.length)}`);
            
            const stockData = await this.getMultipleStockPrices(symbolsToFetch);
            
            return stockData
                .filter(stock => stock.success && stock.data)
                .map(stock => ({
                    symbol: this.cleanSymbolForDisplay(stock.data.symbol),
                    name: this.getCompanyName(stock.data.symbol),
                    price: stock.data.price,
                    currency: '₹'
                }));
        } catch (error) {
            console.error('Error fetching top companies:', error);
            return this.getMockTopCompanies();
        }
    }

    // Helper method to get total pages
    getTotalPages() {
        return Math.ceil(this.getTop100IndianSymbols().length / 20); // 5 pages
    }


    // Search among all 100 Indian companies
    async searchCompanies(query) {
        try {
            if (!query || query.length < 1) {
                return [];
            }

            const searchResults = this.searchIndianCompanies(query);
            if (searchResults.length === 0) return [];

            const symbols = searchResults.map(company => company.symbol).slice(0, 20);
            const stockData = await this.getMultipleStockPrices(symbols);
            
            return stockData
                .filter(stock => stock.success && stock.data)
                .map(stock => ({
                    symbol: this.cleanSymbolForDisplay(stock.data.symbol),
                    name: this.getCompanyName(stock.data.symbol),
                    price: stock.data.price,
                    currency: '₹' // Always Indian Rupee
                }));
        } catch (error) {
            console.error('Error searching companies:', error);
            return [];
        }
    }

    // Fetch stock price (Yahoo Finance API)
    async getStockPrice(symbol) {
        try {
            const cacheKey = symbol;
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            }

            const response = await axios.get(`${this.yahooBaseUrl}/${symbol}`, {
                timeout: 8000
            });
            
            if (response.data.chart && response.data.chart.result && response.data.chart.result[0]) {
                const result = response.data.chart.result[0];
                const meta = result.meta;
                
                const stockData = {
                    symbol: meta.symbol,
                    price: parseFloat(meta.regularMarketPrice?.toFixed(2) || 0)
                };

                this.cache.set(cacheKey, {
                    data: stockData,
                    timestamp: Date.now()
                });

                return stockData;
            } else {
                throw new Error('No data found');
            }
        } catch (error) {
            console.error(`Yahoo Finance error for ${symbol}:`, error.message);
            throw new Error(`Unable to fetch price for ${symbol}`);
        }
    }

    async getMultipleStockPrices(symbols) {
        const promises = symbols.map(symbol => 
            this.getStockPrice(symbol).then(
                data => ({ symbol, success: true, data }),
                error => ({ symbol, success: false, error: error.message })
            )
        );
        
        return await Promise.all(promises);
    }

    // Top 100 Indian companies by market cap
    getTop100IndianSymbols() {
        return [
            // Top 50 Indian Companies
            'RELIANCE.NS', 'HDFCBANK.NS', 'TCS.NS', 'BHARTIARTL.NS', 'ICICIBANK.NS',
            'SBIN.NS', 'BAJFINANCE.NS', 'INFY.NS', 'HINDUNILVR.NS', 'LT.NS',
            'ITC.NS', 'WIPRO.NS', 'MARUTI.NS', 'AXISBANK.NS', 'ASIANPAINT.NS',
            'HCLTECH.NS', 'SUNPHARMA.NS', 'ULTRACEMCO.NS', 'KOTAKBANK.NS', 'NESTLEIND.NS',
            'TITAN.NS', 'NTPC.NS', 'ONGC.NS', 'TECHM.NS', 'POWERGRID.NS',
            'M&M.NS', 'BAJAJFINSV.NS', 'JSWSTEEL.NS', 'HINDALCO.NS', 'DIVISLAB.NS',
            'INDUSINDBK.NS', 'COALINDIA.NS', 'DRREDDY.NS', 'TATAMOTORS.NS', 'CIPLA.NS',
            'BRITANNIA.NS', 'EICHERMOT.NS', 'GRASIM.NS', 'BPCL.NS', 'APOLLOHOSP.NS',
            'HEROMOTOCO.NS', 'ADANIENT.NS', 'ADANIPORTS.NS', 'UPL.NS', 'SBILIFE.NS',
            'HDFCLIFE.NS', 'TATACONSUM.NS', 'BAJAJ-AUTO.NS', 'SHREECEM.NS', 'IOC.NS',

            // Next 50 Indian Companies (51-100)
            'PIDILITIND.NS', 'GODREJCP.NS', 'MARICO.NS', 'DABUR.NS', 'COLPAL.NS',
            'BERGEPAINT.NS', 'HAVELLS.NS', 'VOLTAS.NS', 'CUMMINSIND.NS', 'SIEMENS.NS',
            'ABB.NS', 'BOSCHLTD.NS', '3MINDIA.NS', 'HONAUT.NS', 'ABBOTINDIA.NS',
            'GLAXO.NS', 'PFIZER.NS', 'CADILAHC.NS', 'LUPIN.NS', 'BIOCON.NS',
            'TORNTPHARM.NS', 'AUROPHARMA.NS', 'ALKEM.NS', 'ZYDUSLIFE.NS', 'GLENMARK.NS',
            'JINDALSTEL.NS', 'TATASTEEL.NS', 'SAIL.NS', 'NMDC.NS', 'VEDL.NS',
            'NATIONALUM.NS', 'HINDZINC.NS', 'RATNAMANI.NS', 'WELCORP.NS', 'ADANIGREEN.NS',
            'TATAPOWER.NS', 'PFC.NS', 'RECLTD.NS', 'NTPC.NS', 'IRCTC.NS',
            'CONCOR.NS', 'INDIANB.NS', 'PNB.NS', 'CANBK.NS', 'BANKBARODA.NS',
            'FEDERALBNK.NS', 'IDFCFIRSTB.NS', 'RBLBANK.NS', 'BANDHANBNK.NS', 'IDEA.NS'
        ];
    }

    // Search in Indian companies database
    searchIndianCompanies(query) {
        const allCompanies = this.getAllIndianCompanies();
        return allCompanies.filter(company => 
            company.symbol.toLowerCase().includes(query.toLowerCase()) ||
            company.name.toLowerCase().includes(query.toLowerCase()) ||
            company.searchTerms.some(term => 
                term.toLowerCase().includes(query.toLowerCase())
            )
        );
    }

    // All 100 Indian companies for search
    getAllIndianCompanies() {
        return [
            // Top companies
            { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', searchTerms: ['reliance', 'ril', 'oil', 'petrochemicals'] },
            { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', searchTerms: ['hdfc', 'bank', 'banking'] },
            { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd.', searchTerms: ['tcs', 'tata', 'consultancy', 'it'] },
            { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd.', searchTerms: ['airtel', 'bharti', 'telecom'] },
            { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.', searchTerms: ['icici', 'bank', 'banking'] },
            { symbol: 'SBIN.NS', name: 'State Bank of India', searchTerms: ['sbi', 'state bank', 'bank'] },
            { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd.', searchTerms: ['bajaj', 'finance'] },
            { symbol: 'INFY.NS', name: 'Infosys Ltd.', searchTerms: ['infosys', 'it', 'software'] },
            { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd.', searchTerms: ['hul', 'unilever', 'fmcg'] },
            { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd.', searchTerms: ['lt', 'larsen', 'toubro', 'engineering'] },
            { symbol: 'ITC.NS', name: 'ITC Ltd.', searchTerms: ['itc', 'tobacco', 'fmcg'] },
            { symbol: 'WIPRO.NS', name: 'Wipro Ltd.', searchTerms: ['wipro', 'it', 'software'] },
            { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd.', searchTerms: ['maruti', 'suzuki', 'car'] },
            { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd.', searchTerms: ['axis', 'bank'] },
            { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd.', searchTerms: ['asian', 'paint'] },
            { symbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd.', searchTerms: ['hcl', 'tech', 'it'] },
            { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries Ltd.', searchTerms: ['sun', 'pharma'] },
            { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd.', searchTerms: ['ultratech', 'cement'] },
            { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd.', searchTerms: ['kotak', 'bank'] },
            { symbol: 'NESTLEIND.NS', name: 'Nestle India Ltd.', searchTerms: ['nestle', 'fmcg'] },
            { symbol: 'TITAN.NS', name: 'Titan Company Ltd.', searchTerms: ['titan', 'jewelry', 'watch'] },
            { symbol: 'NTPC.NS', name: 'NTPC Ltd.', searchTerms: ['ntpc', 'power'] },
            { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corporation Ltd.', searchTerms: ['ongc', 'oil', 'gas'] },
            { symbol: 'TECHM.NS', name: 'Tech Mahindra Ltd.', searchTerms: ['tech mahindra', 'it'] },
            { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation of India Ltd.', searchTerms: ['powergrid', 'power'] },
            { symbol: 'M&M.NS', name: 'Mahindra & Mahindra Ltd.', searchTerms: ['mahindra', 'car', 'tractor'] },
            { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd.', searchTerms: ['bajaj', 'finserv'] },
            { symbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd.', searchTerms: ['jsw', 'steel'] },
            { symbol: 'HINDALCO.NS', name: 'Hindalco Industries Ltd.', searchTerms: ['hindalco', 'aluminium'] },
            { symbol: 'DIVISLAB.NS', name: 'Divi\'s Laboratories Ltd.', searchTerms: ['divis', 'pharma'] },
            { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank Ltd.', searchTerms: ['indusind', 'bank'] },
            { symbol: 'COALINDIA.NS', name: 'Coal India Ltd.', searchTerms: ['coal', 'india'] },
            { symbol: 'DRREDDY.NS', name: 'Dr. Reddy\'s Laboratories Ltd.', searchTerms: ['reddy', 'pharma'] },
            { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd.', searchTerms: ['tata', 'motors', 'car'] },
            { symbol: 'CIPLA.NS', name: 'Cipla Ltd.', searchTerms: ['cipla', 'pharma'] },
            { symbol: 'BRITANNIA.NS', name: 'Britannia Industries Ltd.', searchTerms: ['britannia', 'biscuit', 'fmcg'] },
            { symbol: 'EICHERMOT.NS', name: 'Eicher Motors Ltd.', searchTerms: ['eicher', 'royal enfield'] },
            { symbol: 'GRASIM.NS', name: 'Grasim Industries Ltd.', searchTerms: ['grasim', 'cement'] },
            { symbol: 'BPCL.NS', name: 'Bharat Petroleum Corporation Ltd.', searchTerms: ['bpcl', 'petroleum'] },
            { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise Ltd.', searchTerms: ['apollo', 'hospital'] },
            { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd.', searchTerms: ['hero', 'motocorp', 'bike'] },
            { symbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd.', searchTerms: ['adani', 'enterprise'] },
            { symbol: 'ADANIPORTS.NS', name: 'Adani Ports and Special Economic Zone Ltd.', searchTerms: ['adani', 'ports'] },
            { symbol: 'UPL.NS', name: 'UPL Ltd.', searchTerms: ['upl', 'agrochemicals'] },
            { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance Company Ltd.', searchTerms: ['sbi', 'life', 'insurance'] },
            { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance Company Ltd.', searchTerms: ['hdfc', 'life', 'insurance'] },
            { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products Ltd.', searchTerms: ['tata', 'consumer'] },
            { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto Ltd.', searchTerms: ['bajaj', 'auto', 'bike'] },
            { symbol: 'SHREECEM.NS', name: 'Shree Cement Ltd.', searchTerms: ['shree', 'cement'] },
            { symbol: 'IOC.NS', name: 'Indian Oil Corporation Ltd.', searchTerms: ['ioc', 'oil'] },

            // Additional companies (51-100)
            { symbol: 'PIDILITIND.NS', name: 'Pidilite Industries Ltd.', searchTerms: ['pidilite', 'adhesive'] },
            { symbol: 'GODREJCP.NS', name: 'Godrej Consumer Products Ltd.', searchTerms: ['godrej', 'consumer'] },
            { symbol: 'MARICO.NS', name: 'Marico Ltd.', searchTerms: ['marico', 'fmcg'] },
            { symbol: 'DABUR.NS', name: 'Dabur India Ltd.', searchTerms: ['dabur', 'ayurveda'] },
            { symbol: 'COLPAL.NS', name: 'Colgate Palmolive (India) Ltd.', searchTerms: ['colgate', 'toothpaste'] },
            { symbol: 'BERGEPAINT.NS', name: 'Berger Paints India Ltd.', searchTerms: ['berger', 'paint'] },
            { symbol: 'HAVELLS.NS', name: 'Havells India Ltd.', searchTerms: ['havells', 'electrical'] },
            { symbol: 'VOLTAS.NS', name: 'Voltas Ltd.', searchTerms: ['voltas', 'ac'] },
            { symbol: 'CUMMINSIND.NS', name: 'Cummins India Ltd.', searchTerms: ['cummins'] },
            { symbol: 'SIEMENS.NS', name: 'Siemens Ltd.', searchTerms: ['siemens'] },
            { symbol: 'ABB.NS', name: 'ABB India Ltd.', searchTerms: ['abb'] },
            { symbol: 'BOSCHLTD.NS', name: 'Bosch Ltd.', searchTerms: ['bosch'] },
            { symbol: '3MINDIA.NS', name: '3M India Ltd.', searchTerms: ['3m'] },
            { symbol: 'HONAUT.NS', name: 'Honeywell Automation India Ltd.', searchTerms: ['honeywell'] },
            { symbol: 'ABBOTINDIA.NS', name: 'Abbott India Ltd.', searchTerms: ['abbott'] },
            { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd.', searchTerms: ['tata', 'steel'] },
            { symbol: 'JINDALSTEL.NS', name: 'Jindal Steel & Power Ltd.', searchTerms: ['jindal', 'steel'] },
            { symbol: 'SAIL.NS', name: 'Steel Authority of India Ltd.', searchTerms: ['sail', 'steel'] },
            { symbol: 'NMDC.NS', name: 'NMDC Ltd.', searchTerms: ['nmdc', 'mining'] },
            { symbol: 'VEDL.NS', name: 'Vedanta Ltd.', searchTerms: ['vedanta', 'mining'] },
            { symbol: 'IRCTC.NS', name: 'Indian Railway Catering and Tourism Corporation Ltd.', searchTerms: ['irctc', 'railway'] }
        ];
    }

    // Enhanced company name mapping for 100 companies
    getCompanyName(symbol) {
        const names = {
            'RELIANCE.NS': 'Reliance Industries Ltd.',
            'HDFCBANK.NS': 'HDFC Bank Ltd.',
            'TCS.NS': 'Tata Consultancy Services Ltd.',
            'BHARTIARTL.NS': 'Bharti Airtel Ltd.',
            'ICICIBANK.NS': 'ICICI Bank Ltd.',
            'SBIN.NS': 'State Bank of India',
            'BAJFINANCE.NS': 'Bajaj Finance Ltd.',
            'INFY.NS': 'Infosys Ltd.',
            'HINDUNILVR.NS': 'Hindustan Unilever Ltd.',
            'LT.NS': 'Larsen & Toubro Ltd.',
            'ITC.NS': 'ITC Ltd.',
            'WIPRO.NS': 'Wipro Ltd.',
            'MARUTI.NS': 'Maruti Suzuki India Ltd.',
            'AXISBANK.NS': 'Axis Bank Ltd.',
            'ASIANPAINT.NS': 'Asian Paints Ltd.',
            'HCLTECH.NS': 'HCL Technologies Ltd.',
            'SUNPHARMA.NS': 'Sun Pharmaceutical Industries Ltd.',
            'ULTRACEMCO.NS': 'UltraTech Cement Ltd.',
            'KOTAKBANK.NS': 'Kotak Mahindra Bank Ltd.',
            'NESTLEIND.NS': 'Nestle India Ltd.',
            'TITAN.NS': 'Titan Company Ltd.',
            'NTPC.NS': 'NTPC Ltd.',
            'ONGC.NS': 'Oil & Natural Gas Corporation Ltd.',
            'TECHM.NS': 'Tech Mahindra Ltd.',
            'POWERGRID.NS': 'Power Grid Corporation of India Ltd.',
            'M&M.NS': 'Mahindra & Mahindra Ltd.',
            'BAJAJFINSV.NS': 'Bajaj Finserv Ltd.',
            'JSWSTEEL.NS': 'JSW Steel Ltd.',
            'HINDALCO.NS': 'Hindalco Industries Ltd.',
            'DIVISLAB.NS': 'Divi\'s Laboratories Ltd.',
            'INDUSINDBK.NS': 'IndusInd Bank Ltd.',
            'COALINDIA.NS': 'Coal India Ltd.',
            'DRREDDY.NS': 'Dr. Reddy\'s Laboratories Ltd.',
            'TATAMOTORS.NS': 'Tata Motors Ltd.',
            'CIPLA.NS': 'Cipla Ltd.',
            'BRITANNIA.NS': 'Britannia Industries Ltd.',
            'EICHERMOT.NS': 'Eicher Motors Ltd.',
            'GRASIM.NS': 'Grasim Industries Ltd.',
            'BPCL.NS': 'Bharat Petroleum Corporation Ltd.',
            'APOLLOHOSP.NS': 'Apollo Hospitals Enterprise Ltd.',
            'HEROMOTOCO.NS': 'Hero MotoCorp Ltd.',
            'ADANIENT.NS': 'Adani Enterprises Ltd.',
            'ADANIPORTS.NS': 'Adani Ports and Special Economic Zone Ltd.',
            'UPL.NS': 'UPL Ltd.',
            'SBILIFE.NS': 'SBI Life Insurance Company Ltd.',
            'HDFCLIFE.NS': 'HDFC Life Insurance Company Ltd.',
            'TATACONSUM.NS': 'Tata Consumer Products Ltd.',
            'BAJAJ-AUTO.NS': 'Bajaj Auto Ltd.',
            'SHREECEM.NS': 'Shree Cement Ltd.',
            'IOC.NS': 'Indian Oil Corporation Ltd.',
            'PIDILITIND.NS': 'Pidilite Industries Ltd.',
            'GODREJCP.NS': 'Godrej Consumer Products Ltd.',
            'MARICO.NS': 'Marico Ltd.',
            'DABUR.NS': 'Dabur India Ltd.',
            'COLPAL.NS': 'Colgate Palmolive (India) Ltd.',
            'BERGEPAINT.NS': 'Berger Paints India Ltd.',
            'HAVELLS.NS': 'Havells India Ltd.',
            'VOLTAS.NS': 'Voltas Ltd.',
            'CUMMINSIND.NS': 'Cummins India Ltd.',
            'SIEMENS.NS': 'Siemens Ltd.',
            'ABB.NS': 'ABB India Ltd.',
            'BOSCHLTD.NS': 'Bosch Ltd.',
            '3MINDIA.NS': '3M India Ltd.',
            'HONAUT.NS': 'Honeywell Automation India Ltd.',
            'ABBOTINDIA.NS': 'Abbott India Ltd.',
            'TATASTEEL.NS': 'Tata Steel Ltd.',
            'JINDALSTEL.NS': 'Jindal Steel & Power Ltd.',
            'SAIL.NS': 'Steel Authority of India Ltd.',
            'NMDC.NS': 'NMDC Ltd.',
            'VEDL.NS': 'Vedanta Ltd.',
            'IRCTC.NS': 'Indian Railway Catering and Tourism Corporation Ltd.'
        };
        return names[symbol] || this.cleanSymbolForDisplay(symbol);
    }

    // Clean symbol for display (remove .NS)
    cleanSymbolForDisplay(symbol) {
        return symbol.replace('.NS', '');
    }

    // Pagination helper methods
    getNextPage() {
        return this.getTopCompanies(1);
    }

    getPreviousPage() {
        return this.getTopCompanies(0);
    }

    getMockTopCompanies() {
        return [
            { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 1405.30, currency: '₹' },
            { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 966.95, currency: '₹' },
            { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', price: 3145.45, currency: '₹' },
            { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1939.85, currency: '₹' },
            { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1421.75, currency: '₹' }
        ];
    }
}

module.exports = new StockService();
