"use client";

import { useState, useEffect, useRef } from "react";

export default function AnimatedCounter({ value }: { value: number }) {
    const ref = useRef(null);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const duration = 2000;
            const steps = 60;
            const increment = value / steps;
            let current = 0;

            const counter = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setCount(value);
                    clearInterval(counter);
                } else {
                    setCount(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(counter);
        }, 500);

        return () => clearTimeout(timer);
    }, [value]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
}
