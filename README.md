# Kafiza Website

A modern, multilingual landing page for Kafiza - connecting Brazilian coffee farmers with New Zealand roasters through data, transparency, and cultural storytelling.

## 🚀 Features

- **Multilingual Support**: English (EN) and Brazilian Portuguese (PT-BR)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Coffee-inspired color palette and clean typography
- **Email Capture**: Forms for newsletter signup and beta access
- **Contact Form**: Ready for backend integration

## 📁 Project Structure

```
├── components/          # React components
│   ├── Navbar.tsx      # Navigation with logo and language toggle
│   ├── Footer.tsx      # Footer with copyright
│   ├── EmailSignupForm.tsx  # Email capture form
│   ├── LanguageToggle.tsx   # Language switcher
│   └── LanguageContext.tsx  # Language state management
├── pages/              # Next.js pages
│   ├── index.tsx       # Home page
│   ├── about.tsx       # About page
│   ├── contact.tsx     # Contact page
│   ├── beta.tsx        # Beta signup page
│   └── _app.tsx        # App wrapper
├── i18n/               # Translation files
│   ├── en.json         # English translations
│   └── pt-BR.json      # Brazilian Portuguese translations
├── public/             # Static assets
│   ├── kafiza-logo.png # Logo (replace with actual image)
│   └── coffee-bg.jpg   # Background image (replace with actual image)
└── styles/             # Global styles
    └── globals.css     # Tailwind CSS and custom styles
```

## 🛠 Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kafiza-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your images**
   - Replace `public/kafiza-logo.png` with your actual logo
   - Replace `public/coffee-bg.jpg` with your background image

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Colors
- **Coffee Dark**: `#4B2E19` - Primary text and buttons
- **Coffee Brown**: `#7C4F2A` - Secondary text
- **Coffee Cream**: `#F5EFE6` - Background
- **Coffee Green**: `#3B5D3A` - Accent color

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

## 🌍 Multilingual Support

The website supports English and Brazilian Portuguese with:
- Language toggle in the navigation
- All text content translated
- Form placeholders and messages
- Success messages

## 📧 Email Integration

Currently, email forms show success messages but don't send data. To integrate:

### Option 1: Mailchimp
1. Get your Mailchimp API key
2. Install `@mailchimp/mailchimp_marketing`
3. Update `EmailSignupForm.tsx` with API calls

### Option 2: Backend API
1. Create API routes in `pages/api/`
2. Update forms to call your endpoints
3. Handle email storage and notifications

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
- Netlify
- AWS Amplify
- DigitalOcean App Platform

## ✅ COMPLETED

- [x] **Multilingual website** (EN/PT-BR) with language toggle
- [x] **Responsive design** with coffee-inspired color palette
- [x] **All pages**: Home, About, Contact, Beta
- [x] **Email capture forms** with validation and success messages
- [x] **Modern UI** with Tailwind CSS and Inter font
- [x] **SEO meta tags** for all pages (title, description, og:image)
- [x] **Form validation** with error handling
- [x] **Responsive navigation** with logo
- [x] **Deployment ready** with Vercel configuration

## 📝 TODO (Optional Enhancements)

- [ ] Integrate email forms with Mailchimp/backend
- [ ] Add analytics (Google Analytics, etc.)
- [ ] Add loading states
- [ ] Add more accessibility improvements
- [ ] Add more coffee-themed animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary to Kafiza. 