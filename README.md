# AgriMap PH 🌾🗺️

**Real-time, AI-enhanced, crowdsourced agriculture pricing and demand-supply mapping system for the Philippines**

AgriMap PH is a Next.js React web application that enables farmers, buyers, and regular users to contribute and access real-time agricultural pricing data across the Philippines. The platform uses crowdsourced data input, OpenStreetMap visualization, and basic AI recommendations to help users make informed decisions about where to buy or sell agricultural products.

## 🚀 Features

### 🧩 Core Features
- **Facebook OAuth Authentication**: Secure login with Facebook to ensure data quality
- **Daily Submission Limits**: One verified price entry per user per day to prevent spam
- **Crowdsourced Data Input**: Users can input agricultural product prices in their barangay
- **Real-time Sync**: Instant data synchronization using Firebase Realtime Database
- **Interactive Mapping**: OpenStreetMap integration with custom markers and overlays
- **User Type Selection**: Dedicated interfaces for Buyers, Farmers, and Regular Users
- **AI Recommendations**: Basic machine learning suggestions for optimal buying/selling locations

### 📱 User Experience
- **Secure Authentication**: Facebook OAuth for trusted user verification
- **User Profile Management**: Track submission history and daily limits
- **Mobile-First Design**: Responsive interface optimized for mobile devices
- **Auto-captured Data**: Automatic location, date/time, and weather data collection
- **Real-time Visualization**: Live heatmap overlays showing supply/demand patterns

### 🌐 Data Collection
- **Agricultural Products**: Comprehensive list of Philippine agricultural products
- **Location Data**: GPS coordinates with barangay-level precision
- **Market Conditions**: Traffic status, market conditions, and weather integration
- **Price Tracking**: Real-time price monitoring with historical data
- **User Verification**: All entries linked to authenticated users for accountability

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript and App Router
- **Authentication**: Firebase Auth with Facebook OAuth provider
- **Styling**: Tailwind CSS for responsive design
- **Mapping**: Leaflet.js with React-Leaflet for interactive maps
- **Backend**: Firebase Realtime Database for real-time data sync
- **Icons**: Lucide React for consistent iconography
- **Weather**: OpenWeatherMap API integration
- **Location**: HTML5 Geolocation API with reverse geocoding

## � Authentication & Security Features

- **Facebook OAuth Integration**: Secure login using Facebook accounts
- **Daily Submission Limits**: One price entry per user per day to ensure data quality
- **User Profile Management**: Track submission history and account details
- **Authenticated Data Submission**: All price entries linked to verified users
- **Real-time Auth State**: Seamless authentication state management across the app
- **Secure Database Rules**: Firebase security rules prevent unauthorized access
- **User Data Privacy**: Each user's submission history is private and secure

## �📦 Key Components

- **`AuthService`**: Handles Facebook OAuth and user session management
- **`AuthContext`**: React context for global authentication state
- **`Login`**: Facebook OAuth login component with error handling
- **`UserProfile`**: User account management and submission history
- **`MapView`**: OpenStreetMap with overlays and real-time markers
- **`InputForm`**: Authenticated user data entry for prices and market conditions
- **`UserTypeSelector`**: Role-based interface selection
- **`ProductSelector`**: Dropdown for Philippine agricultural products
- **`DataFetcher`**: Weather, location, and timestamp collection
- **`AIRecommender`**: Location suggestions based on user type and data
- **`HeatmapOverlay`**: Visual heat logic for supply/demand patterns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Realtime Database
- OpenWeatherMap API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agrimap-ph
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_weather_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Realtime Database
3. **Enable Authentication with Facebook** (see `FIREBASE_AUTH_SETUP.md` for detailed instructions)
4. Set up secure database rules for authenticated users:
   ```json
   {
     "rules": {
       "priceEntries": {
         ".read": true,
         ".write": "auth != null",
         "$entryId": {
           ".validate": "newData.hasChildren(['userId', 'userType', 'product', 'price', 'location', 'timestamp']) && newData.child('userId').val() == auth.uid"
         }
       },
       "users": {
         "$uid": {
           ".read": "auth != null && auth.uid == $uid",
           ".write": "auth != null && auth.uid == $uid"
         }
       },
       "userSubmissions": {
         "$uid": {
           ".read": "auth != null && auth.uid == $uid",
           ".write": "auth != null && auth.uid == $uid"
         }
       }
     }
   }
   ```
