import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata = {
  title: 'KisanDirect | Fresh Sprouts, Broccoli, Chhole & Hotel Wholesale Supply',
  description: 'Farm-fresh organic Matki sprouts, crisp Broccoli, Kabuli Chhole, and exotic veggies. 15-min express delivery for households and 5kg-50kg commercial crates with GST billing for hotels. Cash on Delivery.',
  keywords: 'matki sprouts, broccoli, chhole, pulses, wholesale produce, hotel vegetable supplier, zepto style app, zomato quick commerce'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <div className="app-viewport-wrapper">
              <div className="app-container">
                {children}
              </div>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
