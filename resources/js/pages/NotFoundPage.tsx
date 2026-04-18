import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

const NotFoundPage: FC = () => {
    usePageTitle('Page not found');

    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-green-50 via-gray-50 to-amber-50">
            <div className="flex flex-col items-center w-full max-w-md gap-4 py-10 text-center bg-white border border-gray-200 shadow-lg rounded-2xl px-9">
                <svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    fill="none"
                    aria-hidden="true"
                >
                    <circle cx="32" cy="32" r="30" stroke="#1d9e75" strokeWidth="2.5" />
                    <text
                        x="32"
                        y="40"
                        textAnchor="middle"
                        fontSize="18"
                        fontWeight="700"
                        fontFamily="system-ui, -apple-system, sans-serif"
                        fill="#1d9e75"
                    >
                        404
                    </text>
                </svg>
                <h1 className="m-0 text-2xl font-bold text-gray-900">
                    Page not found
                </h1>
                <p className="m-0 text-sm leading-relaxed text-gray-500">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    to="/"
                    className="mt-2 px-6 py-2.5 bg-brand text-white rounded-lg text-sm font-semibold no-underline transition-all duration-150 hover:brightness-110"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