5. Get your Firebase configuration from Project Settings > General > Your apps

**⚠️ Important**: For authentication to work properly, you must complete the Facebook OAuth setup as described in `FIREBASE_AUTH_SETUP.md`

## 📊 Data Structure

### Price Entry Model
```typescript
interface PriceEntry {
  id: string;
  userType: 'buyer' | 'farmer' | 'regular';
  product: AgriculturalProduct;
  price: number;
  location: Location;
  trafficStatus: 'light' | 'moderate' | 'heavy';
  marketCondition: 'normal' | 'panic_buying' | 'overstocked' | 'high_demand' | 'low_supply';
  timestamp: Date;
  weather?: WeatherData;
  notes?: string;
}
```

### Agricultural Products
The app includes 60+ Philippine agricultural products across categories:
- Rice varieties (Regular, Premium, Well-milled, Special)
- Vegetables (Tomato, Onion, Garlic, Kangkong, etc.)
- Fruits (Banana varieties, Mango, Coconut, etc.)
- Livestock (Pork, Beef, Carabao, Goat)
- Poultry (Chicken, Duck, Eggs)
- Fish (Bangus, Tilapia, Galunggong, etc.)

## 🎯 User Types & Features

### 👥 Buyers
- View cheaper supply locations on the map
- Get AI recommendations for best buying locations
- Filter by product and location radius
- See real-time price comparisons

### 🚜 Farmers
- Identify areas with high demand and better prices
- Get suggestions on where to sell for maximum profit
- Track market conditions and competition
- Access weather data for planning

### 👤 Regular Users
- Contribute to community price database
- Access general market insights
- Help verify and validate price information
- Support data collection efforts

## 🤖 AI Recommendations

The AI system provides basic heuristic-based recommendations:

- **For Buyers**: Suggests locations with lowest prices within reasonable distance
- **For Farmers**: Recommends areas with highest prices and demand
- **Confidence Scoring**: Each recommendation includes confidence level and reasoning
- **Distance Optimization**: Considers travel distance vs. price benefits

## 📱 Mobile-First Design

- Responsive layout for all screen sizes
- Touch-optimized interface elements
- GPS location access for mobile users
- Offline-ready with cached map tiles
- Progressive Web App capabilities

## 🔮 Future Enhancements

### Phase 2 - Advanced AI
- Machine learning price prediction models
- Supply chain optimization algorithms
- Seasonal trend analysis
- Market volatility indicators

### Phase 3 - AgriChain PH Integration
- Supply chain management features
- Direct buyer-farmer connections
- Logistics optimization
- Payment integration

### Phase 4 - Enterprise Features
- Government dashboard for policy makers
- Bulk trading marketplace
- Quality certification tracking
- Export/import data integration

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines and submit pull requests for any improvements.

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write responsive, mobile-first code
- Test on multiple devices and browsers
- Follow Philippine agricultural terminology

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Philippine Agricultural Community**: For inspiring this project
- **OpenStreetMap**: For providing free mapping services
- **Firebase**: For real-time database infrastructure
- **Next.js Team**: For the excellent React framework
- **Filipino Developers**: For supporting agricultural technology

## 📞 Support

For support, feature requests, or bug reports, please create an issue on our GitHub repository or contact our development team.

---

**AgriMap PH** - Empowering Filipino agriculture through community-driven data and technology. 🇵🇭🌾
