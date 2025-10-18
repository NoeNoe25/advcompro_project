'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const content = {
  header: {
    logoText: 'Lan Pya',
    nav: [
      { label: 'Home', href: '/', active: true },
      { label: 'Destination', href: '/destinations' },
    ],
    actions: [
      { label: 'Login', href: '/login', variant: 'ghost' },
      { label: 'Sign Up', href: '/register', variant: 'primary' },
    ],
  },
  hero: {
    title: 'BEYOND BAGAN',
    subtitle: 'Discover the timeless beauty, culture, and adventures of Myanmar.',
    imageUrl: 'https://scontent.fbkk6-2.fna.fbcdn.net/v/t1.6435-9/190452600_1675317219320112_3093987047535977559_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=4N3UK9H8h-wQ7kNvwGwjyyl&_nc_oc=AdmQb8qmbshTP7eHp2FuEChNkCBFI7gxK2XAUzK2nKwcE_a7OhusCZp14JA6ivPAZB0&_nc_zt=23&_nc_ht=scontent.fbkk6-2.fna&_nc_gid=atMivHElxqIf7aJw4iVCKg&oh=00_Afc71PJxzXDw5BEOSB1AFvnT-bhme9xshAnEJMwESmZNTQ&oe=691A2B3E',
  },
  recommendations: {
    heading: 'Recommend for You',
    subheading: 'Handpicked journeys and travel stories to inspire your next adventure.',
    items: [
      { 
        id: 'rec-1', 
        title: 'Yangon', 
        imageUrl: 'https://media.istockphoto.com/id/495803600/photo/yangon-myanmar-at-shwedagon-pagoda.jpg?s=612x612&w=0&k=20&c=KKdLb8guJJXuiVtFZsEXI8P61IS8dfxgEwNgbFCMN48=',
        location: { lat: 16.8409, lng: 96.1735, label: "Yangon, Myanmar" }
      },
      { 
        id: 'rec-2', 
        title: 'Inle Lake', 
        imageUrl: 'https://burmatravel.com/wp-content/uploads/2025/01/inle-lakel.jpg',
        location: { lat: 20.5592, lng: 96.9132, label: "Inle Lake, Myanmar"  }
      },
      { 
        id: 'rec-3', 
        title: 'Mawlamyine', 
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4uJBHtB1cPcXWjPtSfwNPXf2r2T7TIvA1CBeks9BWrbRkA3dukGv5fGkE&s=10',
        location: {  lat: 16.4543, lng: 97.6440, label: "Mawlamyine, Myanmar"}
      },
      { 
        id: 'rec-4', 
        title: 'Mandalay', 
        imageUrl: 'https://static.saltinourhair.com/wp-content/uploads/2018/03/23155836/Things-to-do-Mandalay-Myanmar-Hsinbyume-Pagoda.jpg',
        location: {lat: 21.9588, lng: 96.0891, label: "Mandalay, Myanmar"}
      },
    ],
  },
  
};

