
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="mt-4">Oops! The page you are looking for does not exist.</p>
      <Link to="/" className="mt-4 text-blue-500 underline">
        Go Back to Home
      </Link>
    </div>
  );
};

export default PageNotFound;
