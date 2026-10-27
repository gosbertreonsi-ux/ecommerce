import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Container from "./Container";

function Footer() {
  return (
    <footer className="esh-footer">
      <Container>
        <div className="esh-footer__main">
          <div className="esh-footer__intro">
            <Link to="/" className="esh-footer__brand">E-Shop.</Link>
            <p>A considered collection for everyday life. Find what matters. Love what you find.</p>
          </div>
          <div className="esh-footer__links">
            <div>
              <h2>Discover</h2>
              <Link to="/products">Shop all products</Link>
              <Link to="/">Home</Link>
              <Link to="/cart">Your basket</Link>
            </div>
            <div>
              <h2>Account</h2>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create an account</Link>
              <Link to="/orders">Order history</Link>
            </div>
          </div>
        </div>
        <div className="esh-footer__bottom">
          <span>© {new Date().getFullYear()} E-Shop. All rights reserved.</span>
          <Link to="/products">Find something beautiful <ArrowUpRight size={15} aria-hidden="true" /></Link>
          <span>Prices in Tanzanian shillings (TZS)</span>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
