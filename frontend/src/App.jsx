import NavBar from './components/NavBar';
import styles from "./App.module.css";
import Container from 'react-bootstrap/Container';
import './api/axiosDefaults';
import SignUpForm from './pages/auth/SignUpForm';
import SignInForm from './pages/auth/SignInForm';
import NotFound from './components/NotFound';
import Home from './pages/puzzle/Home';
import PuzzleContainer from './pages/puzzle/PuzzleContainer';
import { useTheme } from './contexts/ThemeContext';

import themes from './styles/Themes.module.css';
import Leaderboard from './pages/puzzle/Leaderboard';
import { Routes, Route } from 'react-router-dom';


function App() {

    const theme = useTheme();
    const themeStyles = theme === 'light' ? themes.lightTheme : themes.darkTheme;

    return (
        <div className={`${themeStyles} ${styles.App}`}>
            <NavBar />
            <Container className={styles.Main}>
                <Routes>
                    <Route
                        path="/get_puzzle/:difficulty"
                        element={ <PuzzleContainer /> } />
                    <Route path="/leaderboard/:id" element={ <Leaderboard /> }/>
                    <Route path="/signin" element={ <SignInForm />} />
                    <Route path="/signup" element={ <SignUpForm /> } />
                    <Route
                        path="/"
                        element={ <Home /> } />
                    <Route element={ <NotFound /> } />
                </Routes>
            </Container>
        </div>
    );
}

export default App;