export default function Page() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLike = (e, cardId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Liked:', cardId);
    // Add your like logic here
  };

  const handleBookmark = (e, cardId) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Bookmarked:', cardId);
    // Add your bookmark logic here
  };

  return (
    <div className="page">

      <main>
        <section className="hero">
          <img className="hero-bg" src={content.hero.imageUrl} alt="Myanmar landscape" />
          <div className="overlay" />
          <div className="white-overlay" />
          <div className="container hero-content">
            <h1>{content.hero.title}</h1>
            <p>{content.hero.subtitle}</p>
          </div>
        </section>

        <section className="recommend">
          <div className="container">
            <h2>{content.recommendations.heading}</h2>
            <p className="sub">{content.recommendations.subheading}</p>

            <div className="cards">
              {content.recommendations.items.map((card) => (
                <Link
                  key={card.id}
                  href={{
                    pathname: '/test-map',
                    query: {
                      lat: card.location.lat,
                      lng: card.location.lng,
                      label: card.location.label
                    }
                  }}
                  passHref
                  legacyBehavior
                >
                  <article className="card">
                    <img src={card.imageUrl} alt={card.title} />
                    <div className="card-grad" />
                    <div className="card-info">
                      <h3>{card.title}</h3>
                      <div className="card-actions">
                        <button 
                          onClick={(e) => handleLike(e, card.id)}
                          aria-label="Like"
                        >
                          ♡
                        </button>
                        
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            
          </div>
        </section>
      </main>

      
      <style jsx>{`
        :root {
          --container: 1200px;
          --primary: #d4af37; /* Gold color */
          --primary-dark: #b8941f;
          --secondary: #f4b967;
          --text: #0f172a;
          --muted: #6b7280;
          --surface: #f5f7fa;
          --radius: 16px;
          --shadow: 0 10px 30px rgba(0,0,0,0.12);
        }
        
        .container { 
          max-width: var(--container); 
          margin: 0 auto; 
          padding: 0 24px; 
        }

        
        .logo { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          font-weight: 700; 
          color: var(--text); 
          font-size: 1.25rem;
          text-decoration: none;
        }
        
        .logo.dark { color: var(--footer-text); }
        .logo-mark { color: var(--primary); }
        
        .nav { 
          display: flex; 
          gap: 18px; 
          margin-left: 8px; 
        }
        
        .nav a { 
          color: #374151; 
          text-decoration: none; 
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        .nav a:hover { 
          background: rgba(0,0,0,0.05);
        }
        
        .nav a.active { 
          color: var(--primary); 
          font-weight: 600; 
          background: rgba(212, 175, 55, 0.1);
        }
        
        .actions { 
          margin-left: auto; 
          display: flex; 
          gap: 10px; 
        }
        
        .btn { 
          border-radius: 999px; 
          padding: 10px 16px; 
          text-decoration: none; 
          font-weight: 600; 
          border: 1px solid transparent; 
          font-size: 0.875rem;
          transition: all 0.2s ease;
          display: inline-block;
          text-align: center;
          cursor: pointer;
        }
        
        .btn.ghost { 
          background: #fff; 
          border-color: #e5e7eb; 
          color: #111827; 
        }
        
        .btn.ghost:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
        
        .btn.primary { 
          background: var(--primary); 
          color: #1f2937; 
          border: none;
        }
        
        .btn.primary:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }
        
        .btn.link { 
          background: rgba(212, 175, 55, 0.1); 
          color: var(--primary-dark); 
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
        
        .btn.link:hover {
          background: rgba(212, 175, 55, 0.2);
          transform: translateY(-1px);
        }

        /* Mobile Menu */
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 8px;
          margin-left: auto;
        }
        
        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          border-top: 1px solid #e5e7eb;
          padding: 20px 24px;
        }
        
        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .mobile-nav a {
          color: #374151;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .mobile-nav a.active {
          color: var(--primary);
          background: rgba(212, 175, 55, 0.1);
          font-weight: 600;
        }
        
        .mobile-nav a:hover {
          background: rgba(0,0,0,0.05);
        }
        
        .mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hero { 
          position: relative; 
          height: 85vh; /* Larger banner height */
          min-height: 700px;
          max-height: 900px;
          overflow: hidden; 
          display: flex;
          align-items: center;
        }
        
        .hero-bg { 
          position: absolute; 
          inset: 0; 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
        }
        
        .overlay { 
          position: absolute; 
          inset: 0; 
          background: rgba(0,0,0,0.4); 
        }
        
        .white-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.2); /* White 20% opacity overlay */
          mix-blend-mode: overlay;
        }
        
        .hero-content { 
          position: relative; 
          z-index: 2;
          width: 100%;
        }
        
        .hero h1 { 
          color: #fff; 
          font-size: 6rem; 
          line-height: 0.95; 
          letter-spacing: 2px; 
          max-width: 12ch; 
          margin: 0;
          text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
          font-weight: 800;
        }
        
        .hero p { 
          color: #fff; 
          font-size: 1.5rem; 
          font-weight: 300;
          margin-top: 1.5rem; 
          max-width: 46ch; 
          text-shadow: 1px 1px 4px rgba(0,0,0,0.7);
          line-height: 1.4;
        }

        .recommend { 
          background: #fff; 
          padding: 5rem 0; 
        }
        
        .recommend .container { 
          text-align: center; 
        }
        
        .recommend h2 { 
          color: var(--text); 
          font-size: 2.5rem; 
          margin-bottom: 1rem; 
          font-weight: 700;
        }
        
        .recommend .sub { 
          color: var(--muted); 
          margin: 0 auto 3rem; 
          max-width: 70ch; 
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .cards { 
          display: grid; 
          grid-template-columns: repeat(4, minmax(0, 1fr)); 
          gap: 2rem; 
        }
        
        .card { 
          position: relative; 
          border-radius: 1rem; 
          overflow: hidden; 
          box-shadow: var(--shadow); 
          aspect-ratio: 3 / 4; 
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }
        
        .card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .card img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          display: block; 
        }
        
        .card-grad { 
          position: absolute; 
          inset: 0; 
          background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%); 
        }
        
        .card-info { 
          position: absolute; 
          inset: auto 0 1.5rem 0; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          padding: 0 1.5rem; 
        }
        
        .card h3 { 
          color: #fff; 
          font-size: 1.25rem; 
          margin: 0; 
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
          font-weight: 600;
        }
        
        .card-actions { 
          display: flex; 
          gap: 0.5rem; 
        }
        
        .card-actions button { 
          background: rgba(255,255,255,0.9); 
          border: none; 
          border-radius: 50%; 
          width: 2.5rem;
          height: 2.5rem;
          cursor: pointer; 
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
        
        .card-actions button:hover {
          background: white;
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .more { 
          margin-top: 3rem; 
          display: flex; 
          justify-content: center; 
        }

       
        
        .brand p { 
          margin: 1rem 0 1.5rem; 
          color: #bfc5cf; 
          line-height: 1.6;
          font-size: 1.1rem;
          max-width: 300px;
        }
        
        .social { 
          display: flex; 
          gap: 1rem; 
        }
        
        .social a {
          font-size: 1.5rem;
          transition: all 0.3s ease;
          display: inline-block;
        }
        
        .social a:hover {
          transform: translateY(-3px);
          color: var(--primary);
        }
        
        .links { 
          display: flex; 
          flex-direction: column; 
          gap: 0.75rem; 
        }
        
        .links h4 { 
          margin: 0 0 1rem; 
          color: #ffffff; 
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .links a { 
          color: var(--footer-text); 
          text-decoration: none; 
          transition: all 0.2s ease;
          padding: 0.25rem 0;
        }
        
        .links a:hover {
          color: var(--primary);
          transform: translateX(5px);
        }
        
        .newsletter h4 {
          margin: 0 0 0.5rem;
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .newsletter p {
          color: #bfc5cf;
          margin: 0 0 1.5rem;
          line-height: 1.5;
        }
        
        .newsletter-form {
          display: flex;
          gap: 0.5rem;
          flex-direction: column;
        }
        
        .newsletter-form input {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #374151;
          background: #2d2d2d;
          color: white;
          font-size: 0.9rem;
        }
        
        .newsletter-form input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
        }
        
        .newsletter-form .btn {
          width: 100%;
        }
        
        .legal { 
          margin-top: 3rem; 
          padding: 1.5rem 0; 
          text-align: center; 
          border-top: 1px solid rgba(255,255,255,0.1); 
          color: #9ca3af; 
          font-size: 0.9rem; 
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hero h1 { font-size: 4rem; }
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
          .brand { grid-column: 1 / -1; }
          .newsletter { grid-column: 1 / -1; }
        }
        
        @media (max-width: 768px) {
          .header-inner { height: 64px; gap: 16px; }
          .nav { display: none; }
          .actions { display: none; }
          .mobile-menu-btn { display: block; }
          .mobile-menu { display: block; }
          
          .hero { 
            height: 70vh; 
            min-height: 500px;
          }
          .hero h1 { 
            font-size: 3rem; 
            max-width: 100%; 
            text-align: center; 
          }
          .hero p { 
            text-align: center; 
            max-width: 100%; 
            padding: 0 1rem; 
            font-size: 1.25rem;
          }
          .hero-content { 
            align-items: center; 
            text-align: center; 
          }
          
          .cards { 
            grid-template-columns: 1fr; 
            max-width: 400px; 
            margin: 0 auto; 
          }
          
          .footer-grid { 
            grid-template-columns: 1fr; 
            gap: 2rem; 
            text-align: center;
          }
          
          .social {
            justify-content: center;
          }
          
          .newsletter-form {
            max-width: 400px;
            margin: 0 auto;
          }
        }
        
        @media (max-width: 640px) {
          .hero { 
            height: 60vh;
            min-height: 400px;
          }
          .hero h1 { font-size: 2.5rem; }
          .hero p { font-size: 1.1rem; }
          
          .recommend { padding: 3rem 0; }
          .recommend h2 { font-size: 2rem; }
          .recommend .sub { font-size: 1rem; }
          
          .container { padding: 0 1rem; }
        }
        
        @media (max-width: 480px) {
          .hero h1 { font-size: 2rem; }
          .logo { font-size: 1.1rem; }
          .footer { padding: 3rem 0 0; }
        }
      `}</style>
    </div>
  );
}