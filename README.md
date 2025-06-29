# FitTrack Pro - Bodybuilder's Ultimate Companion

A professional fitness tracking web application designed for serious bodybuilders to monitor workouts, track nutrition, and visualize progress.

## 🎓 Project Information

- **Author**: Fakhoury Elias Nassif
- **Institution**: Lebanese University - Faculty of Engineering
- **Course**: Full Stack Development
- **Instructor**: Eng. Elias Al Zaghrini
- **Due Date**: July 1, 2025

## 🚀 Features

### Core Features
- **Fitness Mode Selection**: Choose between Bulking, Maintenance, or Cutting modes
- **Progress Tracking**: Visualize your fitness journey with interactive charts and timeline
- **Nutrition Planning**: Calculate macros, search foods, and plan meals
- **Workout Management**: Access pre-built workouts or create custom programs
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Responsive Design**: Fully functional on desktop, tablet, and mobile devices

### Technical Features
- **ES6 Classes**: All JavaScript written using modern ES6+ syntax
- **API Integration**: Integrates with external APIs for quotes and nutrition data
- **Local Storage**: Persistent data storage for user preferences and progress
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized loading with lazy loading and caching strategies
- **PWA Ready**: Can be installed as a Progressive Web App

## 🛠️ Technologies Used

- **HTML5**: Semantic markup for better SEO and accessibility
- **CSS3**: Custom styling with CSS variables, flexbox, and grid
- **Bootstrap 5**: Responsive components and layout system
- **JavaScript (ES6)**: Modern JavaScript with classes and async/await
- **Chart.js**: Interactive data visualization
- **Font Awesome & Bootstrap Icons**: Rich icon library
- **API Integration**: 
  - Quotable API for motivational quotes
  - API Ninjas for exercise and nutrition data

## 📋 Custom Requirement

**Timeline Section using Flexbox**: As per the project requirements for student "Fakhoury Elias Nassif", a timeline-style section has been implemented using Flexbox on the Progress page. This timeline:
- Uses flexbox for layout and positioning
- Features alternating left/right content placement on desktop
- Includes smooth animations and hover effects
- Is fully responsive with a mobile-optimized layout
- Allows users to add custom milestones

## 🚦 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Web server for local development (e.g., Live Server extension for VS Code)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/electronassif/full-stack-dev.git
cd fittrack-pro
```

2. Open `index.html` in your web browser or serve with a local web server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server
```

3. Navigate to `http://localhost:8000` in your browser

### API Configuration

To enable full functionality, you'll need to add API keys:

1. Get free API keys from:
   - [API Ninjas](https://api-ninjas.com) for exercise and nutrition data

2. Update the API keys in the JavaScript files:
   - `js/app.js`: Line 396 (Exercise API)
   - `js/app.js`: Line 886 (Nutrition API)

## 📁 Project Structure

```
fittrack-pro/
├── index.html              # Home page with mode selection
├── progress.html           # Progress tracking and workouts
├── nutrition.html          # Nutrition planning and tracking
├── css/
│   └── style.css          # Main stylesheet with custom properties
├── js/
│   ├── app.js             # Main application logic
│   └── exerciseManager.js # Workout and exercise management
├── README.md              # Project documentation
└── package.json           # Project metadata
```

## 🎨 CSS Features

### Transitions (2+ required)
1. **Button Hover Effects**: Smooth color and transform transitions
2. **Card Hover Animations**: Scale and shadow transitions
3. **Navigation Link Underlines**: Animated underline effects
4. **Progress Bar Animations**: Smooth width transitions
5. **Modal Fade Effects**: Opacity and transform transitions

### 3D Transform Effect (Optional)
- **Mode Selection Cards**: 3D rotation effect on hover
- **Parallax Hero Section**: 3D depth effect on scroll

## 🔧 JavaScript Classes

### Main Classes
1. **FitnessTrackerApp**: Core application management
2. **NutritionPage**: Nutrition features and meal planning
3. **TimelineManager**: Timeline creation and management
4. **WorkoutPage**: Workout display and filtering
5. **WorkoutSession**: Active workout tracking
6. **ExerciseDatabase**: Exercise search and management
7. **WorkoutProgressTracker**: Personal records and statistics

## 🌐 API Integration

### Quotable API
- Endpoint: `https://api.quotable.io/quotes/random`
- Purpose: Daily motivational quotes
- Features: Caching, fallback quotes, error handling

### API Ninjas (Optional Enhancement)
- Exercise API: Exercise database and search
- Nutrition API: Food search and macro information
- Note: Requires API key for production use

## ♿ Accessibility Features

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Visible focus states
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Skip Links**: Quick navigation for screen reader users

## 🚀 Performance Optimizations

- **Lazy Loading**: Images and charts load on demand
- **Caching**: API responses cached to reduce requests
- **Minification Ready**: Code structured for easy minification
- **CDN Usage**: External libraries served from CDNs
- **Local Storage**: Efficient data persistence

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 
  - Mobile: < 576px
  - Tablet: 576px - 992px
  - Desktop: > 992px
- **Touch Friendly**: Large tap targets and swipe gestures
- **Flexible Images**: Responsive image sizing

## 🔐 Security Considerations

- **Input Validation**: All user inputs validated
- **XSS Prevention**: HTML escaping for user content
- **HTTPS Ready**: Prepared for secure hosting
- **No Sensitive Data**: No passwords or payment info stored

## 🧪 Testing

### Browser Compatibility
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

### Device Testing
- ✅ Desktop (1920x1080, 1366x768)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iPhone, Android phones)

## 📈 Future Enhancements

1. **Backend Integration**: Node.js/Express API
2. **Database**: MongoDB for data persistence
3. **User Authentication**: Login system
4. **Social Features**: Share workouts and progress
5. **Advanced Analytics**: Machine learning predictions
6. **Wearable Integration**: Fitness tracker sync

## 🤝 Contributing

This is an academic project, but suggestions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is submitted as part of academic coursework at Lebanese University.

## 🙏 Acknowledgments

- Lebanese University Faculty of Engineering
- Eng. Elias Al Zaghrini for course instruction
- Bootstrap and Chart.js communities
- API providers for free tier access

## 📞 Contact

**Fakhoury Elias Nassif**
- University: Lebanese University - Faculty of Engineering
- Project: Full Stack Development Course Project

---

*This project demonstrates proficiency in modern web development technologies and best practices as required for the Full Stack Development course.*