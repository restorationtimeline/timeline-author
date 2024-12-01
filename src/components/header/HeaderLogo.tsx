import { Link } from "react-router-dom";

export const HeaderLogo = () => (
  <Link 
    to="/" 
    className="text-foreground font-semibold text-lg md:text-xl hover:text-foreground/90 transition-colors"
  >
    Restoration Timeline
  </Link>
);