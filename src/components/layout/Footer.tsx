import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">Help Centre</a></li>
              <li><a href="#" className="hover:underline">AirCover</a></li>
              <li><a href="#" className="hover:underline">Anti-discrimination</a></li>
              <li><a href="#" className="hover:underline">Disability support</a></li>
              <li><a href="#" className="hover:underline">Cancellation options</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">StayEase.org: disaster relief</a></li>
              <li><a href="#" className="hover:underline">Support: Afghan refugees</a></li>
              <li><a href="#" className="hover:underline">Celebrating diversity</a></li>
              <li><a href="#" className="hover:underline">StayEase Associates</a></li>
              <li><a href="#" className="hover:underline">Guest referrals</a></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Hosting</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/host" className="hover:underline">Host your hotel</Link></li>
              <li><a href="#" className="hover:underline">AirCover for Hosts</a></li>
              <li><a href="#" className="hover:underline">Explore hosting resources</a></li>
              <li><a href="#" className="hover:underline">Visit our community forum</a></li>
              <li><a href="#" className="hover:underline">How to host responsibly</a></li>
            </ul>
          </div>

          {/* StayEase */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">StayEase</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:underline">Newsroom</a></li>
              <li><a href="#" className="hover:underline">Learn about features</a></li>
              <li><a href="#" className="hover:underline">Letter from our founders</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Investors</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <span>© {year} StayEase, Inc.</span>
            <span>·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:underline">Terms</a>
            <span>·</span>
            <a href="#" className="hover:underline">Sitemap</a>
            <span>·</span>
            <a href="#" className="hover:underline">Company details</a>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-700 font-semibold">
            <button className="flex items-center gap-1 hover:underline">
              <Globe size={14} />
              English (IN)
            </button>
            <button className="hover:underline">₹ INR</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
