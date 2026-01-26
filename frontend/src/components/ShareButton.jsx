import React, { useState } from 'react';
import styles from '../styles/ShareButton.module.css';
import btnStyles from '../styles/Button.module.css';

const ShareButton = ({
    puzzleType = 'puzzle',
    difficulty = '',
    time = '',
    message = '',
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [copied, setCopied] = useState(false);

    const siteUrl = 'https://fruzzled.ie';

    const getShareText = () => {
        if (message) return message;

        let text = `I just completed a ${puzzleType}`;
        if (difficulty) text += ` (${difficulty})`;
        if (time) text += ` in ${time}`;
        text += ` on Fruzzled!`;
        return text;
    };

    const shareText = getShareText();
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(siteUrl);

    const handleTwitterShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
        setShowDropdown(false);
    };

    const handleFacebookShare = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        window.open(facebookUrl, '_blank', 'width=550,height=420');
        setShowDropdown(false);
    };

    const handleCopyLink = async () => {
        const fullText = `${shareText} ${siteUrl}`;
        try {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        setShowDropdown(false);
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Fruzzled',
                    text: shareText,
                    url: siteUrl,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            setShowDropdown(!showDropdown);
        }
    };

    return (
        <div className={styles.ShareContainer}>
            <button
                className={`${btnStyles.Button} ${styles.ShareButton}`}
                onClick={handleNativeShare}
                aria-label="Share your result"
            >
                <i className="fa-solid fa-share-nodes"></i>
                <span className="ml-2">Share</span>
            </button>

            {showDropdown && (
                <div className={styles.Dropdown}>
                    <button
                        className={styles.DropdownItem}
                        onClick={handleTwitterShare}
                    >
                        <i className="fa-brands fa-x-twitter"></i>
                        <span>Twitter/X</span>
                    </button>
                    <button
                        className={styles.DropdownItem}
                        onClick={handleFacebookShare}
                    >
                        <i className="fa-brands fa-facebook"></i>
                        <span>Facebook</span>
                    </button>
                    <button
                        className={styles.DropdownItem}
                        onClick={handleCopyLink}
                    >
                        <i className={copied ? "fa-solid fa-check" : "fa-solid fa-copy"}></i>
                        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShareButton;
