const Footer = () => {
  return (
    <footer className="bg-footer-background border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* Company Group Info */}
          <div className="mb-6">
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-primary">
                Welcome To GoLocalSG.com!
              </h2>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3">
              Sister platforms offering services across Thailand and Malaysia.
            </p>
            
            {/* Service Logos */}
            <div className="flex items-center justify-center space-x-6 mb-4">
              <span className="text-sm font-medium text-primary">YaYou App</span>
              
              <span className="text-sm text-muted-foreground">|</span>
              
              <a 
                href="https://www.booknget.asia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline"
              >
                <span className="text-muted-foreground">BooknGet</span>
                <span className="text-green-600">.asia</span>
              </a>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              GoLocalSG.com is your AI-powered platform and mobile app for booking services, offering your own services to earn money, discovering products, and managing your business online.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;