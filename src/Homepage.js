import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Homepage.css';
import Modal from './components/Modal';

import EventsGrid from './components/EventsGrid';
import './css/modules/EventCard.css';
import './css/modules/team.module.css'; //team section css

// Import Social Icons
import Github from './images/github.png';
import Linkedin from './images/linkedin.png';
import Email from './images/email.png';

const Homepage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rsvpStatus, setRsvpStatus] = useState({});
    const [currentEvent, setCurrentEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [team, setTeam] = useState([]);
    const [error, setError] = useState(null);
    const user = null;

    /* PURPOSE: Fetch Events Data */
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:4000/regularevents');
                const data = await response.json();
                
                //sort events by date (newest first)
                const sortedEvents = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                //get the 4 most recent events
                setEvents(sortedEvents.slice(0, 4));
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    //smooth scrolling for navigation
    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    /* TEAM DATA */
    useEffect(() => {
        const fetchOfficers = async () => {
            try {
                const response = await fetch('/api/officers');
                if (!response.ok) {
                    throw new Error('Failed to fetch officers');
                }
                const data = await response.json();
                setTeam(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOfficers();
    }, []);
    
    /* PARTNERS DATA */
    const partners = [
        { name: 'JPMorgan Chase', logo: '#' },
        { name: 'AT&T', logo: '#' },
        { name: 'American Airlines', logo: '#' },
        { name: 'State Farm', logo: '#' }, 
        { name: 'Core Logic', logo: '#' },
        { name: 'Cisco', logo: '#' },
        { name: 'McAfee', logo: '#' },
        { name: 'Allstate', logo: '#' },
        { name: 'Intuit', logo: '#' },
        { name: 'Celanese', logo: '#' },
        { name: 'Fannie Mae', logo: '#' },
        { name: 'USAA', logo: '#' },
        { name: 'Blue Yonder', logo: '#' },
        { name: 'CBRE', logo: '#' }
    ];

    return (
        <div className="homepage">
            {/* --- NAVBAR --- */}
            <nav className="navbar">
                <div className="navbar__logo">Women Who Compute</div>
                <div className="navbar__links">
                    <button onClick={() => scrollTo('header')}>Home</button>
                    <button onClick={() => scrollTo('events')}>Events</button>
                    <button onClick={() => scrollTo('values')}>What We Offer</button>
                    <button onClick={() => scrollTo('team')}>Team</button>
                    <button onClick={() => scrollTo('partners')}>Partners</button>
                    <button 
                        className="navbar__login-button"
                        onClick={() => navigate('/login')}
                    >
                        Member Portal
                    </button>
                </div>
            </nav>

            {/* --- HEADER --- */}
            <section id="header" className="section section--header">
                <div className="header__content">
                    <h1>Empowering the Future of Tech</h1>
                    <p>At Women Who Compute, we are dedicated to the empowerment and advancement of women in engineering and computer science.</p>
                </div>
            </section>

            {/* --- EVENTS --- */}
            <section id="events" className="section section--events">
                <EventsGrid
                    title="Events"
                    events={events.slice(0, 4)}
                    user={user}
                    navigate={navigate}
                    rsvpStatus={rsvpStatus}
                    setRsvpStatus={setRsvpStatus}
                    setCurrentEvent={setCurrentEvent}
                    setIsModalOpen={setIsModalOpen}
                    showButtons={true}

                    showViewAll={true}
                    onViewAllClick={() => navigate('/login')}
                />
            </section>

            {/* --- VALUES --- */}
            <section id="values" className="section section--values">
                <h2>What We Offer</h2>
                <div className="values__grid">
                    <div className="value-card">
                        <h3>Speed Mentoring</h3>
                        <p>Join our networking event armed with your resume, blazer, and elevator pitch to engage with Dallas' top engineers and recruiters for securing high-profile internships and jobs.</p>
                    </div>
                    <div className="value-card">
                        <h3>Technical Workshops</h3>
                        <p>Through our technical workshops, led by industry engineers, we enhance students' programming skills for better career prospects.</p>
                    </div>
                    <div className="value-card">
                        <h3>Career Talks</h3>
                        <p>Explore the corporate engineering world through our career talks and the nature of work in diverse companies.</p>
                    </div>
                    <div className="value-card">
                        <h3>WeHack</h3>
                        <p>WeHack at UTD: Empowering underrepresented tech innovators to build skills and solve complex problems through our women and non-binary focused hackathon.</p>
                    </div>
                </div>
            </section>

            {/* --- TEAM SECTION --- */}
            <section id="team" className="section section--team">
                <div className="team-header">
                    <div className="top-line"></div>
                    <div className="scroll-text">Meet Our Team</div>
                    <div className="bottom-line"></div>
                </div>

                {loading ? (
                    <div className="loading-message">Loading team members...</div>
                ) : error ? (
                    <div className="error-message">Error: {error}</div>
                ) : (
                    <div className="team-grid-container">
                        {team.map((officer, index) => (
                            <div key={officer._id || index} className="team-card">
                                <div className="team-image-container">
                                    <img 
                                        src={officer.imageUrl || 'default-officer-image.jpg'} 
                                        alt={officer.name} 
                                        className="team-image"
                                    />
                                    <div className="team-social-links">
                                        {officer.github && (
                                            <a href={officer.github} target="_blank" rel="noopener noreferrer">
                                                <img src={Github} className="social-icon" alt="github"/>
                                            </a>
                                        )}
                                        {officer.linkedin && (
                                            <a href={officer.linkedin} target="_blank" rel="noopener noreferrer">
                                                <img src={Linkedin} className="social-icon" alt="linkedin"/>
                                            </a>
                                        )}
                                        {officer.email && (
                                            <a href={`mailto:${officer.email}`} target="_blank" rel="noopener noreferrer">
                                                <img src={Email} className="social-icon" alt="email"/>
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="team-info">
                                    <h3 className="team-name">{officer.name}</h3>
                                    <p className="team-position">{officer.position}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* --- PARTNERS --- */}
            <section id="partners" className="section section--partners">
                <h2>Our Partners</h2>
                <div className="partners__grid">
                    {partners.map((partner, index) => (
                        <div key={index} className="partner-logo">
                            {partner.name}
                        </div>
                    ))}
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="footer">
                <div className="footer__content">
                    <div className="footer__info">
                        <h3>Women Who Compute</h3>
                        <p>University of Texas at Dallas</p>
                        <p>Richardson, TX</p>
                    </div>
                    <div className="footer__links">
                        <a href="#header">Home</a>
                        <a href="#events">Events</a>
                        <a href="#values">What We Offer</a>
                        <a href="#team">Team</a>
                        <a href="#partners">Partners</a>
                    </div>
                </div>
                <div className="footer__copyright">
                    © {new Date().getFullYear()} Women Who Compute
                </div>
            </footer>
        </div>
    );
};

export default Homepage;