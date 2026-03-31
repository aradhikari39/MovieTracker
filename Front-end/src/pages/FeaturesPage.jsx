import { useNavigate } from 'react-router-dom';
import '../css/FeaturesPage.css';

const features = [
    { title: 'User Polls', clickable: true, path: '/polls' },
    { title: 'Movie Quiz', clickable: false },
    { title: 'Daily Challenge', clickable: false },
    { title: 'Movie Battles', clickable: false },
    { title: 'Guess the Poster', clickable: false },
    { title: 'Random: Did You Know ?', clickable: false },
];

export default function FeaturesPage() {
    const navigate = useNavigate();

    return (
        <div className="page-shell">
            <h1 className="page-title features-page__title">Features</h1>
            <p>Only User Polls is active for now. Other features will come later.</p>

            <div className="grid-auto features-page__grid">
                {features.map((feature) => (
                    <button
                        key={feature.title}
                        onClick={() => feature.clickable && navigate(feature.path)}
                        disabled={!feature.clickable}
                        className="feature-card features-page__card"
                    >
                        <h2>{feature.title}</h2>
                        <p>
                            {feature.clickable
                                ? 'Available now'
                                : 'Coming in a future update'}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
