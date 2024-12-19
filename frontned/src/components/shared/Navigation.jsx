import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/listings">Listings</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/admin">Admin</Link>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </nav>
  );
};

export default Navigation;
