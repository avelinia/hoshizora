import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface PageTransitionProps {
    children: React.ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
    const location = useLocation();
    const { currentTheme } = useTheme();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{
                    opacity: 0,
                    scale: 0.98
                }}
                animate={{
                    opacity: 1,
                    scale: 1
                }}
                exit={{
                    opacity: 0,
                    scale: 1.02,
                    transition: {
                        duration: 0.1,
                        ease: "easeIn"
                    }
                }}
                transition={{
                    duration: 0.2,
                    ease: "easeOut"
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    backgroundColor: currentTheme.colors.background.main
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

export default PageTransition;