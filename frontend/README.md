# AI Image Upscaler

A modern web application that enhances image quality using AI-powered upscaling technology. Built with Next.js and featuring a sleek, responsive interface with drag-and-drop functionality and real-time before/after comparisons.

## ✨ Features

- **AI-Powered Enhancement**: Advanced image upscaling using Real-ESRGAN technology
- **Multiple Scale Factors**: Choose between 2x, 4x, and 6x enhancement options
- **Drag & Drop Interface**: Intuitive file upload with visual feedback
- **Before/After Comparison**: Interactive slider to compare original and enhanced images
- **Real-time Processing**: Live progress tracking with smooth animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **File Format Support**: Supports JPEG, PNG, and WebP image formats
- **Download Results**: Easy one-click download of enhanced images

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **UI Components**: Radix UI, Lucide React
- **Image Processing**: HTML5 Canvas API, Sharp
- **Backend**: Next.js API Routes
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/ai-image-upscaler.git
   cd ai-image-upscaler
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Usage

1. **Upload an Image**: Drag and drop an image file or click to browse and select
2. **Choose Enhancement Level**: Select 2x, 4x, or 6x upscaling factor
3. **Process**: Click "Enhance Image" to start the AI processing
4. **Compare Results**: Use the interactive slider to compare before and after
5. **Download**: Save your enhanced image with the download button

### Supported File Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- Maximum file size: 10MB

## 🏗️ Project Structure

\`\`\`
ai-image-upscaler/
├── app/
│   ├── api/
│   │   └── enhance/
│   │       └── route.ts          # Image processing API endpoint
│   ├── globals.css               # Global styles and design tokens
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Main application page
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── animated-background.tsx  # Particle animation background
│   ├── image-comparison.tsx     # Before/after comparison slider
│   ├── image-uploader.tsx       # File upload and processing interface
│   └── page-transition.tsx      # Page transition animations
├── lib/
│   ├── image-processing.ts      # Client-side image processing utilities
│   └── utils.ts                 # Utility functions
├── public/
│   └── images/                  # Static image assets
└── README.md
\`\`\`

## 🔧 API Reference

### POST /api/enhance

Enhances an uploaded image using AI upscaling.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image`: Image file (JPEG, PNG, WebP)
  - `scaleFactor`: Enhancement level (2, 4, or 6)

**Response:**
\`\`\`json
{
  "success": true,
  "enhancedImage": "data:image/jpeg;base64,..."
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": "Error message"
}
\`\`\`

## 🎨 Design System

The application uses a carefully crafted design system with:

- **Primary Color**: Green (#15803d) for brand elements
- **Accent Colors**: Emerald tones for interactive elements
- **Neutrals**: Gray scale for backgrounds and text
- **Typography**: Inter font family for clean, modern text
- **Animations**: Framer Motion for smooth transitions and micro-interactions

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-image-upscaler)

### Environment Variables

No environment variables are required for the basic functionality. For production deployments, consider adding:

- `NODE_ENV=production`
- Custom API endpoints if using external image processing services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) for the AI upscaling technology
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/yourusername/ai-image-upscaler/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

---

Made with ❤️ using Next.js and AI technology
