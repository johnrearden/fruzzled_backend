import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    path = '',
    type = 'website'
}) => {
    const siteUrl = 'https://fruzzled.ie';
    const fullUrl = `${siteUrl}${path}`;
    const fullTitle = title ? `${title} | Fruzzled` : 'Fruzzled - Free Online Sudoku & Crossword Puzzles';
    const defaultDescription = 'Play free sudoku and crossword puzzles online at Fruzzled. Challenge yourself with puzzles ranging from easy to expert difficulty.';

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph */}
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:type" content={type} />

            {/* Twitter */}
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
        </Helmet>
    );
};

export default SEO;
