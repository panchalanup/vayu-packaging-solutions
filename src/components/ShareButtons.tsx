import { MessageCircle, Linkedin, Twitter } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
}

const ShareButtons = ({ url, title, description }: ShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const buttons = [
    { name: 'WhatsApp', icon: MessageCircle, url: shareLinks.whatsapp, color: 'hover:bg-green-600' },
    { name: 'LinkedIn', icon: Linkedin, url: shareLinks.linkedin, color: 'hover:bg-blue-700' },
    { name: 'Twitter', icon: Twitter, url: shareLinks.twitter, color: 'hover:bg-blue-500' },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-muted-foreground">Share:</span>
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <a
            key={button.name}
            href={button.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-secondary-foreground ${button.color} hover:text-white transition-all duration-300 hover:scale-110`}
            aria-label={`Share on ${button.name}`}
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
};

export default ShareButtons;
