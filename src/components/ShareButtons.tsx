import { MessageCircle, Linkedin, Link2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

const ShareButtons = ({ url, title, description }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // X (Twitter) Icon SVG
  const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  const buttons = [
    { 
      name: 'WhatsApp', 
      icon: MessageCircle, 
      url: shareLinks.whatsapp, 
      color: 'hover:bg-[#25D366] hover:text-white',
      bgColor: 'bg-[#25D366]/10',
      textColor: 'text-[#25D366]'
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      url: shareLinks.linkedin, 
      color: 'hover:bg-[#0A66C2] hover:text-white',
      bgColor: 'bg-[#0A66C2]/10',
      textColor: 'text-[#0A66C2]'
    },
    { 
      name: 'X', 
      icon: XIcon, 
      url: shareLinks.x, 
      color: 'hover:bg-black hover:text-white',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-900'
    },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-muted-foreground">Share:</span>
      
      {/* Social Share Buttons */}
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <div key={button.name} className="relative group/tooltip">
            <a
              href={button.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 flex items-center justify-center rounded-full ${button.bgColor} ${button.textColor} ${button.color} transition-all duration-300 hover:scale-110 hover:shadow-lg`}
              aria-label={`Share on ${button.name}`}
            >
              <Icon className="w-4 h-4" />
            </a>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Share on {button.name}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        );
      })}

      {/* Copy Link Button */}
      <div className="relative group/tooltip">
        <button
          onClick={handleCopyLink}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-700 hover:text-white'
          }`}
          aria-label="Copy link"
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {copied ? 'Copied!' : 'Copy link'}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default ShareButtons;
