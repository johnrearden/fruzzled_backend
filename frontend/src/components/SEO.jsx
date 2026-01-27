import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    path = '',
    type = 'website',
    breadcrumbs = null
}) => {
    const siteUrl = 'https://fruzzled.ie';
    const fullUrl = `${siteUrl}${path}`;
    const fullTitle = title ? `${title} | Fruzzled` : 'Fruzzled - Free Online Sudoku & Crossword Puzzles';
    const defaultDescription = 'Play free sudoku and crossword puzzles online at Fruzzled. Challenge yourself with puzzles ranging from easy to expert difficulty.';

    // Generate BreadcrumbList JSON-LD schema
    const getBreadcrumbSchema = () => {
        if (!breadcrumbs || breadcrumbs.length === 0) {
            // Default breadcrumb: Home > Current Page
            const defaultBreadcrumbs = [
                { name: 'Home', url: siteUrl }
            ];
            if (path && path !== '/') {
                defaultBreadcrumbs.push({
                    name: title || 'Page',
                    url: fullUrl
                });
            }
            return generateBreadcrumbSchema(defaultBreadcrumbs);
        }
        return generateBreadcrumbSchema(breadcrumbs);
    };

    const generateBreadcrumbSchema = (items) => {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            }))
        };
    };

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

            {/* BreadcrumbList Schema */}
            <script type="application/ld+json">
                {JSON.stringify(getBreadcrumbSchema())}
            </script>
        </Helmet>
    );
};

export default SEO;
